import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Property {
  id: string
  user_id?: string
  title: string
  price: number
  address: string
  city: string
  state: string
  zip: string
  beds?: number
  baths?: number
  sqft?: number
  description?: string
  status: 'active' | 'under_contract' | 'sold'
  propy_url?: string
  cover_image_url?: string | null
  image_urls: string[]
  created_at: string
  updated_at: string
}

export interface Showing {
  id: string
  property_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone?: string
  requested_date: string
  requested_time: string
  status: 'pending' | 'confirmed' | 'declined' | 'rescheduled'
  notes?: string
  created_at: string
}

export interface Message {
  id: string
  property_id: string
  sender_name: string
  sender_email: string
  message: string
  created_at: string
}

export interface PropertyAnalytics {
  id: string
  property_id: string
  event_type: 'view' | 'click' | 'showing_request' | 'offer_click'
  created_at: string
}

// Functions
export const fetchProperties = async (filters?: { status?: string; city?: string; state?: string }) => {
  let query = supabase.from('properties').select('*')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  if (filters?.state) {
    query = query.eq('state', filters.state)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data as Property[]
}

export const fetchPropertyById = async (id: string) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Property
}

export const createProperty = async (property: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('properties')
    .insert(property)
    .select()
    .single()

  if (error) throw error
  return data as Property
}

export const updateProperty = async (id: string, updates: Partial<Property>) => {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Property
}

export const deleteProperty = async (id: string) => {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const trackPropertyEvent = async (propertyId: string, eventType: PropertyAnalytics['event_type']) => {
  const { error } = await supabase
    .from('property_analytics')
    .insert({
      property_id: propertyId,
      event_type: eventType
    })

  if (error) throw error
}

export const createShowingRequest = async (showing: Omit<Showing, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('showings')
    .insert(showing)
    .select()
    .single()

  if (error) throw error
  return data as Showing
}

export const createMessage = async (message: Omit<Message, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single()

  if (error) throw error
  return data as Message
}

export const fetchMessages = async (propertyId?: string) => {
  let query = supabase.from('messages').select('*').order('created_at', { ascending: false })

  if (propertyId) {
    query = query.eq('property_id', propertyId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Message[]
}