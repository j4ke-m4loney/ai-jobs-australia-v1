import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailService } from '@/lib/email/postmark-service';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

// Validation schema using Zod
const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  // Anti-bot fields
  honeypot: z.string().optional(),
  formTimestamp: z.number().optional(),
});

// Simple input sanitization to prevent XSS
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Detect spam patterns in message
function detectSpam(message: string): boolean {
  // Check for excessive URLs
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = message.match(urlPattern) || [];
  if (urls.length > 2) {
    return true;
  }

  // Common spam keywords
  const spamKeywords = [
    'cialis', 'viagra', 'casino', 'lottery', 'winner',
    'click here now', 'buy now', 'limited time offer',
    'make money fast', 'work from home'
  ];

  const lowerMessage = message.toLowerCase();
  const spamCount = spamKeywords.filter(keyword => lowerMessage.includes(keyword)).length;

  if (spamCount >= 2) {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request.headers);

    // Rate limiting check (3 submissions per hour per IP)
    const rateLimitResult = checkRateLimit(clientIP, 3, 60 * 60 * 1000);

    if (!rateLimitResult.success) {
      const minutesUntilReset = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000);

      console.log(`⚠️ Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        {
          error: 'Too many submissions',
          message: `You've reached the maximum number of contact form submissions. Please try again in ${minutesUntilReset} minutes.`,
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 }
      );
    }

    const data = await request.json();

    // Honeypot check - if filled, it's a bot
    if (data.honeypot && data.honeypot.length > 0) {
      console.log(`🤖 Bot detected via honeypot for IP: ${clientIP}`);
      // Return success to not alert the bot
      return NextResponse.json({
        success: true,
        message: 'Your message has been sent successfully',
      });
    }

    // Timing check - form must be open for at least 3 seconds
    if (data.formTimestamp) {
      const timeTaken = Date.now() - data.formTimestamp;
      if (timeTaken < 3000) {
        console.log(`⚠️ Form submitted too quickly (${timeTaken}ms) for IP: ${clientIP}`);
        return NextResponse.json(
          { error: 'Please take your time filling out the form' },
          { status: 400 }
        );
      }
    }

    // Validate input using Zod schema
    const validationResult = contactFormSchema.safeParse(data);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      console.log(`❌ Validation error: ${firstError.message}`);
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: firstError.message,
          field: firstError.path[0],
        },
        { status: 400 }
      );
    }

    const validData = validationResult.data;

    // Spam detection
    if (detectSpam(validData.message)) {
      console.log(`🚫 Spam detected in message from IP: ${clientIP}`);
      return NextResponse.json(
        {
          error: 'Your message appears to contain spam or suspicious content',
          message: 'Please remove any promotional content or excessive links and try again.',
        },
        { status: 400 }
      );
    }

    // Sanitize inputs to prevent XSS
    const sanitizedData = {
      firstName: sanitizeInput(validData.firstName.trim()),
      lastName: sanitizeInput(validData.lastName.trim()),
      email: validData.email.trim().toLowerCase(),
      subject: sanitizeInput(validData.subject.trim()),
      message: sanitizeInput(validData.message.trim()),
    };

    // Send email via Postmark
    const emailSent = await emailService.sendContactFormEmail(sanitizedData);

    if (emailSent) {
      console.log(`✅ Contact form email sent from ${sanitizedData.email} (IP: ${clientIP})`);
      return NextResponse.json({
        success: true,
        message: 'Your message has been sent successfully',
      });
    } else {
      console.error('❌ Failed to send contact form email');
      return NextResponse.json(
        {
          error: 'Failed to send email',
          message: 'We encountered an error sending your message. Please try again later or email us directly.',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in contact form API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
