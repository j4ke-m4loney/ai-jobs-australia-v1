import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const POSTMARK_SERVER_TOKEN = Deno.env.get('POSTMARK_SERVER_TOKEN')

interface WebhookPayload {
  type: 'email_change' | 'signup' | 'recovery' | 'invite' | 'magiclink'
  email: string
  token_hash: string
  token_hash_new?: string
  redirect_to: string
  email_action_type: 'email_change' | 'signup' | 'recovery' | 'invite' | 'magiclink'
  site_url: string
  token_new?: string
  token: string
  user: {
    id: string
    email: string
    email_new?: string
    created_at: string
    confirmed_at?: string
    last_sign_in_at?: string
    role: string
    updated_at: string
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: WebhookPayload = await req.json()
    
    // Only handle email change events
    if (payload.email_action_type !== 'email_change') {
      return new Response(
        JSON.stringify({ message: 'Not an email change event' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // For email changes, we want to send confirmation only to the OLD email address
    // This is the current email that the user is changing FROM
    const confirmationEmail = payload.user.email // This is the old email
    const newEmail = payload.user.email_new || payload.email // This is the new email they want to change to
    
    if (!confirmationEmail || !newEmail) {
      throw new Error('Missing email addresses for email change confirmation')
    }

    // Use the token for the new email to verify the change
    // According to Supabase docs, when secure email change is enabled,
    // token_hash_new is for the new email verification
    const verificationToken = payload.token_new || payload.token
    const tokenHash = payload.token_hash_new || payload.token_hash

    // Create confirmation URL that will verify the email change
    const confirmUrl = `${payload.site_url}/auth/confirm?token_hash=${tokenHash}&type=email_change&redirect_to=${encodeURIComponent(payload.redirect_to)}`

    // Prepare email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm Email Change - AI Jobs Australia</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AI Jobs Australia</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Email Change Confirmation</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea;">
            <h2 style="color: #333; margin-top: 0;">Confirm Your Email Change</h2>
            <p>You have requested to change your email address from:</p>
            <p style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
              <strong>From:</strong> ${confirmationEmail}<br>
              <strong>To:</strong> ${newEmail}
            </p>
            <p>To complete this change, please click the button below to confirm from your current email address:</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-weight: bold; 
                      display: inline-block;
                      font-size: 16px;">
              Confirm Email Change
            </a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>Security Note:</strong> This confirmation email was sent to your current email address for security. 
              After confirmation, you'll need to use your new email address (${newEmail}) to sign in.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>If you didn't request this email change, please ignore this email or contact our support team.</p>
            <p>This link will expire in 24 hours for security reasons.</p>
          </div>
        </body>
      </html>
    `

    const emailText = `
      AI Jobs Australia - Email Change Confirmation
      
      You have requested to change your email address from ${confirmationEmail} to ${newEmail}.
      
      To complete this change, please click the link below to confirm from your current email address:
      ${confirmUrl}
      
      Security Note: This confirmation email was sent to your current email address for security. After confirmation, you'll need to use your new email address (${newEmail}) to sign in.
      
      If you didn't request this email change, please ignore this email or contact our support team.
      This link will expire in 24 hours for security reasons.
    `

    // Send email using Postmark
    if (!POSTMARK_SERVER_TOKEN) {
      throw new Error('POSTMARK_SERVER_TOKEN is not configured')
    }

    const res = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_SERVER_TOKEN,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        From: 'AI Jobs Australia <noreply@aijobsaustralia.com.au>',
        To: confirmationEmail, // Send only to the OLD email address
        Subject: 'Confirm Your Email Change - AI Jobs Australia',
        HtmlBody: emailHtml,
        TextBody: emailText,
        Tag: 'email-change',
        TrackOpens: true,
        TrackLinks: 'TextOnly',
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    const data = await res.json()
    console.log('Email sent successfully:', data)

    return new Response(
      JSON.stringify({ 
        message: 'Email change confirmation sent to old email address',
        email_sent_to: confirmationEmail,
        new_email: newEmail
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in send-email-hook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})