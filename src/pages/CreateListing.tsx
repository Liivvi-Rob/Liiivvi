

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { createProperty, supabase } from '../lib/supabase'
import { openai } from '../lib/openai'

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: any
        }
      }
    }
  }
}

interface PropertyForm {
  title: string
  address: string
  city: string
  state: string
  zip: string
  price: number
  beds: number
  baths: number
  sqft: number
  description: string
}

function CreateListing() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PropertyForm>()
  const [generating, setGenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const initAutocomplete = () => {
      const input = document.getElementById('address') as HTMLInputElement
      if (input && window.google) {
        const autocomplete = new window.google.maps.places.Autocomplete(input, {
          types: ['address'],
          componentRestrictions: { country: 'us' }
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (place.formatted_address) {
            setValue('address', place.formatted_address)
          }

          // Extract components
          const components = place.address_components
          if (components) {
            const city = components.find((c: any) => c.types.includes('locality'))?.long_name
            const state = components.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name
            const zip = components.find((c: any) => c.types.includes('postal_code'))?.long_name

            if (city) setValue('city', city)
            if (state) setValue('state', state)
            if (zip) setValue('zip', zip)
          }
        })
      }
    }

    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
      script.onload = initAutocomplete
    } else {
      initAutocomplete()
    }
  }, [setValue])

  const generateDescription = async () => {
    const data = watch()
    if (!data.address || !data.beds || !data.baths || !data.price) {
      alert('Please fill in address, beds, baths, and price first')
      return
    }

    setGenerating(true)
    try {
      const prompt = `Generate a compelling real estate listing description for a ${data.beds} bedroom, ${data.baths} bathroom property located at ${data.address}, priced at $${data.price}. Make it engaging and highlight the best features for potential buyers.`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      })

      setValue('description', response.choices[0].message.content || '')
    } catch (error) {
      console.error('Error generating description:', error)
      alert('Failed to generate description')
    } finally {
      setGenerating(false)
    }
  }

  const onSubmit = async (data: PropertyForm) => {
    setUploading(true)
    try {
      // Upload images to Supabase storage
      const imageUrls: string[] = []
      for (const file of images) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const { error } = await supabase.storage
          .from('property-images')
          .upload(fileName, file)

        if (error) {
          console.error('Error uploading image:', error)
          continue
        }

        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName)

        imageUrls.push(urlData.publicUrl)
      }

      // Create property
      const propertyData = {
        ...data,
        cover_image_url: imageUrls[0] || null,
        image_urls: imageUrls,
        status: 'active' as const
      }

      const property = await createProperty(propertyData)
      alert('Listing created successfully!')
      navigate(`/listing/${property.id}`)
    } catch (error) {
      console.error('Error creating listing:', error)
      alert('Failed to create listing')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Listing</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            {...register('title', { required: 'Title is required' })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Property title"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Address</label>
          <input
            id="address"
            {...register('address', { required: 'Address is required' })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter property address"
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">City</label>
            <input
              {...register('city', { required: 'City is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">State</label>
            <input
              {...register('state', { required: 'State is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">ZIP</label>
            <input
              {...register('zip', { required: 'ZIP is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.zip && <p className="text-red-500 text-sm">{errors.zip.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Bedrooms</label>
            <input
              {...register('beds', { required: 'Bedrooms is required', min: 0 })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.beds && <p className="text-red-500 text-sm">{errors.beds.message}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Bathrooms</label>
            <input
              {...register('baths', { required: 'Bathrooms is required', min: 0 })}
              type="number"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.baths && <p className="text-red-500 text-sm">{errors.baths.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Price</label>
            <input
              {...register('price', { required: 'Price is required', min: 0 })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
            />
            {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Square Feet</label>
            <input
              {...register('sqft', { min: 0 })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Describe the property"
          ></textarea>
          <button
            type="button"
            onClick={generateDescription}
            disabled={generating}
            className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Photos (up to 25)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          {images.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">{images.length} file(s) selected</p>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  )
}

export default CreateListing