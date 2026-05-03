-- Admin users and security lockdown for Liivvi

-- Ensure required extension for UUID generation exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read own admin record" ON public.admin_users;
CREATE POLICY IF NOT EXISTS "Admins can read own admin record" ON public.admin_users
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE auth_user_id = auth.uid()
  );
$$;

-- Lock down offers
ALTER TABLE IF EXISTS public.offers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read offers" ON public.offers;
DROP POLICY IF EXISTS "Public can update offers" ON public.offers;
DROP POLICY IF EXISTS "Public can delete offers" ON public.offers;
DROP POLICY IF EXISTS "Public can submit offers" ON public.offers;
DROP POLICY IF EXISTS "Admins can read offers" ON public.offers;
DROP POLICY IF EXISTS "Admins can update offers" ON public.offers;
CREATE POLICY IF NOT EXISTS "Public can submit offers only" ON public.offers
  FOR INSERT WITH CHECK (
    buyer_name IS NOT NULL
    AND buyer_email IS NOT NULL
    AND offer_price IS NOT NULL
  );
CREATE POLICY IF NOT EXISTS "Admins can read offers" ON public.offers
  FOR SELECT USING (public.is_admin());
CREATE POLICY IF NOT EXISTS "Admins can update offers" ON public.offers
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Lock down properties
ALTER TABLE IF EXISTS public.properties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can manage properties" ON public.properties;
CREATE POLICY IF NOT EXISTS "Public can read active properties" ON public.properties
  FOR SELECT USING (
    is_active = true
    AND status IN ('active', 'published')
  );
CREATE POLICY IF NOT EXISTS "Admins can manage properties" ON public.properties
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE IF EXISTS public.properties ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Lock down profiles
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read profiles" ON public.profiles;
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = auth_user_id) WITH CHECK (auth.uid() = auth_user_id);
CREATE POLICY IF NOT EXISTS "Admins can read profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Lock down MLS preview properties
ALTER TABLE IF EXISTS public.mls_preview_properties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active MLS preview properties" ON public.mls_preview_properties;
DROP POLICY IF EXISTS "Admins can manage MLS preview properties" ON public.mls_preview_properties;
CREATE POLICY IF NOT EXISTS "Public can read active MLS preview properties" ON public.mls_preview_properties
  FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "Admins can manage MLS preview properties" ON public.mls_preview_properties
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Lock down property search events
ALTER TABLE IF EXISTS public.property_search_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can log property searches" ON public.property_search_events;
DROP POLICY IF EXISTS "Admins can read property searches" ON public.property_search_events;
CREATE POLICY IF NOT EXISTS "Public can log property searches" ON public.property_search_events
  FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Admins can read property searches" ON public.property_search_events
  FOR SELECT USING (public.is_admin());
