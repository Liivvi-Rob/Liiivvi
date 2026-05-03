

import { useState, useEffect } from 'react'
import { fetchProperties, updateProperty } from '../lib/supabase'
import type { Property } from '../lib/supabase'

function Admin() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await fetchProperties()
        setProperties(data)
      } catch (error) {
        console.error('Error loading properties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  const handleStatusChange = async (propertyId: string, newStatus: Property['status']) => {
    try {
      await updateProperty(propertyId, { status: newStatus })
      // Refresh the list
      const data = await fetchProperties()
      setProperties(data)
    } catch (error) {
      console.error('Error updating property:', error)
    }
  }

  const totalListings = properties.length
  const activeListings = properties.filter(p => p.status === 'active').length
  const soldListings = properties.filter(p => p.status === 'sold').length

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Listings</h3>
          <div className="text-3xl font-bold text-blue-600">{totalListings}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Active Listings</h3>
          <div className="text-3xl font-bold text-green-600">{activeListings}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Sold Listings</h3>
          <div className="text-3xl font-bold text-purple-600">{soldListings}</div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Listings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Address</th>
                  <th className="text-left py-2">Price</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b">
                    <td className="py-2">{property.title}</td>
                    <td className="py-2">{property.address}</td>
                    <td className="py-2">${property.price.toLocaleString()}</td>
                    <td className="py-2">
                      <select
                        value={property.status}
                        onChange={(e) => handleStatusChange(property.id, e.target.value as Property['status'])}
                        className="px-2 py-1 border rounded"
                      >
                        <option value="active">Active</option>
                        <option value="under_contract">Under Contract</option>
                        <option value="sold">Sold</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <button className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                      <button
                        onClick={() => handleStatusChange(property.id, 'sold')}
                        className="text-red-600 hover:text-red-800"
                      >
                        Mark Sold
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin