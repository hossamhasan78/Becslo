'use client'

import { useWizard } from '@/components/WizardContext'
import { validateCountry } from '@/lib/validation'
import { useEffect } from 'react'

export function GeographyStep() {
  const { input, updateInput, setError, clearError, errors, countries } = useWizard()

  useEffect(() => {
    if (input.designerCountry) {
      clearError('designerCountry')
    }
  }, [input.designerCountry, clearError])

  useEffect(() => {
    if (input.clientCountry) {
      clearError('clientCountry')
    }
  }, [input.clientCountry, clearError])

  const handleDesignerCountryChange = (country: string) => {
    updateInput({ designerCountry: country })
    const validation = validateCountry(country)
    if (!validation.isValid) {
      setError('designerCountry', validation.error || 'Invalid')
    } else {
      clearError('designerCountry')
    }
  }

  const handleClientCountryChange = (country: string) => {
    updateInput({ clientCountry: country })
    const validation = validateCountry(country)
    if (!validation.isValid) {
      setError('clientCountry', validation.error || 'Invalid')
    } else {
      clearError('clientCountry')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Geographic Location</h2>
      
      <div>
        <label className="block font-medium mb-2">
          Your Country
        </label>
        <select
          value={input.designerCountry || ''}
          onChange={(e) => handleDesignerCountryChange(e.target.value)}
          className={`w-full p-2 border rounded-lg ${errors.designerCountry ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="">Select country...</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>{country.name}</option>
          ))}
        </select>
        {errors.designerCountry && (
          <p className="text-red-500 text-sm mt-1">{errors.designerCountry}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-2">
          Client&apos;s Country
        </label>
        <select
          value={input.clientCountry || ''}
          onChange={(e) => handleClientCountryChange(e.target.value)}
          className={`w-full p-2 border rounded-lg ${errors.clientCountry ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="">Select country...</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>{country.name}</option>
          ))}
        </select>
        {errors.clientCountry && (
          <p className="text-red-500 text-sm mt-1">{errors.clientCountry}</p>
        )}
      </div>
    </div>
  )
}
