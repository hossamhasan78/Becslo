'use client'

import { useState } from 'react'
import { useWizard } from '@/lib/context/WizardContext'
import { usePricing } from '@/components/context/PricingContext'
import { WizardLayout } from '@/components/wizard/WizardLayout'
import { StepNavigation } from '@/components/wizard/StepNavigation'
import LivePreview from '@/components/wizard/LivePreview'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ServiceSelection } from './components/step-inputs/service-selection'
import { ExperienceInput } from './components/step-inputs/experience-input'
import { GeographyInput } from './components/step-inputs/geography-input'
import { CostSelection } from './components/step-inputs/cost-selection'
import { RiskProfitInput } from './components/step-inputs/risk-profit-input'

const STEPS = [
  { id: 1, title: 'Pricing Model', component: null },
  { id: 2, title: 'Services', component: ServiceSelection },
  { id: 3, title: 'Experience', component: ExperienceInput },
  { id: 4, title: 'Geography', component: GeographyInput },
  { id: 5, title: 'Costs', component: CostSelection },
  { id: 6, title: 'Risk & Profit', component: RiskProfitInput },
]

export default function WizardPage() {
  const { state, nextStep, prevStep, setPricingModel } = useWizard()
  const { setPricing, pricing } = usePricing()
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationMessage, setCalculationMessage] = useState('')

  const currentStepIndex = state.currentStep - 1
  const currentStep = STEPS[currentStepIndex]
  const CurrentComponent = currentStep?.component

  const syncPricingFromWizard = () => {
    setPricing({
      services: state.services.map(s => ({ serviceId: String(s.id), hours: s.hours })),
      designerExperience: state.experienceDesigner,
      freelanceExperience: state.experienceFreelance,
      designerCountryCode: state.designerCountryCode,
      clientCountryCode: state.clientCountryCode,
      selectedCosts: state.costs.map(String),
      riskBufferPercent: state.riskBuffer,
      profitMarginPercent: state.profitMargin
    })
  }

  const handleCalculate = async () => {
    setIsCalculating(true)
    setCalculationMessage('')

    syncPricingFromWizard()

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...pricing, save: true })
      })

      if (response.ok) {
        setCalculationMessage('Calculation saved successfully!')
      } else {
        const errorData = await response.json()
        setCalculationMessage(errorData.error?.message || 'Calculation complete (save failed)')
      }
    } catch (error) {
      console.error('Save error:', error)
      setCalculationMessage('Calculation complete')
    } finally {
      setIsCalculating(false)
    }
  }

  const canProceed = () => {
    switch (state.currentStep) {
      case 1:
        return state.pricingModel !== null
      case 2:
        return state.services.length > 0
      case 3:
        return true
      case 4:
        return state.designerCountryId !== null && state.clientCountryId !== null
      case 5:
        return true
      case 6:
        return true
      default:
        return false
    }
  }

  return (
    <ErrorBoundary>
      <WizardLayout
        leftPanel={
          <div>
            <StepNavigation />

            <div className="bg-white border border-zinc-200 rounded-lg p-6">
              {state.currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Choose Pricing Model</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="pricingModel"
                        checked={state.pricingModel === 'hourly'}
                        onChange={() => setPricingModel('hourly')}
                        className="h-4 w-4"
                      />
                      <div>
                        <div className="font-medium">Hourly Rate</div>
                        <div className="text-sm text-zinc-500">Charge based on hours worked</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="pricingModel"
                        checked={state.pricingModel === 'project'}
                        onChange={() => setPricingModel('project')}
                        className="h-4 w-4"
                      />
                      <div>
                        <div className="font-medium">Project-Based</div>
                        <div className="text-sm text-zinc-500">Fixed price for entire project</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {CurrentComponent && <CurrentComponent />}
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={prevStep}
                disabled={state.currentStep <= 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                disabled={state.currentStep >= 6 || !canProceed()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            {state.currentStep === 6 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600 mb-2">
                  Click to calculate your final price and save:
                </p>
                <button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? 'Calculating...' : 'Calculate & Save'}
                </button>

                {calculationMessage && (
                  <div className={`p-2 rounded mt-2 ${calculationMessage.includes('success') ? 'bg-green-50 border-green-200 text-green-600' : 'bg-yellow-50 border-yellow-200 text-yellow-600'}`}>
                    {calculationMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        }
        rightPanel={<LivePreview />}
      />
    </ErrorBoundary>
  )
}
