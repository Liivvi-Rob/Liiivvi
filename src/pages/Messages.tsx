

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchMessages, createMessage, fetchPropertyById } from '../lib/supabase'
import type { Message, Property } from '../lib/supabase'

function Messages() {
  const { propertyId } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        if (propertyId) {
          const [messagesData, propertyData] = await Promise.all([
            fetchMessages(propertyId),
            fetchPropertyById(propertyId)
          ])
          setMessages(messagesData)
          setProperty(propertyData)
        } else {
          const messagesData = await fetchMessages()
          setMessages(messagesData)
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [propertyId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!propertyId || !newMessage.trim() || !senderName.trim() || !senderEmail.trim()) return

    try {
      await createMessage({
        property_id: propertyId,
        sender_name: senderName,
        sender_email: senderEmail,
        message: newMessage
      })

      // Refresh messages
      const messagesData = await fetchMessages(propertyId)
      setMessages(messagesData)

      // Clear form
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Messages {property && `for ${property.title}`}
      </h1>

      {/* Send Message Form */}
      {propertyId && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Send a Message</h2>
          <form onSubmit={handleSendMessage}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Your Name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <textarea
              placeholder="Your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
              required
            ></textarea>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Send Message
            </button>
          </form>
        </div>
      )}

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet.</p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-4 border-b pb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">
                      {message.sender_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{message.sender_name}</div>
                    <div className="text-gray-600">{message.message}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages