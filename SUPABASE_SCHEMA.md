# Liivvi Supabase Schema Documentation

This document outlines the expected Supabase database schema for the Liivvi real estate platform, shared between the Airo-built website and this Vite app.

## Database Tables

### 1. properties
Core property listings table.

```sql
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
```

**RLS Policies:**
- Public read active properties
- Authenticated users can create properties
- Property owners can update/delete their properties

### 2. showings
Property showing requests and scheduling.

```sql
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
```

**RLS Policies:**
- Anyone can create showing requests
- Property owners can read and update showings for their properties

### 3. messages
Buyer-seller messaging system.

```sql
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies:**
- Anyone can create messages
- Property owners and message senders can read messages

### 4. property_analytics
Analytics tracking for property engagement.

```sql
CREATE TABLE property_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'showing_request', 'offer_click')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies:**
- Anyone can insert analytics events
- Property owners can read analytics for their properties

## Storage Buckets

### property-images
- Public bucket for property photos
- Files uploaded via Supabase Storage API
- Public URLs generated for frontend display

## Migration Notes

If tables already exist from the Airo site:
- Verify column names match exactly
- Ensure RLS policies are in place
- Check that storage bucket exists and is public
- Update table names in `src/lib/supabase.ts` if different

## Environment Variables

Both Airo site and Liivvi app use the same Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Functions

Reusable functions in `src/lib/supabase.ts`:

- `fetchProperties(filters?)` - Get property listings
- `fetchPropertyById(id)` - Get single property
- `createProperty(data)` - Create new listing
- `updateProperty(id, data)` - Update listing
- `deleteProperty(id)` - Delete listing
- `trackPropertyEvent(propertyId, eventType)` - Analytics
- `createShowingRequest(data)` - Schedule showing
- `createMessage(data)` - Send message

## Frontend Routes

Liivvi app provides these routes that Airo site can link to:

- `/listings` - Property listings grid
- `/listing/:id` - Property detail page
- `/create-listing` - Create new property listing
- `/schedule/:propertyId` - Schedule property showing
- `/messages/:propertyId` - Property messaging
- `/admin` - Admin dashboard

## Integration Points

### From Airo Site to Liivvi App
```html
<!-- Link to property listings -->
<a href="https://liivvi-app.vercel.app/listings">View All Properties</a>

<!-- Link to specific property -->
<a href="https://liivvi-app.vercel.app/listing/123">View Property</a>

<!-- Link to create listing -->
<a href="https://liivvi-app.vercel.app/create-listing">List Your Property</a>
```

### Shared Data Flow
1. Airo site displays marketing pages and basic property previews
2. Liivvi app handles full CRUD operations for properties
3. Both apps read from/write to the same Supabase tables
4. Analytics and messaging work across both platforms