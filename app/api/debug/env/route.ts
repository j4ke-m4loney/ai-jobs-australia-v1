import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envDebug = {
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      stripeSecretPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 12),
      hasStripePublishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripePublishablePrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 12),
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      webhookSecretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 12),
      allStripeVars: Object.keys(process.env).filter(key => key.includes('STRIPE')),
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      environment: envDebug
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}