-- ==============================================================================
-- TinyGD - Google Developer Groups Community Platform Database Schema
-- Run this script in your Supabase project's SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT,
  community_name TEXT DEFAULT 'Google Developer Groups on Campus',
  community_logo_url TEXT,
  banner_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  category_tags TEXT[] DEFAULT '{}',
  audience_type TEXT DEFAULT 'IN_PERSON',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  display_date TEXT NOT NULL,
  display_time TEXT NOT NULL,
  timezone TEXT DEFAULT 'Asia/Kolkata (IST)',
  venue_name TEXT NOT NULL,
  hall_or_room TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'Kolkata, West Bengal',
  maps_url TEXT NOT NULL,
  capacity INTEGER DEFAULT 250,
  registered_count INTEGER DEFAULT 0,
  is_registration_open BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'UPCOMING',
  about_markdown TEXT NOT NULL,
  perks TEXT[] DEFAULT '{}',
  agenda JSONB DEFAULT '[]'::jsonb,
  team JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Attendees Table
CREATE TABLE IF NOT EXISTS public.attendees (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  organization TEXT,
  avatar_url TEXT,
  fast_registration_opt_in BOOLEAN DEFAULT false,
  qr_code_data TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  check_in_timestamp TIMESTAMPTZ,
  registered_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT attendee_event_email_unique UNIQUE (event_id, email)
);

-- Index for fast attendee lookup by email and event
CREATE INDEX IF NOT EXISTS idx_attendees_email ON public.attendees(email);
CREATE INDEX IF NOT EXISTS idx_attendees_event_id ON public.attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_attendees_status ON public.attendees(status);

-- 3. Create Admin Users Table
CREATE TABLE IF NOT EXISTS public.admins (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  organization TEXT DEFAULT 'GDG Community Team',
  avatar_url TEXT,
  invited_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create App Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Setup Public Access Policies for Web App (Anon Key)
-- Events Policies
DROP POLICY IF EXISTS "Allow public read access to events" ON public.events;
CREATE POLICY "Allow public read access to events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon upsert to events" ON public.events;
CREATE POLICY "Allow anon upsert to events" ON public.events FOR ALL USING (true) WITH CHECK (true);

-- Attendees Policies
DROP POLICY IF EXISTS "Allow public read access to attendees" ON public.attendees;
CREATE POLICY "Allow public read access to attendees" ON public.attendees FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert to attendees" ON public.attendees;
CREATE POLICY "Allow anon insert to attendees" ON public.attendees FOR ALL USING (true) WITH CHECK (true);

-- Admins Policies
DROP POLICY IF EXISTS "Allow anon read and write to admins" ON public.admins;
CREATE POLICY "Allow anon read and write to admins" ON public.admins FOR ALL USING (true) WITH CHECK (true);

-- App Settings Policies
DROP POLICY IF EXISTS "Allow anon read and write to app_settings" ON public.app_settings;
CREATE POLICY "Allow anon read and write to app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime on all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendees;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;

-- 5. Seed Initial Default Data (Safe upsert)
INSERT INTO public.app_settings (key, value)
VALUES 
  ('admin_passkey', '"GDG-ADMIN-2026"'::jsonb),
  ('active_event_id', '"gdg-study-jams-2026"'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.admins (id, full_name, email, password, role, organization, avatar_url)
VALUES 
  (
    'admin-super-01',
    'GDG Lead Organizer',
    'admin@gdg.org',
    'admin123',
    'SUPER_ADMIN',
    'Google Developer Groups Kolkata',
    'https://api.dicebear.com/7.x/notionists/svg?seed=GDGLead&backgroundColor=b6e3f4'
  ),
  (
    'admin-org-02',
    'Debanjan Event Co-Lead',
    'organizer@gdgkolkata.org',
    'gdg2026',
    'ORGANIZER',
    'GDG Core Team',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Debanjan&backgroundColor=ffd5dc'
  ),
  (
    'admin-staff-03',
    'Siddharth Scanner Staff',
    'scanner@gdgkolkata.org',
    'scanner2026',
    'CHECKIN_STAFF',
    'Volunteer Check-in Team',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Siddharth&backgroundColor=c0aede'
  )
ON CONFLICT (email) DO NOTHING;
