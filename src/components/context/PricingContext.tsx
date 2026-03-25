'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useMemo, useRef, useEffect } from 'react'
import type { PricingInput, PricingOutput } from '@/lib/types/pricing'
import { calculatePrice } from '@/lib/pricing-engine'
import { validatePricingInput } from '@/lib/utils/validation'

export interface FieldValidationError {
  field: string
  message: string
}

interface PricingContextType {
  pricing: PricingInput
  result: PricingOutput | null
  validationErrors: FieldValidationError[]
  serverValidationErrors: Record<string, string>
  setPricing: (pricing: Partial<PricingInput>) => void
  loadPricingData: () => Promise<void>
  clearValidationErrors: (field?: string) => void
  setServerValidationErrors: (errors: Record<string, string>) => void
  hasErrors: (field?: string) => boolean
  isLoading: boolean
}

  const defaultPricing: PricingInput = {
    pricingModel: 'hourly',
    services: [],
    designerExperience: 5,
    freelanceExperience: 5,
    designerCountryCode: '',
    clientCountryCode: '',
    selectedCosts: [],
    riskBufferPercent: 15,
    profitMarginPercent: 20
  }

const PricingContext = createContext<PricingContextType>({
  pricing: defaultPricing,
  result: null,
  validationErrors: [],
  serverValidationErrors: {},
  setPricing: () => {},
  loadPricingData: async () => {},
  clearValidationErrors: () => {},
  setServerValidationErrors: () => {},
  hasErrors: () => false,
  isLoading: false
})

export const usePricing = () => useContext(PricingContext)

interface CountryMultiplier {
  code: string
  multiplier: number
}

interface CostItem {
  id: string
  isFixedAmount: boolean
  defaultCost: number
}

interface ServiceItem {
  id: string
  name: string
  baseRate: number
}

async function fetchPricingData(
  setCountries: (data: CountryMultiplier[]) => void,
  setCosts: (data: CostItem[]) => void,
  setServices: (data: ServiceItem[]) => void,
  setIsLoading: (loading: boolean) => void
) {
  setIsLoading(true)
  try {
    const [countriesResponse, costsResponse, servicesResponse] = await Promise.all([
      fetch('/api/v1/countries').then(res => res.json()),
      fetch('/api/v1/costs').then(res => res.json()),
      fetch('/api/v1/services').then(res => res.json())
    ])

    const countriesData = countriesResponse.map((c: { code: string, multiplier: number }) => ({
      code: c.code,
      multiplier: c.multiplier
    }))

    const costsData = costsResponse.map((c: { id: number, is_fixed_amount: boolean, default_cost: number }) => ({
      id: String(c.id),
      isFixedAmount: c.is_fixed_amount,
      defaultCost: c.default_cost
    }))

    const servicesData = servicesResponse.map((s: { id: number, name: string, base_rate: number }) => ({
      id: String(s.id),
      name: s.name,
      baseRate: s.base_rate
    }))

    setCountries(countriesData)
    setCosts(costsData)
    setServices(servicesData)
  } catch (error) {
    console.error('Failed to load pricing data:', error)
  } finally {
    setIsLoading(false)
  }
}

export function PricingProvider({ children }: { children: ReactNode }) {
  const [pricing, setPricingState] = useState<PricingInput>(defaultPricing)
  const [validationErrors, setValidationErrors] = useState<FieldValidationError[]>([])
  const [serverValidationErrors, setServerValidationErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<CountryMultiplier[]>([])
  const [costs, setCosts] = useState<CostItem[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchPricingData(setCountries, setCosts, setServices, setIsLoading)
  }, [])

  const result = useMemo(() => {
    const hasRequiredFields = countries.length > 0 && costs.length > 0

    if (!hasRequiredFields) return null

    try {
      return calculatePrice(pricing, countries, costs, services)
    } catch (error) {
      console.error('Calculation error:', error)
      return null
    }
  }, [pricing, countries, costs, services])

  const setPricing = useCallback((updates: Partial<PricingInput>) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setPricingState(prev => {
        const updated = { ...prev, ...updates }
        const errors = validatePricingInput(updated)
        setValidationErrors(errors)
        return updated
      })
    }, 100)
  }, [])

  const clearValidationErrors = useCallback((field?: string) => {
    if (field) {
      setValidationErrors(prev => prev.filter(err => err.field !== field))
    } else {
      setValidationErrors([])
    }
  }, [])

  const hasErrors = useCallback((field?: string) => {
    if (field) {
      const hasFieldError = validationErrors.some(err => err.field === field) ||
                           !!serverValidationErrors[field]
      return hasFieldError
    }
    return validationErrors.length > 0 || Object.keys(serverValidationErrors).length > 0
  }, [validationErrors, serverValidationErrors])

  const loadPricingData = useCallback(async () => {
    await fetchPricingData(setCountries, setCosts, setServices, setIsLoading)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const contextValue = {
    pricing,
    result,
    validationErrors,
    serverValidationErrors,
    setPricing,
    loadPricingData,
    clearValidationErrors,
    setServerValidationErrors,
    hasErrors,
    isLoading
  }

  return (
    <PricingContext.Provider value={contextValue}>
      {children}
    </PricingContext.Provider>
  )
}
