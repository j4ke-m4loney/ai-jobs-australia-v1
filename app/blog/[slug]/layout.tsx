import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Check for required env vars - return default metadata if missing
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      title: 'Blog | AI Jobs Australia',
      description: 'Read the latest articles about AI jobs and careers in Australia.',
    };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) {
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

export default function BlogArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
