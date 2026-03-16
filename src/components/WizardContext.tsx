'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { calculatePrice, type CalculationInput, type CalculationResult } from '@/lib/pricing-engine'

interface WizardContextType {
  step: number
  setStep: (step: number) => void
  input: CalculationInput
  updateInput: (updates: Partial<CalculationInput>) => void
  result: CalculationResult | null
  services: Record<string, Array<{ id: string; name: string; category: string; default_hours: number; min_hours: number; max_hours: number }>>
  config: Record<string, unknown>
  countries: Array<{ code: string; name: string }>
  errors: Record<string, string>
  setError: (field: string, error: string) => void
  clearError: (field: string) => void
  clearAllErrors: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const WizardContext = createContext<WizardContextType | null>(null)

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within WizardProvider')
  return ctx
}

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<WizardContextType['services']>({})
  const [config, setConfig] = useState<Record<string, unknown>>({})
  const [countries, setCountries] = useState<WizardContextType['countries']>([])
  const [input, setInput] = useState<CalculationInput>({
    experienceYears: 0,
    freelanceYears: 0,
    designerCountry: 'US',
    clientCountry: 'US',
    pricingModel: 'hourly',
    riskLevel: 'normal',
    profitMargin: 20,
    services: [],
    costs: []
  })
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [servicesRes, configRes, countriesRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/config'),
        fetch('/api/countries')
      ])
      const servicesData = await servicesRes.json()
      const configData = await configRes.json()
      const countriesData = await countriesRes.json()
      setServices(servicesData)
      setConfig(configData)
      setCountries(countriesData)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!config.base_hourly_rate) return
    
    const calcResult = calculatePrice(input, {
      baseHourlyRate: config.base_hourly_rate as number,
      experienceMultipliers: (config.experience_multipliers as Parameters<typeof calculatePrice>[1]['experienceMultipliers']) || {
        designer: { '0-2': 0.7, '3-5': 1.0, '6-9': 1.3, '10+': 1.6 },
        freelance: { '0-1': 0.8, '2-3': 1.0, '4-6': 1.2, '7+': 1.4 }
      },
      geoMultipliers: (config.geo_multipliers as Parameters<typeof calculatePrice>[1]['geoMultipliers']) || {},
      riskBuffer: (config.risk_buffer as number) || 10
    })
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult(calcResult)
  }, [input, config])

  const updateInput = (updates: Partial<CalculationInput>) => {
    setInput(prev => ({ ...prev, ...updates }))
  }

  const setError = (field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  const clearAllErrors = () => {
    setErrors({})
  }

  return (
    <WizardContext.Provider value={{ step, setStep, input, updateInput, result, services, config, countries, errors, setError, clearError, clearAllErrors, isLoading, setIsLoading }}>
      {children}
    </WizardContext.Provider>
  )
}
