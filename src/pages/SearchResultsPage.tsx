import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import { fetchProperties, fetchMLSPreviewProperties, createPropertySearchEvent } from '../lib/supabase'
import type { Property, MLSPreviewProperty } from '../lib/supabase'

function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const [fsboProperties, setFsboProperties] = useState<Property[]>([])
  const [mlsProperties, setMlsProperties] = useState<MLSPreviewProperty[]>([])
  const [loading, setLoading] = useState(true)

  const query = searchParams.get('q') || ''
  const showFSBO = searchParams.get('fsbo') === 'true'
  const showMLS = searchParams.get('mls') === 'true'

  useEffect(() => {
    const loadSearchResults = async () => {
      setLoading(true)
      try {
        const searchPromises = []

        if (showFSBO) {
          searchPromises.push(
            fetchProperties({ status: 'active', query })
          )
        }

        if (showMLS) {
          searchPromises.push(
            fetchMLSPreviewProperties({ query })
          )
        }

        const results = await Promise.all(searchPromises)

        const fsboResults = showFSBO && results.length > 0 ? results[0] as Property[] : []
        const mlsResults = showMLS && results.length > (showFSBO ? 1 : 0) ? results[showFSBO ? 1 : 0] as MLSPreviewProperty[] : []

        setFsboProperties(fsboResults)
        setMlsProperties(mlsResults)

        // Log search event
        const totalResults = fsboResults.length + mlsResults.length
        try {
          await createPropertySearchEvent({
            search_query: query,
            fsbo_enabled: showFSBO,
            mls_enabled: showMLS,
            results_count: totalResults,
            user_agent: navigator.userAgent
          })
        } catch (error) {
          console.error('Error logging search event:', error)
        }
      } catch (error) {
        console.error('Error loading search results:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSearchResults()
  }, [query, showFSBO, showMLS])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Searching properties...</div>
      </div>
    )
  }

  const hasResults = (showFSBO && fsboProperties.length > 0) || (showMLS && mlsProperties.length > 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Search Results for "{query}"
      </h1>

      {!hasResults && showMLS && mlsProperties.length === 0 && (
        <div className="text-center mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              No MLS preview listings are loaded yet
            </h3>
            <p className="text-blue-700 mb-4">
              Search Robert McLendon's live eXp MLS site for current listings.
            </p>
            <a
              href="https://robertmclendon.exprealty.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Visit Robert McLendon / eXp Realty
            </a>
          </div>
        </div>
      )}

      {/* FSBO Results */}
      {showFSBO && fsboProperties.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Liivvi FSBO Listings ({fsboProperties.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fsboProperties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                source="fsbo"
                sourceUrl={property.propy_url}
                imageUrl={property.cover_image_url || undefined}
                price={property.price}
                address={property.address}
                city={property.city}
                state={property.state}
                zip={property.zip}
                bedrooms={property.beds}
                bathrooms={property.baths}
                squareFeet={property.sqft}
              />
            ))}
          </div>
        </div>
      )}

      {/* MLS Results */}
      {showMLS && mlsProperties.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            MLS Preview Listings ({mlsProperties.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mlsProperties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                source="mls"
                sourceUrl={property.source_url}
                imageUrl={property.image_url}
                price={property.price}
                address={property.address}
                city={property.city}
                state={property.state}
                zip={property.zip}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                squareFeet={property.square_feet}
              />
            ))}
          </div>
        </div>
      )}

      {!hasResults && (
        <div className="text-center text-gray-500">
          No properties found matching your search criteria.
        </div>
      )}
    </div>
  )
}

export default SearchResultsPage