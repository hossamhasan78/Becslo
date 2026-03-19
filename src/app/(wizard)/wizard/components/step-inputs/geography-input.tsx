'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { usePricing } from '@/components/context/PricingContext'
import { useState, useEffect } from 'react'

interface CountryData {
  id: number
  name: string
  code: string
  multiplier: number
}

export function GeographyInput() {
  const { state, setDesignerCountryId, setClientCountryId, setDesignerCountryCode, setClientCountryCode } = useWizard()
  const { setPricing, validationErrors, clearValidationErrors, hasErrors } = usePricing()
  const [countries, setCountries] = useState<CountryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/v1/countries')

        if (!response.ok) {
          throw new Error(`Failed to fetch countries: ${response.statusText}`)
        }

        const data = await response.json()
        setCountries(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch countries:', error)
        setError('Unable to load countries. Please try again.')
        setCountries([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchCountries()
  }, [])

  useEffect(() => {
    const designer = countries.find(c => c.id === state.designerCountryId)
    const client = countries.find(c => c.id === state.clientCountryId)
    const designerCode = designer?.code || ''
    const clientCode = client?.code || ''
    setDesignerCountryCode(designerCode)
    setClientCountryCode(clientCode)
    setPricing({
      designerCountryCode: designerCode,
      clientCountryCode: clientCode
    })
  }, [state.designerCountryId, state.clientCountryId, countries, setPricing, setDesignerCountryCode, setClientCountryCode])

  const handleDesignerChange = (countryId: number | null) => {
    clearValidationErrors('designerCountryCode')
    setDesignerCountryId(countryId)
  }

  const handleClientChange = (countryId: number | null) => {
    clearValidationErrors('clientCountryCode')
    setClientCountryId(countryId)
  }

  const designerError = validationErrors.find(e => e.field === 'designerCountryCode')?.message
  const clientError = validationErrors.find(e => e.field === 'clientCountryCode')?.message

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Geographic Location</h3>

      {isLoading && (
        <p className="text-zinc-500">Loading countries...</p>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 underline"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div>
            <label htmlFor="designerCountry" className="block text-sm font-medium text-gray-700 mb-2">
              Designer Country
            </label>
            <select
              id="designerCountry"
              value={state.designerCountryId || ''}
              onChange={(e) => handleDesignerChange(e.target.value ? parseInt(e.target.value) : null)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                hasErrors('designerCountryCode') ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a country</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            {designerError && (
              <p className="text-sm text-red-600 mt-1">{designerError}</p>
            )}
          </div>

          <div>
            <label htmlFor="clientCountry" className="block text-sm font-medium text-gray-700 mb-2">
              Client Country
            </label>
            <select
              id="clientCountry"
              value={state.clientCountryId || ''}
              onChange={(e) => handleClientChange(e.target.value ? parseInt(e.target.value) : null)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                hasErrors('clientCountryCode') ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a country</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            {clientError && (
              <p className="text-sm text-red-600 mt-1">{clientError}</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
