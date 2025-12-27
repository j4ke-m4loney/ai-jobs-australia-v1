import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Webhook event types
type OutrankEvent = 'publish_articles';

// Article payload structure from Outrank
interface OutrankArticle {
  id: string;
  title: string;
  content_markdown: string;
  content_html: string;
  meta_description: string;
  created_at: string;
  image_url: string;
  slug: string;
  tags: string[];
}

interface WebhookPayload {
  event_type: OutrankEvent;
  timestamp: string;
  data: {
    articles: OutrankArticle[];
  };
}

/**
 * Outrank Webhook Handler
 * Receives published articles from Outrank's backlink integration
 * Articles are saved as drafts for manual review before publishing
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Verify Bearer token authentication
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Outrank Webhook] Missing or invalid authorization header');
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const expectedToken = process.env.OUTRANK_WEBHOOK_TOKEN;

    if (!expectedToken) {
      console.error('[Outrank Webhook] OUTRANK_WEBHOOK_TOKEN not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (token !== expectedToken) {
      console.error('[Outrank Webhook] Invalid access token');
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    console.log('[Outrank Webhook] Token verified successfully');

    // Step 2: Parse webhook payload
    const payload: WebhookPayload = await req.json();

    console.log('[Outrank Webhook] Received event:', {
      event_type: payload.event_type,
      timestamp: payload.timestamp,
      article_count: payload.data?.articles?.length || 0,
    });

    // Step 3: Validate event type
    if (payload.event_type !== 'publish_articles') {
      console.warn(`[Outrank Webhook] Unknown event type: ${payload.event_type}`);
      return NextResponse.json(
        { error: 'Unknown event type' },
        { status: 400 }
      );
    }

    // Step 4: Validate articles array
    if (!payload.data?.articles || !Array.isArray(payload.data.articles)) {
      console.error('[Outrank Webhook] Invalid payload structure - missing articles array');
      return NextResponse.json(
        { error: 'Invalid payload structure' },
        { status: 400 }
      );
    }

    if (payload.data.articles.length === 0) {
      console.log('[Outrank Webhook] No articles to process');
      return NextResponse.json(
        {
          message: 'No articles to process',
          processed: 0,
          failed: 0,
        },
        { status: 200 }
      );
    }

    // Step 5: Process articles
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Outrank Webhook] Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create Supabase admin client (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results = {
      success: [] as Array<{ slug: string; action: 'created' | 'updated' }>,
      failed: [] as Array<{ slug: string; error: string }>,
    };

    // Process each article
    for (const article of payload.data.articles) {
      try {
        console.log(`[Outrank Webhook] Processing article: ${article.slug}`);

        // Calculate read time from HTML content
        const plainText = article.content_html.replace(/<[^>]*>/g, '');
        const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));

        console.log(`[Outrank Webhook] Article "${article.title}" - ${wordCount} words, ${readTime} min read`);

        // Check if article already exists by slug
        const { data: existing, error: checkError } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', article.slug)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new articles
          throw checkError;
        }

        if (existing) {
          // Update existing article
          console.log(`[Outrank Webhook] Updating existing article: ${article.slug}`);

          const { error: updateError } = await supabase
            .from('blog_posts')
            .update({
              title: article.title,
              excerpt: article.meta_description,
              content: article.content_html,
              featured_image_url: article.image_url,
              tags: article.tags,
              read_time_minutes: readTime,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (updateError) {
            throw updateError;
          }

          results.success.push({ slug: article.slug, action: 'updated' });
          console.log(`✅ Updated article: ${article.slug}`);
        } else {
          // Insert new article as draft
          console.log(`[Outrank Webhook] Creating new draft article: ${article.slug}`);

          const { error: insertError } = await supabase
            .from('blog_posts')
            .insert({
              title: article.title,
              slug: article.slug,
              excerpt: article.meta_description,
              content: article.content_html,
              featured_image_url: article.image_url,
              author_name: 'AI Jobs Australia',
              category: 'AI Technology',
              tags: article.tags,
              read_time_minutes: readTime,
              status: 'draft',
              published_at: null,
            });

          if (insertError) {
            throw insertError;
          }

          results.success.push({ slug: article.slug, action: 'created' });
          console.log(`✅ Created draft article: ${article.slug}`);
        }
      } catch (error) {
        console.error(`[Outrank Webhook] Failed to process article: ${article.slug}`, error);
        results.failed.push({
          slug: article.slug,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Log processing summary
    console.log('[Outrank Webhook] Processing complete:', {
      total: payload.data.articles.length,
      success: results.success.length,
      failed: results.failed.length,
    });

    // Return success response with summary
    return NextResponse.json(
      {
        message: 'Webhook processed successfully',
        processed: results.success.length,
        failed: results.failed.length,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Outrank Webhook] Unexpected error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
