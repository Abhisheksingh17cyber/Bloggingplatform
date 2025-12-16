-- BlogHub Database Schema for Supabase
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/wjkwokitgwpzlukjjgqo/editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  profile_image TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blogs table
CREATE TABLE public.blogs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL,
  cover_image TEXT,
  tags TEXT[],
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table (tracks who liked what)
CREATE TABLE public.likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blog_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_blogs_author ON public.blogs(author_id);
CREATE INDEX idx_blogs_created_at ON public.blogs(created_at DESC);
CREATE INDEX idx_blogs_category ON public.blogs(category);
CREATE INDEX idx_comments_blog ON public.comments(blog_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_likes_blog ON public.likes(blog_id);
CREATE INDEX idx_likes_user ON public.likes(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Blogs policies
CREATE POLICY "Blogs are viewable by everyone"
  ON public.blogs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create blogs"
  ON public.blogs FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own blogs"
  ON public.blogs FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own blogs"
  ON public.blogs FOR DELETE
  USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like blogs"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike blogs"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Function to increment blog views
CREATE OR REPLACE FUNCTION increment_blog_views(blog_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blogs
  SET views = views + 1
  WHERE id = blog_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update blog likes count
CREATE OR REPLACE FUNCTION update_blog_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.blogs
    SET likes = likes + 1
    WHERE id = NEW.blog_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.blogs
    SET likes = likes - 1
    WHERE id = OLD.blog_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update blog likes count
CREATE TRIGGER update_blog_likes_count
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW
  EXECUTE PROCEDURE update_blog_likes();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, profile_image)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'profile_image', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- Insert sample data
INSERT INTO public.profiles (id, username, email, profile_image, bio, is_admin)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'John Doe', 'john@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', 'Full-stack developer and tech enthusiast', true),
  ('00000000-0000-0000-0000-000000000002', 'Sarah Johnson', 'sarah@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 'Lifestyle blogger and minimalism advocate', false),
  ('00000000-0000-0000-0000-000000000003', 'Dr. Michael Chen', 'michael@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', 'Healthcare AI researcher', false),
  ('00000000-0000-0000-0000-000000000004', 'Emma Rodriguez', 'emma@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', 'Digital nomad and travel writer', false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample blogs
INSERT INTO public.blogs (id, title, content, excerpt, category, cover_image, tags, likes, views, author_id)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'Getting Started with React 18: A Comprehensive Guide',
    '<h2>Introduction to React 18</h2><p>React 18 brings exciting new features including automatic batching, transitions, and Suspense improvements. In this guide, we''ll explore everything you need to know...</p><h3>Automatic Batching</h3><p>React 18 automatically batches all updates, even those inside promises, setTimeout, and native event handlers...</p>',
    'React 18 brings exciting new features including automatic batching, transitions, and Suspense improvements...',
    'Technology',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    ARRAY['React', 'JavaScript', 'Web Development'],
    234,
    1289,
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'The Art of Minimalist Living: Finding Joy in Simplicity',
    '<p>Minimalism is not about having less, it''s about making room for more of what matters...</p>',
    'Discover how minimalist living can transform your life and bring unprecedented clarity and peace...',
    'Lifestyle',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ARRAY['Lifestyle', 'Minimalism', 'Wellness'],
    567,
    2341,
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Machine Learning in Healthcare: Revolutionary Applications',
    '<p>Artificial intelligence and machine learning are revolutionizing healthcare delivery...</p>',
    'Explore how AI and ML are transforming patient care, diagnosis, and treatment planning in modern healthcare...',
    'Technology',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    ARRAY['AI', 'Healthcare', 'Technology'],
    892,
    4521,
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'Exploring Southeast Asia: A Digital Nomad''s Journey',
    '<p>Working remotely while traveling through Southeast Asia offers unique experiences...</p>',
    'Join me as I share insights from 6 months of remote work across Thailand, Vietnam, and Bali...',
    'Travel',
    'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800',
    ARRAY['Travel', 'Digital Nomad', 'Asia'],
    1243,
    5789,
    '00000000-0000-0000-0000-000000000004'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample comments
INSERT INTO public.comments (blog_id, user_id, content)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Great article! Really helped me understand React 18 features better.'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Could you elaborate more on the automatic batching feature?')
ON CONFLICT DO NOTHING;