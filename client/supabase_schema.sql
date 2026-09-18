-- ==============================================================================
-- INDUSTRIAL REALISM HYBRID PORTFOLIO & BIO LINK ARCHITECTURE
-- SUPABASE POSTGRESQL SCHEMA & BULLETPROOF ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CREATE DATABASE TABLES
-- ==============================================================================

-- TABLE: PROJECTS (Case Studies)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(120) NOT NULL,
    category VARCHAR(60) NOT NULL,
    description TEXT NOT NULL,
    problem TEXT NOT NULL,
    solution TEXT NOT NULL,
    tech_stack TEXT[] NOT NULL DEFAULT '{}',
    live_url TEXT,
    github_url TEXT,
    image_url TEXT,
    featured BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: LINKS (Bio Link & Affiliate Conversion Hub)
CREATE TABLE IF NOT EXISTS public.links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    category VARCHAR(40) NOT NULL DEFAULT 'affiliate', -- 'affiliate', 'gear', 'course', 'social'
    url TEXT NOT NULL,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'ExternalLink',
    badge_text VARCHAR(40),
    clicks BIGINT DEFAULT 0 CHECK (clicks >= 0),
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: BLOGS (Technical Dispatches)
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(160) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    read_time VARCHAR(30) DEFAULT '5 min read',
    tags TEXT[] DEFAULT '{}',
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: MESSAGES (Contact Telemetry Transmissions)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. AUTOMATIC SANITIZATION & TIMESTAMP TRIGGER FUNCTIONS
-- ==============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply updated_at trigger to tables
CREATE OR REPLACE TRIGGER set_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_links_updated_at
BEFORE UPDATE ON public.links
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES - BULLETPROOF DEFENSE
-- ==============================================================================

-- Enable RLS on ALL tables (Mandatory)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- HELPER: Define Admin Verification Function
-- Replace 'your-admin-email@domain.com' or configure app_metadata role
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the requesting user is authenticated and matches admin criteria
    RETURN (
        auth.role() = 'authenticated' 
        AND (
            auth.jwt() ->> 'email' = 'your-admin-email@domain.com'
            OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- RLS: PROJECTS
-- ------------------------------------------------------------------------------
-- Public: Can ONLY SELECT
CREATE POLICY "Public users can view projects" 
ON public.projects FOR SELECT 
TO anon, authenticated 
USING (true);

-- Admin: Full Access for INSERT, UPDATE, DELETE
CREATE POLICY "Admin full access on projects" 
ON public.projects FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- RLS: LINKS (Affiliate Hub)
-- ------------------------------------------------------------------------------
-- Public: Can ONLY SELECT active links
CREATE POLICY "Public users can view active links" 
ON public.links FOR SELECT 
TO anon, authenticated 
USING (is_active = true OR public.is_admin());

-- Admin: Full Access for INSERT, UPDATE, DELETE
CREATE POLICY "Admin full access on links" 
ON public.links FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- RLS: BLOGS
-- ------------------------------------------------------------------------------
-- Public: Can ONLY SELECT published articles
CREATE POLICY "Public users can view published blogs" 
ON public.blogs FOR SELECT 
TO anon, authenticated 
USING (published = true OR public.is_admin());

-- Admin: Full Access for INSERT, UPDATE, DELETE
CREATE POLICY "Admin full access on blogs" 
ON public.blogs FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- RLS: MESSAGES (Contact Form)
-- ------------------------------------------------------------------------------
-- Public / Anon: Can INSERT incoming contact messages only
CREATE POLICY "Anyone can submit a contact message" 
ON public.messages FOR INSERT 
TO anon, authenticated 
WITH CHECK (
    char_length(name) >= 2 AND char_length(name) <= 80
    AND char_length(email) >= 5 AND char_length(email) <= 120
    AND char_length(message) >= 10 AND char_length(message) <= 3000
);

-- Public / Anon: CANNOT view, update, or delete any messages
-- Admin: Can SELECT and manage messages
CREATE POLICY "Only admin can view contact messages" 
ON public.messages FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Only admin can delete contact messages" 
ON public.messages FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- ==============================================================================
-- 5. SEED INITIAL SPEC DATA
-- ==============================================================================
INSERT INTO public.projects (title, category, description, problem, solution, tech_stack, live_url, github_url, image_url, featured)
VALUES
(
    'Distributed Telemetry & Sensor Mesh',
    'Full-Stack / IoT',
    'High-throughput time-series aggregation pipeline handling 50k events/sec with sub-millisecond physical node status alerts.',
    'Legacy SCADA infrastructure suffered 12-second propagation delays, causing undetected micro-outages across server nodes.',
    'Engineered an event-driven Go and Supabase Postgres CDC engine with WebSockets, delivering real-time status telemetry to a React tactile dashboard.',
    ARRAY['React', 'Supabase', 'PostgreSQL', 'Go', 'WebSockets', 'TailwindCSS'],
    'https://telemetry-demo.example.com',
    'https://github.com/example/telemetry-mesh',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    true
)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 6. SUPABASE STORAGE: MEDIA BUCKET + RLS POLICIES
-- Run this block in Supabase SQL Editor (Storage API requires pg extensions)
-- ==============================================================================

-- Create the 'media' storage bucket (public = true allows public URL access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760, -- 10MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- ------------------------------------------------------------------------------
-- STORAGE RLS: Allow PUBLIC to READ all objects in 'media' bucket
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view media files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- ------------------------------------------------------------------------------
-- STORAGE RLS: Allow ONLY ADMIN to INSERT (upload) files to 'media' bucket
-- Paths: media/projects/*, media/blogs/*
-- ------------------------------------------------------------------------------
CREATE POLICY "Only admin can upload media files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND public.is_admin()
);

-- ------------------------------------------------------------------------------
-- STORAGE RLS: Allow ONLY ADMIN to UPDATE objects in 'media' bucket
-- ------------------------------------------------------------------------------
CREATE POLICY "Only admin can update media files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media'
  AND public.is_admin()
);

-- ------------------------------------------------------------------------------
-- STORAGE RLS: Allow ONLY ADMIN to DELETE files from 'media' bucket
-- ------------------------------------------------------------------------------
CREATE POLICY "Only admin can delete media files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media'
  AND public.is_admin()
);

-- ==============================================================================
-- 7. SCHEMA MIGRATION: Add thumbnail_url to blogs table
-- Safe migration — adds nullable column, no existing data affected
-- ==============================================================================
ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- ==============================================================================
-- 8. UPDATE is_admin() FUNCTION — DOUBLE-LAYER SECURITY
-- Replace 'your-admin-email@domain.com' with your actual admin email
-- OR set VITE_ADMIN_EMAIL in your .env and keep SQL in sync manually
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.role() = 'authenticated'
    AND (
      -- Layer 1: Email match (set this to your actual admin email)
      auth.jwt() ->> 'email' = 'your-admin-email@domain.com'
      -- Layer 2: app_metadata role check (set via Supabase Dashboard or Admin API)
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOTE: To set app_metadata.role = 'admin' for your user, run this in SQL Editor
-- after finding your user's UUID from auth.users:
--
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'your-admin-email@domain.com';

