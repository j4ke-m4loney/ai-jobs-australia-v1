// Server-side Anthropic client
import Anthropic from '@anthropic-ai/sdk';

// Lazy initialisation to avoid build-time environment variable access
let anthropicInstance: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (anthropicInstance) {
    return anthropicInstance;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY is not set in environment variables');
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  anthropicInstance = new Anthropic({
    apiKey: apiKey,
  });

  return anthropicInstance;
}

export const anthropic = new Proxy({} as Anthropic, {
  get: (_target, prop) => {
    const client = getAnthropic();
    const value = client[prop as keyof Anthropic];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
