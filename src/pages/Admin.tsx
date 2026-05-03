

import React, { useState, useEffect } from 'react'
import { fetchProperties, updateProperty, isAdminUser, supabase } from '../lib/supabase'
import type { Property } from '../lib/supabase'

function Admin() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [adminLoading, setAdminLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const initAdmin = async () => {
      try {
        const admin = await isAdminUser()
        setIsAdmin(admin)
        if (admin) {
          await loadProperties()
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
      } finally {
        setAdminLoading(false)
      }
    }

    initAdmin()
  }, [])

  const loadProperties = async () => {
    setLoading(true)
    try {
      const data = await fetchProperties()
      setProperties(data)
    } catch (error) {
      console.error('Error loading properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (propertyId: string, newStatus: Property['status']) => {
    try {
      await updateProperty(propertyId, { status: newStatus })
      await loadProperties()
    } catch (error) {
      console.error('Error updating property:', error)
    }
  }

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setErrorMessage(error.message)
      return
    }

    try {
      const admin = await isAdminUser()
      setIsAdmin(admin)
      if (admin) {
        await loadProperties()
      } else {
        setErrorMessage('You are not authorized to access this dashboard.')
      }
    } catch (error) {
      setErrorMessage('Error verifying admin access.')
      console.error(error)
    }
  }

  const totalListings = properties.length
  const activeListings = properties.filter(p => p.status === 'active').length
  const soldListings = properties.filter(p => p.status === 'sold').length

  if (adminLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Checking admin access...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Sign In</h1>
          <p className="text-gray-600 mb-6">
            This dashboard is restricted to registered Liivvi admins.
          </p>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700">
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

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