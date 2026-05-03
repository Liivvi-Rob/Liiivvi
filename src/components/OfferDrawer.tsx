import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { createOffer } from '../lib/supabase'

type PropertySource = "fsbo" | "mls"

interface OfferDrawerProps {
  propertyId: string
  source: PropertySource
  sourceUrl?: string
  address: string
  city: string
  state: string
  price?: number
  onClose: () => void
}

type OfferData = {
  offerPrice: number
  financingType: 'cash' | 'loan' | 'other'
  inspection: boolean
  closingDays: number
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  hasAgent: boolean
  buyerAgentName: string
  buyerAgentEmail: string
  buyerAgentPhone: string
  notes: string
}

function OfferDrawer({
  propertyId,
  source,
  sourceUrl,
  address,
  city,
  state,
  price,
  onClose
}: OfferDrawerProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [offerData, setOfferData] = useState<OfferData>({
    offerPrice: price || 0,
    financingType: 'cash',
    inspection: true,
    closingDays: 30,
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    hasAgent: false,
    buyerAgentName: '',
    buyerAgentEmail: '',
    buyerAgentPhone: '',
    notes: ''
  })

  const totalSteps = 4

  const updateOfferData = (field: keyof OfferData, value: any) => {
    setOfferData(prev => ({ ...prev, [field]: value }))
  }

  const adjustOfferPrice = (percentage: number) => {
    if (!price) return
    const adjustment = price * (percentage / 100)
    updateOfferData('offerPrice', price + adjustment)
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

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const offerPayload = {
        [source === 'fsbo' ? 'property_id' : 'mls_preview_property_id']: propertyId,
        source,
        source_url: sourceUrl,
        property_address: address,
        property_city: city,
        property_state: state,
        property_price: price,
        offer_price: offerData.offerPrice,
        financing_type: offerData.financingType,
        inspection: offerData.inspection,
        closing_days: offerData.closingDays,
        buyer_name: offerData.buyerName,
        buyer_email: offerData.buyerEmail,
        buyer_phone: offerData.buyerPhone,
        has_agent: offerData.hasAgent,
        buyer_agent_name: offerData.hasAgent ? offerData.buyerAgentName : undefined,
        buyer_agent_email: offerData.hasAgent ? offerData.buyerAgentEmail : undefined,
        buyer_agent_phone: offerData.hasAgent ? offerData.buyerAgentPhone : undefined,
        notes: offerData.notes,
        status: 'submitted' as const,
        raw_offer: offerData
      }

      await createOffer(offerPayload)
      setCurrentStep(5) // Success step
    } catch (error) {
      console.error('Error submitting offer:', error)
      alert('Error submitting offer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Offer Price</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Offer Price
                  </label>
                  <input
                    type="number"
                    value={offerData.offerPrice}
                    onChange={(e) => updateOfferData('offerPrice', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter offer amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Adjustments
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => adjustOfferPrice(-10)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      -10%
                    </button>
                    <button
                      onClick={() => adjustOfferPrice(-5)}
                      className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                    >
                      -5%
                    </button>
                    <button
                      onClick={() => updateOfferData('offerPrice', price || 0)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Asking
                    </button>
                    <button
                      onClick={() => adjustOfferPrice(5)}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                    >
                      +5%
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Want help structuring this offer?{' '}
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Suggest Offer
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Terms</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Financing
                </label>
                <select
                  value={offerData.financingType}
                  onChange={(e) => updateOfferData('financingType', e.target.value as 'cash' | 'loan' | 'other')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="loan">Loan</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspection
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={offerData.inspection}
                      onChange={() => updateOfferData('inspection', true)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!offerData.inspection}
                      onChange={() => updateOfferData('inspection', false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Closing Timeline
                </label>
                <select
                  value={offerData.closingDays}
                  onChange={(e) => updateOfferData('closingDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={15}>15 days</option>
                  <option value={30}>30 days</option>
                  <option value={45}>45 days</option>
                  <option value={60}>60 days</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Buyer Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={offerData.buyerName}
                  onChange={(e) => updateOfferData('buyerName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={offerData.buyerEmail}
                  onChange={(e) => updateOfferData('buyerEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={offerData.buyerPhone}
                  onChange={(e) => updateOfferData('buyerPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={offerData.hasAgent}
                    onChange={(e) => updateOfferData('hasAgent', e.target.checked)}
                    className="mr-2"
                  />
                  I have an agent
                </label>
              </div>
              {offerData.hasAgent && (
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agent Name
                    </label>
                    <input
                      type="text"
                      value={offerData.buyerAgentName}
                      onChange={(e) => updateOfferData('buyerAgentName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agent Email
                    </label>
                    <input
                      type="email"
                      value={offerData.buyerAgentEmail}
                      onChange={(e) => updateOfferData('buyerAgentEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agent Phone
                    </label>
                    <input
                      type="tel"
                      value={offerData.buyerAgentPhone}
                      onChange={(e) => updateOfferData('buyerAgentPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={offerData.notes}
                  onChange={(e) => updateOfferData('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any additional notes or questions..."
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Review Your Offer</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Property</h4>
                <p className="text-sm text-gray-600">{address}, {city}, {state}</p>
                <p className="text-sm text-gray-600">Asking: {price ? `$${price.toLocaleString()}` : 'TBD'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Your Offer</h4>
                <p className="text-sm text-gray-600">Price: ${offerData.offerPrice.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Financing: {offerData.financingType}</p>
                <p className="text-sm text-gray-600">Inspection: {offerData.inspection ? 'Yes' : 'No'}</p>
                <p className="text-sm text-gray-600">Closing: {offerData.closingDays} days</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Buyer Information</h4>
                <p className="text-sm text-gray-600">{offerData.buyerName}</p>
                <p className="text-sm text-gray-600">{offerData.buyerEmail}</p>
                {offerData.buyerPhone && <p className="text-sm text-gray-600">{offerData.buyerPhone}</p>}
                {offerData.hasAgent && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Agent: {offerData.buyerAgentName}</p>
                    <p className="text-sm text-gray-600">{offerData.buyerAgentEmail}</p>
                    {offerData.buyerAgentPhone && <p className="text-sm text-gray-600">{offerData.buyerAgentPhone}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="text-center space-y-4">
            <div className="text-green-600 text-4xl">✓</div>
            <h3 className="text-lg font-semibold">Offer Submitted!</h3>
            <p className="text-gray-600">
              Your offer has been prepared and submitted. Robert McLendon can help with the next step.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={currentStep === 1 ? onClose : prevStep}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {currentStep === 1 ? <X size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div className="flex space-x-1">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full ${
                  i + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        {currentStep < 5 && (
          <div className="p-4 border-t bg-gray-50">
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Next <ChevronRight size={16} className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Offer'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default OfferDrawer