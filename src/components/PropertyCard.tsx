import { useState } from 'react'
import OfferDrawer from './OfferDrawer'

type PropertySource = "fsbo" | "mls"

type PropertyCardProps = {
  id: string
  source: PropertySource
  sourceUrl?: string
  imageUrl?: string
  price?: number
  address?: string
  city?: string
  state?: string
  zip?: string
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
}

function PropertyCard({
  id,
  source,
  sourceUrl,
  imageUrl,
  price,
  address,
  city,
  state,
  zip,
  bedrooms,
  bathrooms,
  squareFeet
}: PropertyCardProps) {
  const [showOfferDrawer, setShowOfferDrawer] = useState(false)

  const isFSBO = source === 'fsbo'

  const handleViewListing = () => {
    if (sourceUrl) {
      window.open(sourceUrl, '_blank')
    }
  }

  const handleMakeOffer = () => {
    setShowOfferDrawer(true)
  }

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
        isFSBO ? 'border-l-4 border-purple-500' : 'border-l-4 border-blue-500'
      }`}>
        {/* Badge */}
        <div className={`px-3 py-1 text-xs font-semibold text-white ${
          isFSBO ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-slate-500'
        }`}>
          {isFSBO ? 'Liivvi FSBO' : 'MLS via Robert McLendon / eXp Realty'}
        </div>

        {/* Image */}
        <div className="h-48 bg-gray-200 relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={address}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {price ? `$${price.toLocaleString()}` : 'Price TBD'}
          </div>
          <div className="text-gray-600 mb-2">
            {address}, {city}, {state} {zip}
          </div>
          <div className="text-gray-500 mb-4">
            {bedrooms && `${bedrooms} beds • `}
            {bathrooms && `${bathrooms} baths • `}
            {squareFeet && `${squareFeet.toLocaleString()} sqft`}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleViewListing}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                isFSBO
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                  : 'bg-gradient-to-r from-blue-600 to-slate-600 text-white hover:from-blue-700 hover:to-slate-700'
              }`}
            >
              View {isFSBO ? 'FSBO' : 'MLS'} Listing
            </button>
            <button
              onClick={handleMakeOffer}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Make Offer
            </button>
          </div>

          {/* MLS Disclaimer */}
          {!isFSBO && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              MLS availability and details should be verified on the official listing page.
            </p>
          )}
        </div>
      </div>

      {/* Offer Drawer */}
      {showOfferDrawer && (
        <OfferDrawer
          propertyId={id}
          source={source}
          sourceUrl={sourceUrl}
          address={address || ''}
          city={city || ''}
          state={state || ''}
          price={price}
          onClose={() => setShowOfferDrawer(false)}
        />
      )}
    </>
  )
}

export default PropertyCard