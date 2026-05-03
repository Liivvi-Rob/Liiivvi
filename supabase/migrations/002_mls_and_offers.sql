-- Add MLS preview properties and offers tables

-- MLS preview properties table
CREATE TABLE mls_preview_properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  price INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet INTEGER,
  property_type TEXT,
  raw_data JSONB,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table
CREATE TABLE offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  mls_preview_property_id UUID REFERENCES mls_preview_properties(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('fsbo', 'mls')),
  source_url TEXT,
  property_address TEXT NOT NULL,
  property_city TEXT NOT NULL,
  property_state TEXT NOT NULL,
  property_price INTEGER,
  offer_price INTEGER NOT NULL,
  financing_type TEXT CHECK (financing_type IN ('cash', 'loan', 'other')),
  inspection BOOLEAN,
  closing_days INTEGER,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  has_agent BOOLEAN DEFAULT false,
  buyer_agent_name TEXT,
  buyer_agent_email TEXT,
  buyer_agent_phone TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'accepted', 'rejected')),
  raw_offer JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_mls_preview_properties_city_state ON mls_preview_properties(city, state);
CREATE INDEX idx_mls_preview_properties_price ON mls_preview_properties(price);
CREATE INDEX idx_offers_property_id ON offers(property_id);
CREATE INDEX idx_offers_mls_preview_property_id ON offers(mls_preview_property_id);
CREATE INDEX idx_offers_status ON offers(status);

-- Enable RLS
ALTER TABLE mls_preview_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mls_preview_properties
CREATE POLICY "Public read MLS preview properties" ON mls_preview_properties
  FOR SELECT USING (true);

-- RLS Policies for offers
CREATE POLICY "Anyone can create offers" ON offers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Buyers can read their offers" ON offers
  FOR SELECT USING (buyer_email = auth.email());

-- Triggers for updated_at
CREATE TRIGGER update_mls_preview_properties_updated_at
  BEFORE UPDATE ON mls_preview_properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();