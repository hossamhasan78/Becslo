'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useMemo, useRef, useEffect } from 'react'
import type { PricingInput, PricingOutput, ValidationError } from '@/lib/types/pricing'
import { calculatePrice } from '@/lib/pricing-engine'
import { validatePricingInput } from '@/lib/utils/validation'

interface PricingContextType {
  pricing: PricingInput
  result: PricingOutput | null
  validationErrors: ValidationError[]
  setPricing: (pricing: Partial<PricingInput>) => void
  calculate: () => void
  clearValidationErrors: () => void
  isLoading: boolean
}

const defaultPricing: PricingInput = {
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
  setPricing: () => {},
  calculate: () => {},
  clearValidationErrors: () => {},
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

export function PricingProvider({ children }: { children: ReactNode }) {
  const [pricing, setPricingState] = useState<PricingInput>(defaultPricing)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<CountryMultiplier[]>([])
  const [costs, setCosts] = useState<CostItem[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const result = useMemo(() => {
    const hasRequiredFields = pricing.services.length > 0 &&
                               pricing.designerCountryCode.length === 2 &&
                               pricing.clientCountryCode.length === 2 &&
                               countries.length > 0 &&
                               costs.length > 0 &&
                               services.length > 0

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
        const hasRequiredFields = updated.services.length > 0 &&
                                 updated.designerCountryCode.length === 2 &&
                                 updated.clientCountryCode.length === 2

        if (hasRequiredFields) {
          const errors = validatePricingInput(updated)
          setValidationErrors(errors)
        } else {
          setValidationErrors([])
        }
        return updated
      })
    }, 100)
  }, [])

  const clearValidationErrors = useCallback(() => {
    setValidationErrors([])
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const calculate = useCallback(async () => {
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
      console.error('Calculation error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const contextValue = {
    pricing,
    result,
    validationErrors,
    setPricing,
    calculate,
    clearValidationErrors,
    isLoading
  }

  return (
    <PricingContext.Provider value={contextValue}>
      {children}
    </PricingContext.Provider>
  )
}
