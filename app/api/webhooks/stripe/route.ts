import { NextRequest, NextResponse } from 'next/server';
import { stripe, WEBHOOK_EVENTS } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { JobFormData2 } from '@/types/job2';
import { emailService } from '@/lib/email/postmark-service';
import { getSiteUrl } from '@/lib/utils/get-site-url';
import { triggerAIFocusAnalysis } from '@/lib/ai-focus/trigger-analysis';

// Type definitions for webhook data
interface PaymentRecord {
  id: string;
  user_id: string;
  pricing_tier: 'standard' | 'featured' | 'annual';
  amount: number;
  currency: string;
}

interface PaymentSession {
  id: string;
  user_id: string;
  stripe_session_id: string;
  pricing_tier: 'standard' | 'featured' | 'annual';
  amount: number;
  currency: string;
  job_form_data: JobFormData2;
}

// Helper function to create Supabase admin client (avoids build-time initialization)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED:
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case WEBHOOK_EVENTS.CHECKOUT_SESSION_EXPIRED:
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;

      case WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case WEBHOOK_EVENTS.PAYMENT_INTENT_PAYMENT_FAILED:
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout session completed:', session.id);

  // Get payment session from database
  const { data: paymentSession, error: sessionError } = await getSupabaseAdmin()
    .from('payment_sessions')
    .select('*')
    .eq('stripe_session_id', session.id)
    .single();

  if (sessionError || !paymentSession) {
    console.error('Payment session not found:', sessionError);
    throw new Error('Payment session not found');
  }

  // Update payment session status
  const { error: updateError } = await getSupabaseAdmin()
    .from('payment_sessions')
    .update({ status: 'completed' })
    .eq('id', paymentSession.id);

  if (updateError) {
    console.error('Error updating payment session:', updateError);
    throw new Error('Failed to update payment session');
  }

  // Create payment record
  const { data: payment, error: paymentError } = await getSupabaseAdmin()
    .from('payments')
    .insert({
      user_id: paymentSession.user_id,
      payment_session_id: paymentSession.id,
      stripe_payment_intent_id: session.payment_intent as string,
      pricing_tier: paymentSession.pricing_tier,
      amount: paymentSession.amount,
      currency: paymentSession.currency,
      status: 'succeeded',
      payment_method_type: 'card',
      metadata: {
        stripe_session_id: session.id,
        customer_id: session.customer,
      },
    })
    .select()
    .single();

  if (paymentError || !payment) {
    console.error('Error creating payment record:', paymentError);
    throw new Error('Failed to create payment record');
  }

  // Create job posting
  await createJobFromPayment(payment, paymentSession);

  // For annual subscriptions, also create/update subscription record
  if (paymentSession.pricing_tier === 'annual' && session.subscription) {
    await handleAnnualSubscription(session, paymentSession);
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log('Processing checkout session expired:', session.id);

  // Update payment session status
  const { error } = await getSupabaseAdmin()
    .from('payment_sessions')
    .update({ status: 'expired' })
    .eq('stripe_session_id', session.id);

  if (error) {
    console.error('Error updating expired payment session:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing payment intent succeeded:', paymentIntent.id);

  // Update payment record
  const { error } = await getSupabaseAdmin()
    .from('payments')
    .update({
      status: 'succeeded',
      stripe_charge_id: paymentIntent.latest_charge as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      receipt_url: (paymentIntent as any).charges?.data?.[0]?.receipt_url || null,
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Error updating payment record:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing payment intent failed:', paymentIntent.id);

  // Update payment record
  const { error } = await getSupabaseAdmin()
    .from('payments')
    .update({ status: 'failed' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Error updating failed payment record:', error);
  }
}

async function createJobFromPayment(payment: PaymentRecord, paymentSession: PaymentSession) {
  const jobFormData = paymentSession.job_form_data;
  const isFeatured = ['featured', 'annual'].includes(payment.pricing_tier);

  // Handle company creation/linking first
  let companyId = null;
  if (jobFormData.companyName && jobFormData.companyName.trim()) {
    const { data: existingCompany } = await getSupabaseAdmin()
      .from('companies')
      .select('id')
      .eq('name', jobFormData.companyName.trim())
      .maybeSingle();

    if (existingCompany) {
      companyId = existingCompany.id;
    } else {
      const { data: companyData, error: companyError } = await getSupabaseAdmin()
        .from('companies')
        .insert({
          name: jobFormData.companyName.trim(),
          description: jobFormData.companyDescription?.trim() || null,
          website: jobFormData.companyWebsite?.trim() || null,
          logo_url: null, // TODO: Handle logo upload
        })
        .select()
        .single();

      if (!companyError && companyData) {
        companyId = companyData.id;
      }
    }
  }

  // Map the job form data to database schema
  const jobRecord = {
    employer_id: payment.user_id,
    payment_id: payment.id,
    company_id: companyId,
    title: jobFormData.jobTitle,
    description: jobFormData.jobDescription,
    requirements: jobFormData.requirements || null,
    location: jobFormData.locationAddress,
    location_type: mapLocationType(jobFormData.locationType),
    job_type: mapJobType(jobFormData.jobTypes[0]), // Use first selected type for DB compatibility
    category: 'ai', // Default category
    salary_min: getSalaryMin(jobFormData.payConfig),
    salary_max: getSalaryMax(jobFormData.payConfig),
    salary_period: jobFormData.payConfig?.payPeriod || 'year',
    show_salary: jobFormData.payConfig.showPay,
    application_method: jobFormData.applicationMethod === 'indeed' ? 'external' : jobFormData.applicationMethod,
    application_url: jobFormData.applicationMethod === 'indeed' ? null : jobFormData.applicationUrl,
    application_email: jobFormData.applicationMethod === 'email' ? jobFormData.applicationEmail : null,
    is_featured: isFeatured,
    featured_until: isFeatured ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : null, // 3 days from now
    featured_order: isFeatured ? Math.floor(Date.now() / 1000) : 0, // Use timestamp for ordering
    highlights: jobFormData.highlights || [],
    status: 'pending_approval', // Jobs require admin approval before going live
    payment_status: 'completed', // Payment succeeded via Stripe webhook
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  };

  // Insert the job into the database
  const { data: job, error: jobError } = await getSupabaseAdmin()
    .from('jobs')
    .insert(jobRecord)
    .select()
    .single();

  if (jobError) {
    console.error('Error creating job:', jobError);
    throw new Error('Failed to create job posting');
  }

  console.log('Job created successfully:', job.id);

  // Send job submission confirmation email to employer
  console.log('📧 Attempting to send job submission confirmation email...');
  console.log('📧 Payment user_id:', payment.user_id);
  console.log('📧 Job ID:', job.id);

  try {
    // Get employer's email from auth.users table (where emails are actually stored)
    const { data: userData, error: userError } = await getSupabaseAdmin()
      .auth.admin.getUserById(payment.user_id);

    console.log('📧 User data lookup:', {
      hasUser: !!userData,
      email: userData?.user?.email,
      error: userError
    });

    // Get employer's profile for the name
    const { data: employerProfile, error: profileError } = await getSupabaseAdmin()
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', payment.user_id)
      .single();

    console.log('📧 Employer profile lookup:', {
      hasProfile: !!employerProfile,
      firstName: employerProfile?.first_name,
      lastName: employerProfile?.last_name,
      error: profileError
    });

    const employerEmail = userData?.user?.email;

    if (!userError && employerEmail) {
      // Job submission confirmations are transactional emails - always send them
      // (Users can't opt out of transactional emails, only marketing/notification emails)
      console.log('📧 Sending job submission confirmation (transactional email)');

      if (true) { // Always send job submission confirmations
        console.log('📧 Sending email with data:', {
          jobTitle: jobFormData.jobTitle,
          companyName: jobFormData.companyName,
          location: jobFormData.locationAddress || `${jobFormData.locationSuburb}, ${jobFormData.locationState}`,
          pricingTier: payment.pricing_tier
        });

        const employerName = employerProfile?.first_name && employerProfile?.last_name
          ? `${employerProfile.first_name} ${employerProfile.last_name}`.trim()
          : employerProfile?.first_name || employerProfile?.last_name || 'Employer';

        const emailResult = await emailService.sendJobSubmissionConfirmation({
          employerName,
          employerEmail: employerEmail,
          jobTitle: jobFormData.jobTitle,
          jobId: job.id,
          companyName: jobFormData.companyName,
          location: jobFormData.locationAddress || `${jobFormData.locationSuburb}, ${jobFormData.locationState}`,
          pricingTier: payment.pricing_tier,
          dashboardUrl: `${getSiteUrl()}/employer/jobs/${job.id}`
        });

        console.log('✅ Job submission confirmation email sent to employer:', employerEmail);
        console.log('✅ Email service result:', emailResult);
      } else {
        console.log('⚠️ Email not sent - preferences disabled');
      }
    } else {
      console.log('⚠️ Email not sent - no employer email found or user lookup failed:', {
        hasEmail: !!employerEmail,
        userError
      });
    }
  } catch (emailError) {
    console.error('❌ Failed to send job submission confirmation email:', emailError);
    // Don't fail the webhook if email fails - job was created successfully
  }

  // Trigger AI Focus analysis asynchronously (non-blocking)
  triggerAIFocusAnalysis(
    job.id,
    jobFormData.jobTitle,
    jobFormData.jobDescription,
    jobFormData.requirements
  ).catch((error) => {
    console.error('AI Focus analysis trigger failed:', error);
  });

  return job;
}

async function handleAnnualSubscription(session: Stripe.Checkout.Session, paymentSession: PaymentSession) {
  if (!session.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  // Create or update subscription record
  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .upsert({
      user_id: paymentSession.user_id,
      plan_type: 'annual',
      status: subscription.status === 'active' ? 'active' as const : subscription.status === 'canceled' ? 'cancelled' as const : subscription.status === 'past_due' ? 'past_due' as const : 'trialing' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      price_per_month: paymentSession.amount,
      features: {
        unlimited_postings: true,
        featured_jobs: true,
        priority_support: true,
      },
      metadata: {
        pricing_tier: 'annual',
      },
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error creating/updating subscription:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing subscription created:', subscription.id);

  // Check if this is an intelligence subscription
  const planType = subscription.metadata?.plan_type;
  const userId = subscription.metadata?.user_id;

  if (planType === 'intelligence' && userId) {
    console.log('Creating intelligence subscription for user:', userId);

    const { error } = await getSupabaseAdmin()
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_type: 'intelligence',
        status: subscription.status === 'active' ? 'active' as const : subscription.status === 'canceled' ? 'cancelled' as const : subscription.status === 'past_due' ? 'past_due' as const : 'trialing' as const,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
        price_per_month: 1499, // $14.99 in cents
        features: {
          ai_focus_scores: true,
        },
        metadata: {
          plan_type: 'intelligence',
        },
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error creating intelligence subscription:', error);
    } else {
      console.log('✅ Intelligence subscription created successfully');
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id);

  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: subscription.status === 'active' ? 'active' as const : subscription.status === 'canceled' ? 'cancelled' as const : subscription.status === 'past_due' ? 'past_due' as const : 'trialing' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deleted:', subscription.id);

  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating cancelled subscription:', error);
  }
}

// Helper functions (same as in ReviewPaymentStep2.tsx)
function mapLocationType(locationType: string): string {
  const mapping: { [key: string]: string } = {
    'fully-remote': 'remote',
    'in-person': 'onsite',
    'hybrid': 'hybrid',
    'on-the-road': 'onsite',
  };
  return mapping[locationType] || 'onsite';
}

function mapJobType(jobType: string): string {
  const mapping: { [key: string]: string } = {
    'full-time': 'full-time',
    'part-time': 'part-time',
    'permanent': 'full-time',
    'fixed-term': 'contract',
    'subcontract': 'contract',
    'casual': 'part-time',
    'temp-to-perm': 'contract',
    'contract': 'contract',
    'internship': 'internship',
    'volunteer': 'internship',
    'graduate': 'full-time',
  };
  return mapping[jobType] || 'full-time';
}

function getSalaryMin(payConfig: JobFormData2['payConfig']): number | null {
  // Store original salary values, not converted to annual
  if (!payConfig) return null;

  if (payConfig.payType === 'range' && payConfig.payRangeMin) {
    return payConfig.payRangeMin;
  }
  if (payConfig.payType === 'minimum' && payConfig.payRangeMin) {
    return payConfig.payRangeMin;
  }
  if (payConfig.payType === 'fixed' && payConfig.payAmount) {
    return payConfig.payAmount;
  }

  return null;
}

function getSalaryMax(payConfig: JobFormData2['payConfig']): number | null {
  // Store original salary values, not converted to annual
  if (!payConfig) return null;

  if (payConfig.payType === 'range' && payConfig.payRangeMax) {
    return payConfig.payRangeMax;
  }
  if (payConfig.payType === 'maximum' && payConfig.payRangeMax) {
    return payConfig.payRangeMax;
  }
  if (payConfig.payType === 'fixed' && payConfig.payAmount) {
    return payConfig.payAmount;
  }

  return null;
}