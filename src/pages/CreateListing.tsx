

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { createProperty, supabase } from '../lib/supabase'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

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
  const [currentStep, setCurrentStep] = useState(1)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PropertyForm>()
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const navigate = useNavigate()

  const totalSteps = 4

  const generateDescription = () => {
    alert('AI description generation is disabled in this public-safe version. Please enter a description manually.')
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

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Address</h2>
              <p className="text-gray-600">Got it — nice area.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Address</label>
                <input
                  id="address"
                  {...register('address', { required: 'Address is required' })}
                  type="text"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter property address"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">City</label>
                  <input
                    {...register('city', { required: 'City is required' })}
                    type="text"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">State</label>
                  <input
                    {...register('state', { required: 'State is required' })}
                    type="text"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">ZIP Code</label>
                <input
                  {...register('zip', { required: 'ZIP is required' })}
                  type="text"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip.message}</p>}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Photos</h2>
              <p className="text-gray-600">Front photo works great as a cover.</p>
            </div>
            <div>
              <label className="block text-gray-700 mb-4 font-medium">Upload Photos (up to 25)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImages(Array.from(e.target.files || []))}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Choose Photos
                </label>
                {images.length > 0 && (
                  <p className="text-gray-600 mt-4">{images.length} photo(s) selected</p>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Details</h2>
              <p className="text-gray-600">Want me to improve this description?</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Property Title</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Beautiful 3BR Home"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Bedrooms</label>
                  <input
                    {...register('beds', { required: 'Bedrooms is required', min: 0 })}
                    type="number"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.beds && <p className="text-red-500 text-sm mt-1">{errors.beds.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Bathrooms</label>
                  <input
                    {...register('baths', { required: 'Bathrooms is required', min: 0 })}
                    type="number"
                    step="0.5"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.baths && <p className="text-red-500 text-sm mt-1">{errors.baths.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Price</label>
                  <input
                    {...register('price', { required: 'Price is required', min: 0 })}
                    type="number"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="$"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Square Feet</label>
                  <input
                    {...register('sqft', { min: 0 })}
                    type="number"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Description</label>
                <textarea
                  {...register('description')}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe your property..."
                ></textarea>
                <button
                  type="button"
                  onClick={generateDescription}
                  className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                >
                  Generate with AI
                </button>
              </div>
            </div>
          </div>
        )

      case 4:
        const formData = watch()
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Publish</h2>
              <p className="text-gray-600">Ready to list your property!</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{formData.title}</h3>
                <p className="text-gray-600">{formData.address}, {formData.city}, {formData.state} {formData.zip}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Price:</span> ${formData.price?.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Beds/Baths:</span> {formData.beds}/{formData.baths}
                </div>
                {formData.sqft && (
                  <div>
                    <span className="font-medium">Sq Ft:</span> {formData.sqft.toLocaleString()}
                  </div>
                )}
                <div>
                  <span className="font-medium">Photos:</span> {images.length}
                </div>
              </div>
              {formData.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-gray-600 mt-1 text-sm">{formData.description}</p>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <div className="flex-1 flex justify-center">
              <div className="flex space-x-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-12 rounded-full ${
                      i + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            {currentStep > 1 && <div className="w-10" />}
          </div>
          <div className="text-center">
            <span className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent()}

          {/* Navigation */}
          <div className="mt-8 space-y-4">
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Next <ChevronRight size={20} className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {uploading ? 'Publishing...' : 'Publish Listing'} <Check size={20} className="ml-2" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateListing