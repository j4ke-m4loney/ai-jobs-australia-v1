-- Create blog_posts table
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author_id UUID REFERENCES profiles(user_id),
  author_name TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  read_time_minutes INTEGER,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_categories table
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC NULLS LAST);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read published posts
CREATE POLICY "Anyone can read published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published' AND published_at <= NOW());

-- RLS Policy: Admins can do everything with posts
CREATE POLICY "Admins can manage posts"
  ON blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- RLS Policy: Anyone can read categories
CREATE POLICY "Anyone can read categories"
  ON blog_categories FOR SELECT
  TO public
  USING (true);

-- RLS Policy: Admins can manage categories
CREATE POLICY "Admins can manage categories"
  ON blog_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Insert default categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('AI Career Advice', 'ai-career-advice', 'Tips and guidance for building a career in AI'),
  ('Industry News', 'industry-news', 'Latest news and trends in the AI industry'),
  ('Interview Tips', 'interview-tips', 'How to ace your AI job interviews'),
  ('Resume Writing', 'resume-writing', 'Craft the perfect AI resume'),
  ('AI Technology', 'ai-technology', 'Understanding AI technologies and tools'),
  ('Job Search Strategies', 'job-search-strategies', 'Effective strategies for finding AI jobs');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to tables for documentation
COMMENT ON TABLE blog_posts IS 'Stores blog articles for the AI Jobs Australia blog';
COMMENT ON TABLE blog_categories IS 'Categories for organizing blog posts';
COMMENT ON COLUMN blog_posts.slug IS 'URL-friendly identifier for the post';
COMMENT ON COLUMN blog_posts.status IS 'Publication status: draft, published, or archived';
COMMENT ON COLUMN blog_posts.read_time_minutes IS 'Estimated reading time in minutes';
COMMENT ON COLUMN blog_posts.published_at IS 'When the post was/will be published (can be future date for scheduled posts)';
