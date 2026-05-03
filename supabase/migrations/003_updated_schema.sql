-- Update MLS preview properties and offers tables to match exact specifications

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.offers CASCADE;
DROP TABLE IF EXISTS public.mls_preview_properties CASCADE;
DROP TABLE IF EXISTS public.property_search_events CASCADE;

-- MLS preview properties table
CREATE TABLE IF NOT EXISTS public.mls_preview_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT DEFAULT 'exp',
  source_url TEXT UNIQUE NOT NULL,
  image_url TEXT,
  price NUMERIC,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'CO',
  zip TEXT,
  bedrooms NUMERIC,
  bathrooms NUMERIC,
  square_feet NUMERIC,
  property_type TEXT,
  status TEXT DEFAULT 'active',
  raw_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offers table
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID,
  mls_preview_property_id UUID REFERENCES public.mls_preview_properties(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('fsbo', 'mls')),
  source_url TEXT,
  property_address TEXT,
  property_city TEXT,
  property_state TEXT,
  property_price NUMERIC,
  offer_price NUMERIC NOT NULL,
  financing_type TEXT CHECK (financing_type IN ('cash', 'loan', 'other')),
  inspection BOOLEAN DEFAULT true,
  closing_days INTEGER,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  has_agent BOOLEAN DEFAULT false,
  buyer_agent_name TEXT,
  buyer_agent_email TEXT,
  buyer_agent_phone TEXT,
  notes TEXT,
  status TEXT DEFAULT 'submitted',
  raw_offer JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property search events table
CREATE TABLE IF NOT EXISTS public.property_search_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT NOT NULL,
  fsbo_enabled BOOLEAN DEFAULT true,
  mls_enabled BOOLEAN DEFAULT true,
  results_count INTEGER DEFAULT 0,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mls_preview_properties_city_state ON public.mls_preview_properties(city, state);
CREATE INDEX IF NOT EXISTS idx_mls_preview_properties_price ON public.mls_preview_properties(price);
CREATE INDEX IF NOT EXISTS idx_offers_property_id ON public.offers(property_id);
CREATE INDEX IF NOT EXISTS idx_offers_mls_preview_property_id ON public.offers(mls_preview_property_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_property_search_events_created_at ON public.property_search_events(created_at);

-- Enable RLS
ALTER TABLE public.mls_preview_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_search_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mls_preview_properties
DROP POLICY IF EXISTS "Public read MLS preview properties" ON public.mls_preview_properties;
CREATE POLICY "Public read MLS preview properties" ON public.mls_preview_properties
  FOR SELECT USING (true);

-- RLS Policies for offers
DROP POLICY IF EXISTS "Public can submit offers" ON public.offers;
CREATE POLICY "Public can submit offers" ON public.offers
  FOR INSERT WITH CHECK (
    buyer_name IS NOT NULL
    AND buyer_email IS NOT NULL
    AND offer_price IS NOT NULL
  );

-- RLS Policies for property_search_events
DROP POLICY IF EXISTS "Public can insert search events" ON public.property_search_events;
CREATE POLICY "Public can insert search events" ON public.property_search_events
  FOR INSERT WITH CHECK (true);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_mls_preview_properties_updated_at ON public.mls_preview_properties;
CREATE TRIGGER update_mls_preview_properties_updated_at
  BEFORE UPDATE ON public.mls_preview_properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();