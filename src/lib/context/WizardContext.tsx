'use client'

import { createContext, useContext, useState } from 'react'
import { WizardState, DEFAULT_WIZARD_STATE, PricingModel, SelectedService } from '@/types/wizard'

interface WizardContextValue {
  state: WizardState
  setCurrentStep: (step: number) => void
  setPricingModel: (model: PricingModel | null) => void
  addService: (service: SelectedService) => void
  removeService: (serviceId: number) => void
  updateServiceHours: (serviceId: number, hours: number) => void
  setExperienceDesigner: (level: number) => void
  setExperienceFreelance: (level: number) => void
  setDesignerCountryId: (countryId: number | null) => void
  setClientCountryId: (countryId: number | null) => void
  setDesignerCountryCode: (code: string) => void
  setClientCountryCode: (code: string) => void
  toggleCost: (costId: number) => void
  setRiskBuffer: (value: number) => void
  setProfitMargin: (value: number) => void
  nextStep: () => void
  prevStep: () => void
  resetWizard: () => void
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
  const [state, setState] = useState<WizardState>(DEFAULT_WIZARD_STATE)

  const setCurrentStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }))
  }

  const setPricingModel = (model: PricingModel | null) => {
    setState((prev) => ({ ...prev, pricingModel: model }))
  }

  const addService = (service: SelectedService) => {
    setState((prev) => ({
      ...prev,
      services: [...prev.services, service],
    }))
  }

  const removeService = (serviceId: number) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== serviceId),
    }))
  }

  const updateServiceHours = (serviceId: number, hours: number) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === serviceId ? { ...s, hours } : s
      ),
    }))
  }

  const setExperienceDesigner = (level: number) => {
    const validLevel = Math.max(1, Math.min(10, level))
    setState((prev) => ({
      ...prev,
      experienceDesigner: validLevel,
      experienceFreelance: Math.min(prev.experienceFreelance, validLevel)
    }))
  }

  const setExperienceFreelance = (level: number) => {
    const validLevel = Math.max(1, Math.min(state.experienceDesigner, level))
    setState((prev) => ({ ...prev, experienceFreelance: validLevel }))
  }

  const setDesignerCountryId = (countryId: number | null) => {
    setState((prev) => ({ ...prev, designerCountryId: countryId }))
  }

  const setClientCountryId = (countryId: number | null) => {
    setState((prev) => ({ ...prev, clientCountryId: countryId }))
  }

  const setDesignerCountryCode = (code: string) => {
    setState((prev) => ({ ...prev, designerCountryCode: code }))
  }

  const setClientCountryCode = (code: string) => {
    setState((prev) => ({ ...prev, clientCountryCode: code }))
  }

  const toggleCost = (costId: number) => {
    setState((prev) => {
      const exists = prev.costs.includes(costId)
      return {
        ...prev,
        costs: exists
          ? prev.costs.filter((id) => id !== costId)
          : [...prev.costs, costId],
      }
    })
  }

  const setRiskBuffer = (value: number) => {
    setState((prev) => ({ ...prev, riskBuffer: value }))
  }

  const setProfitMargin = (value: number) => {
    setState((prev) => ({ ...prev, profitMargin: value }))
  }

  const nextStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 7),
    }))
  }

  const prevStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }))
  }

  const resetWizard = () => {
    setState(DEFAULT_WIZARD_STATE)
  }

  return (
    <WizardContext.Provider
      value={{
        state,
        setCurrentStep,
        setPricingModel,
        addService,
        removeService,
        updateServiceHours,
        setExperienceDesigner,
        setExperienceFreelance,
        setDesignerCountryId,
        setClientCountryId,
        setDesignerCountryCode,
        setClientCountryCode,
        toggleCost,
        setRiskBuffer,
        setProfitMargin,
        nextStep,
        prevStep,
        resetWizard,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}
