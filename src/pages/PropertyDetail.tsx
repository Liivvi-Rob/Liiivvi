

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchPropertyById, trackPropertyEvent, createShowingRequest, createMessage } from '../lib/supabase'
import type { Property } from '../lib/supabase'

interface ShowingFormData {
  name: string
  email: string
  phone: string
  date: string
  time: string
  notes?: string
}

interface MessageFormData {
  name: string
  email: string
  message: string
}

function PropertyDetail() {
  const { id } = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [showingForm, setShowingForm] = useState(false)
  const [messageForm, setMessageForm] = useState(false)

  useEffect(() => {
    if (id) {
      const loadProperty = async () => {
        try {
          const data = await fetchPropertyById(id)
          setProperty(data)
          await trackPropertyEvent(id, 'view')
        } catch (error) {
          console.error('Error loading property:', error)
        } finally {
          setLoading(false)
        }
      }
      loadProperty()
    }
  }, [id])

  const handleScheduleShowing = async (formData: ShowingFormData) => {
    if (!property) return
    try {
      await createShowingRequest({
        property_id: property.id,
        buyer_name: formData.name,
        buyer_email: formData.email,
        buyer_phone: formData.phone,
        requested_date: formData.date,
        requested_time: formData.time,
        status: 'pending',
        notes: formData.notes
      })
      await trackPropertyEvent(property.id, 'showing_request')
      alert('Showing request submitted!')
      setShowingForm(false)
    } catch (error) {
      console.error('Error creating showing request:', error)
    }
  }

  const handleMakeOffer = async () => {
    if (!property) return
    try {
      await trackPropertyEvent(property.id, 'offer_click')
      // Here you would typically open a modal or navigate to offer form
      alert('Offer functionality would be implemented here')
    } catch (error) {
      console.error('Error tracking offer click:', error)
    }
  }

  const handleSendMessage = async (formData: MessageFormData) => {
    if (!property) return
    try {
      await createMessage({
        property_id: property.id,
        sender_name: formData.name,
        sender_email: formData.email,
        message: formData.message
      })
      alert('Message sent!')
      setMessageForm(false)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading property...</div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-500">Property not found.</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{property.title}</h1>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="h-96 bg-gray-200 rounded-lg overflow-hidden">
          {property.cover_image_url && (
            <img
              src={property.cover_image_url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        {property.image_urls && property.image_urls.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {property.image_urls.slice(1, 5).map((url, index) => (
              <div key={index} className="h-20 bg-gray-200 rounded">
                <img src={url} alt={`Property ${index + 2}`} className="w-full h-full object-cover rounded" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="text-4xl font-bold text-gray-900 mb-4">${property.price.toLocaleString()}</div>
          <div className="text-gray-600 mb-4">
            {property.address}<br />
            {property.city}, {property.state} {property.zip}
          </div>
          <div className="text-gray-500 mb-6">
            {property.beds} beds • {property.baths} baths • {property.sqft?.toLocaleString()} sqft
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowingForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Schedule Showing
            </button>
            <button
              onClick={handleMakeOffer}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Make Offer
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Description</h3>
          <p className="text-gray-700">{property.description}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setMessageForm(true)}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
        >
          Send Message
        </button>
      </div>

      {/* Showing Request Form */}
      {showingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Schedule Showing</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              handleScheduleShowing({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                date: formData.get('date') as string,
                time: formData.get('time') as string,
                notes: formData.get('notes') as string | undefined
              })
            }}>
              <input name="name" type="text" placeholder="Name" required className="w-full mb-2 p-2 border rounded" />
              <input name="email" type="email" placeholder="Email" required className="w-full mb-2 p-2 border rounded" />
              <input name="phone" type="tel" placeholder="Phone" className="w-full mb-2 p-2 border rounded" />
              <input name="date" type="date" required className="w-full mb-2 p-2 border rounded" />
              <input name="time" type="time" required className="w-full mb-2 p-2 border rounded" />
              <textarea name="notes" placeholder="Notes" className="w-full mb-4 p-2 border rounded"></textarea>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
                <button type="button" onClick={() => setShowingForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Form */}
      {messageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Send Message</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              handleSendMessage({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                message: formData.get('message') as string
              })
            }}>
              <input name="name" type="text" placeholder="Name" required className="w-full mb-2 p-2 border rounded" />
              <input name="email" type="email" placeholder="Email" required className="w-full mb-2 p-2 border rounded" />
              <textarea name="message" placeholder="Message" required className="w-full mb-4 p-2 border rounded" rows={4}></textarea>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
                <button type="button" onClick={() => setMessageForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyDetail