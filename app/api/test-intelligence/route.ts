import { NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import Anthropic from '@anthropic-ai/sdk';

// Allow up to 60 seconds for this function
export const maxDuration = 60;

export async function GET() {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    // Step 1: Check env var
    const hasKey = !!process.env.ANTHROPIC_API_KEY;
    const keyPrefix = process.env.ANTHROPIC_API_KEY?.slice(0, 15) || 'NOT SET';
    log(`✅ Step 1: ANTHROPIC_API_KEY present: ${hasKey} (starts with: ${keyPrefix}...)`);

    // Step 2: Test a simple Anthropic API call
    log('🔄 Step 2: Testing Anthropic API call...');
    const startTime = Date.now();

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Say "hello" in JSON: {"message": "hello"}' }],
      system: 'Return only valid JSON.',
    });

    const duration = Date.now() - startTime;
    const textContent = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );

    log(`✅ Step 2: Anthropic responded in ${duration}ms`);
    log(`   Response: ${textContent?.text || 'no text'}`);
    log(`   Stop reason: ${response.stop_reason}`);

    // Step 3: Check Supabase connection
    log('🔄 Step 3: Checking Supabase env vars...');
    log(`   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET'}`);
    log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'}`);

    return NextResponse.json({
      success: true,
      logs,
      summary: `Anthropic API working. Response time: ${duration}ms`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`❌ Error: ${errorMessage}`);

    return NextResponse.json(
      { success: false, logs, error: errorMessage },
      { status: 500 }
    );
  }
}
