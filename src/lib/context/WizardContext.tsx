'use client'

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import { WizardState, DEFAULT_WIZARD_STATE, PricingModel, SelectedService } from '@/types/wizard'
import { useSessionStorage } from '@/lib/hooks/useSessionStorage'
import { validateStep, StepValidationResult } from '@/lib/validation/step-validators'
import { calculatePrice } from '@/lib/pricing-engine'
import { PricingInput, PricingOutput } from '@/lib/types/pricing'

interface WizardContextValue {
  state: WizardState
  result: PricingOutput | null
  isLoading: boolean
  error: string | null
  updateState: (updates: Partial<WizardState>) => void
  setCurrentStep: (step: number) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  resetWizard: () => void
  validateCurrentStep: () => StepValidationResult
  loadPricingData: () => Promise<void>
  // Helper setters for convenience
  setPricingModel: (model: PricingModel | null) => void
  setExperienceDesigner: (level: number) => void
  setExperienceFreelance: (level: number) => void
  setDesignerCountryId: (countryId: number | null) => void
  setClientCountryId: (countryId: number | null) => void
  setDesignerCountryCode: (code: string) => void
  setClientCountryCode: (code: string) => void
  toggleCost: (costId: number) => void
  setRiskBuffer: (value: number) => void
  setProfitMargin: (value: number) => void
  addService: (service: SelectedService) => void
  removeService: (serviceId: number) => void
  updateServiceHours: (serviceId: number, hours: number) => void
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined)

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}

export function WizardProvider({ children }: { children: React.ReactNode }) {
  // Use sessionStorage for persistence
  const [state, setState] = useSessionStorage<WizardState>('becslo_wizard_state', DEFAULT_WIZARD_STATE)
  
  // Pricing data state
  const [countries, setCountries] = useState<{ code: string; multiplier: number }[]>([])
  const [costs, setCosts] = useState<{ id: string; isFixedAmount: boolean; defaultCost: number }[]>([])
  const [services, setServices] = useState<{ id: string; name: string; baseRate: number }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch pricing data on mount
  const loadPricingData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [countriesRes, costsRes, servicesRes] = await Promise.all([
        fetch('/api/v1/countries').then(res => res.ok ? res.json() : Promise.reject('Failed to load countries')),
        fetch('/api/v1/costs').then(res => res.ok ? res.json() : Promise.reject('Failed to load costs')),
        fetch('/api/v1/services').then(res => res.ok ? res.json() : Promise.reject('Failed to load services'))
      ])

      // Map Supabase response to engine format
      setCountries(countriesRes.map((c: { code: string; multiplier: number }) => ({ code: c.code, multiplier: c.multiplier })))
      setCosts(costsRes.map((c: { id: number; is_fixed_amount: boolean; default_cost: number }) => ({ id: String(c.id), isFixedAmount: c.is_fixed_amount, defaultCost: c.default_cost })))
      setServices(servicesRes.map((s: { id: number; name: string; base_rate: number }) => ({ id: String(s.id), name: s.name, baseRate: s.base_rate })))
    } catch (err: any) {
      console.error('Data fetch error:', err)
      setError(err.message || 'Error loading pricing data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPricingData()
  }, [loadPricingData])

  // Compute pricing result
  const result = useMemo(() => {
    if (countries.length === 0 || services.length === 0) return null
    if (state.services.length === 0) return null

    // Map WizardState to PricingInput format
    const pricingInput: PricingInput = {
      pricingModel: state.pricingModel || 'hourly',
      services: state.services.map(s => ({ serviceId: String(s.id), hours: s.hours })),
      designerExperience: state.experienceDesigner,
      freelanceExperience: state.experienceFreelance,
      designerCountryCode: state.designerCountryCode,
      clientCountryCode: state.clientCountryCode,
      selectedCosts: state.costs.map(String),
      riskBufferPercent: state.riskBuffer,
      profitMarginPercent: state.profitMargin
    }

    try {
      return calculatePrice(pricingInput, countries, costs, services)
    } catch (err) {
      console.error('Calculation error:', err)
      return null
    }
  }, [state, countries, costs, services])

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [setState])

  const setCurrentStep = useCallback((step: number) => {
    updateState({ currentStep: step })
  }, [updateState])

  const validateCurrentStep = useCallback(() => {
    return validateStep(state.currentStep, state)
  }, [state])

  const goToNextStep = useCallback(() => {
    const validation = validateCurrentStep()
    if (!validation.isValid) return

    setState(prev => ({
      ...prev,
      highestCompletedStep: Math.max(prev.highestCompletedStep, prev.currentStep),
      currentStep: Math.min(prev.currentStep + 1, 7)
    }))
  }, [state.currentStep, setState, validateCurrentStep])

  const goToPreviousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1)
    }))
  }, [setState])

  const resetWizard = useCallback(() => {
    setState(DEFAULT_WIZARD_STATE)
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('becslo_wizard_state')
    }
  }, [setState])

  // Convenience setters
  const setPricingModel = (model: PricingModel | null) => updateState({ pricingModel: model })
  const setExperienceDesigner = (level: number) => updateState({ experienceDesigner: level })
  const setExperienceFreelance = (level: number) => updateState({ experienceFreelance: level })
  const setDesignerCountryId = (countryId: number | null) => updateState({ designerCountryId: countryId })
  const setClientCountryId = (countryId: number | null) => updateState({ clientCountryId: countryId })
  const setDesignerCountryCode = (code: string) => updateState({ designerCountryCode: code })
  const setClientCountryCode = (code: string) => updateState({ clientCountryCode: code })
  
  const toggleCost = (costId: number) => {
    const exists = state.costs.includes(costId)
    updateState({
      costs: exists ? state.costs.filter(id => id !== costId) : [...state.costs, costId]
    })
  }

  const setRiskBuffer = (value: number) => updateState({ riskBuffer: value })
  const setProfitMargin = (value: number) => updateState({ profitMargin: value })

  const addService = (service: SelectedService) => updateState({ services: [...state.services, service] })
  const removeService = (serviceId: number) => updateState({ services: state.services.filter(s => s.id !== serviceId) })
  const updateServiceHours = (serviceId: number, hours: number) => {
    updateState({
      services: state.services.map(s => s.id === serviceId ? { ...s, hours } : s)
    })
  }

  return (
    <WizardContext.Provider
      value={{
        state,
        result,
        isLoading,
        error,
        updateState,
        setCurrentStep,
        goToNextStep,
        goToPreviousStep,
        resetWizard,
        validateCurrentStep,
        loadPricingData,
        setPricingModel,
        setExperienceDesigner,
        setExperienceFreelance,
        setDesignerCountryId,
        setClientCountryId,
        setDesignerCountryCode,
        setClientCountryCode,
        toggleCost,
        setRiskBuffer,
        setProfitMargin,
        addService,
        removeService,
        updateServiceHours
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}
