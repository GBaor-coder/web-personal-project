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
