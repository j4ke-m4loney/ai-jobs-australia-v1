import { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

interface Props {
  params: Promise<{ slug: string }>;
}

// Cached so generateMetadata and the layout share a single DB lookup per
// request. React's cache() de-dupes by argument value within a render.
const getPublishedPost = cache(async (slug: string) => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  return data;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) {
    // The layout default export will call notFound() and render the
    // root not-found page with a real 404 status. Metadata returned
    // here is overridden by the not-found page's own metadata, but we
    // set it anyway in case the not-found render is bypassed.
    return {
      title: 'Article Not Found | AI Jobs Australia',
      description: 'The requested article could not be found.',
    };
  }

  return {
    title: `${post.title} | AI Jobs Australia Blog`,
    description: post.excerpt || post.title,
    keywords: post.tags ? post.tags.join(', ') : undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      images: post.featured_image_url ? [post.featured_image_url] : [],
      type: 'article',
      publishedTime: post.published_at,
      authors: post.author_name ? [post.author_name] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: post.featured_image_url ? [post.featured_image_url] : undefined,
    },
  };
}

export default async function BlogArticleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  // Without this, unpublished/deleted posts return HTTP 200 with the
  // client-side "Article Not Found" UI — Google classifies that as
  // soft 404. notFound() returns a real 404 status.
  if (!post) {
    notFound();
  }

  return children;
}
