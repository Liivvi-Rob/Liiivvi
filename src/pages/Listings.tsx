

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchProperties, trackPropertyEvent } from '../lib/supabase'
import type { Property } from '../lib/supabase'

function Listings() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await fetchProperties({ status: 'active' })
        setProperties(data)
      } catch (error) {
        console.error('Error loading properties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  const handleViewListing = async (propertyId: string) => {
    try {
      await trackPropertyEvent(propertyId, 'view')
    } catch (error) {
      console.error('Error tracking view:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading properties...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Property Listings</h1>

      {properties.length === 0 ? (
        <div className="text-center text-gray-500">No properties found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 relative">
                {property.cover_image_url && (
                  <img
                    src={property.cover_image_url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                  For Sale
                </div>
              </div>
              <div className="p-6">
                <div className="text-2xl font-bold text-gray-900 mb-2">${property.price.toLocaleString()}</div>
                <div className="text-gray-600 mb-2">{property.address}, {property.city}, {property.state} {property.zip}</div>
                <div className="text-gray-500 mb-4">
                  {property.beds} beds • {property.baths} baths • {property.sqft?.toLocaleString()} sqft
                </div>
                <Link
                  to={`/listing/${property.id}`}
                  onClick={() => handleViewListing(property.id)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors inline-block text-center"
                >
                  View Listing
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Listings