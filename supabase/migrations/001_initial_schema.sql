-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties table
CREATE TABLE properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  beds INTEGER,
  baths DECIMAL(3,1),
  sqft INTEGER,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'under_contract', 'sold')),
  propy_url TEXT,
  cover_image_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Showings table
CREATE TABLE showings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'rescheduled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property analytics table
CREATE TABLE property_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'showing_request', 'offer_click')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city_state ON properties(city, state);
CREATE INDEX idx_showings_property_id ON showings(property_id);
CREATE INDEX idx_showings_status ON showings(status);
CREATE INDEX idx_messages_property_id ON messages(property_id);
CREATE INDEX idx_property_analytics_property_id ON property_analytics(property_id);
CREATE INDEX idx_property_analytics_event_type ON property_analytics(event_type);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE showings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for properties
-- Allow anyone to read active properties
CREATE POLICY "Public read active properties" ON properties
  FOR SELECT USING (status = 'active');

-- Allow authenticated users to create properties (for sellers)
CREATE POLICY "Authenticated users can create properties" ON properties
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow property owners to update their properties
CREATE POLICY "Property owners can update" ON properties
  FOR UPDATE USING (auth.uid() = user_id); -- Assuming we add user_id later

-- Allow property owners to delete their properties
CREATE POLICY "Property owners can delete" ON properties
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for showings
-- Allow anyone to create showing requests
CREATE POLICY "Anyone can create showing requests" ON showings
  FOR INSERT WITH CHECK (true);

-- Allow property owners to read showing requests for their properties
CREATE POLICY "Property owners can read showings" ON showings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = showings.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- Allow property owners to update showing status
CREATE POLICY "Property owners can update showings" ON showings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = showings.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- RLS Policies for messages
-- Allow anyone to create messages
CREATE POLICY "Anyone can create messages" ON messages
  FOR INSERT WITH CHECK (true);

-- Allow property owners and message senders to read messages
CREATE POLICY "Property owners and senders can read messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = messages.property_id
      AND properties.user_id = auth.uid()
    ) OR sender_email = auth.email()
  );

-- RLS Policies for property_analytics
-- Allow anyone to insert analytics events
CREATE POLICY "Anyone can insert analytics" ON property_analytics
  FOR INSERT WITH CHECK (true);

-- Allow property owners to read analytics for their properties
CREATE POLICY "Property owners can read analytics" ON property_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_analytics.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();