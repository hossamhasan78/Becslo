'use client'

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import { WizardState, DEFAULT_WIZARD_STATE, PricingModel, SelectedService } from '@/types/wizard'
import { useSessionStorage } from '@/lib/hooks/useSessionStorage'
import { validateStep, StepValidationResult } from '@/lib/validation/step-validators'
import { calculatePrice } from '@/lib/pricing-engine'
import { PricingInput, PricingOutput, Category, Service, Country, Cost, Config } from '@/lib/types/pricing'

interface WizardContextValue {
  state: WizardState
  result: PricingOutput | null
  isLoading: boolean
  error: string | null
  // Reference data
  categories: Category[]
  allServices: Service[]
  allCountries: Country[]
  allCosts: Cost[]
  config: Config | null
  // Actions
  updateState: (updates: Partial<WizardState>) => void
  setCurrentStep: (step: number) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  resetWizard: () => void
  validateCurrentStep: () => StepValidationResult
  loadPricingData: () => Promise<void>
  calculateAndSave: () => Promise<void>
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
  
  // Reference data state
  const [categories, setCategories] = useState<Category[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [allCountries, setAllCountries] = useState<Country[]>([])
  const [allCosts, setAllCosts] = useState<Cost[]>([])
  const [config, setConfig] = useState<Config | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch pricing data on mount
  const loadPricingData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [catsRes, servsRes, countriesRes, costsRes, configRes] = await Promise.all([
        fetch('/api/v1/categories').then(res => res.ok ? res.json() : Promise.reject('Failed to load categories')),
        fetch('/api/v1/services').then(res => res.ok ? res.json() : Promise.reject('Failed to load services')),
        fetch('/api/v1/countries').then(res => res.ok ? res.json() : Promise.reject('Failed to load countries')),
        fetch('/api/v1/costs').then(res => res.ok ? res.json() : Promise.reject('Failed to load costs')),
        fetch('/api/v1/config').then(res => res.ok ? res.json() : Promise.reject('Failed to load config'))
      ])

      setCategories(catsRes)
      setAllServices(servsRes)
      setAllCountries(countriesRes)
      setAllCosts(costsRes)
      setConfig(configRes)
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

  // Map to engine formats for calculation
  const engineCountries = useMemo(() => 
    allCountries.map(c => ({ code: c.code, multiplier: c.multiplier })),
    [allCountries]
  )
  
  const engineCosts = useMemo(() => 
    allCosts.map(c => ({ id: String(c.id), isFixedAmount: c.is_fixed_amount, defaultCost: c.default_cost })),
    [allCosts]
  )
  
  const engineServices = useMemo(() => 
    allServices.map((s: Service) => ({ id: String(s.id), name: s.name, baseRate: s.base_rate })),
    [allServices]
  )

  // Compute pricing result
  const result = useMemo(() => {
    if (engineCountries.length === 0 || engineServices.length === 0) return null
    if (state.services.length === 0) return null

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
      return calculatePrice(pricingInput, engineCountries, engineCosts, engineServices)
    } catch (err) {
      console.error('Calculation error:', err)
      return null
    }
  }, [state, engineCountries, engineCosts, engineServices])

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
  }, [state, setState, validateCurrentStep])

  const goToPreviousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1)
    }))
  }, [setState])

  const resetWizard = useCallback(() => {
    setState(DEFAULT_WIZARD_STATE)
    if (typeof window !== 'undefined') {
    }
  }, [setState])
  
  const calculateAndSave = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
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

      const response = await fetch('/api/v1/calculate-and-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingInput)
      })

      const resultData = await response.json()

      if (!response.ok) {
        throw new Error(resultData.error || 'Failed to save calculation')
      }

      // Success! Update local state
      updateState({
        isSaved: true,
        savedCalculationId: resultData.calculationId
      })
      
      return resultData
    } catch (err: unknown) {
      console.error('Save error:', err)
      const message = err instanceof Error ? err.message : 'An error occurred while saving'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [state, updateState])

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

  const contextValue = useMemo(() => ({
    state,
    result,
    isLoading,
    error,
    categories,
    allServices,
    allCountries,
    allCosts,
    config,
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
    updateServiceHours,
    calculateAndSave
  }), [state, result, isLoading, error, categories, allServices, allCountries, allCosts, config, updateState, setCurrentStep, goToNextStep, goToPreviousStep, resetWizard, validateCurrentStep, loadPricingData, setPricingModel, setExperienceDesigner, setExperienceFreelance, setDesignerCountryId, setClientCountryId, setDesignerCountryCode, setClientCountryCode, toggleCost, setRiskBuffer, setProfitMargin, addService, removeService, updateServiceHours, calculateAndSave])

  return (
    <WizardContext.Provider
      value={contextValue}
    >
      {children}
    </WizardContext.Provider>
  )
}
