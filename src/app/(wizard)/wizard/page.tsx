'use client'

import { useState } from 'react'
import { useWizard } from '@/lib/context/WizardContext'
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
  { id: 7, title: 'Review', component: null },
]

export default function WizardPage() {
  const { 
    state, 
    goToNextStep, 
    goToPreviousStep, 
    setPricingModel,
    validateCurrentStep
  } = useWizard()

  const [isSaving, setIsSaving] = useState(false)
  const [calculationMessage, setCalculationMessage] = useState('')

  const currentStep = STEPS.find(s => s.id === state.currentStep)
  const CurrentComponent = currentStep?.component

  const handleCalculate = async () => {
    setIsSaving(true)
    setCalculationMessage('')

    try {
      const response = await fetch('/api/v1/calculate-and-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pricingModel: state.pricingModel || 'hourly',
          services: state.services.map((s: any) => ({ serviceId: String(s.id), hours: s.hours })),
          designerExperience: state.experienceDesigner,
          freelanceExperience: state.experienceFreelance,
          designerCountryCode: state.designerCountryCode,
          clientCountryCode: state.clientCountryCode,
          selectedCosts: state.costs.map(String),
          riskBufferPercent: state.riskBuffer,
          profitMarginPercent: state.profitMargin
        })
      })

      const data = await response.json()

      if (response.ok) {
        setCalculationMessage('Calculation saved successfully!')
      } else {
        setCalculationMessage(data.error?.message || 'Save failed. Please try again.')
      }
    } catch (error) {
      console.error('Save error:', error)
      setCalculationMessage('An error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const validation = validateCurrentStep()
  const canProceed = validation.isValid

  return (
    <ErrorBoundary>
      <WizardLayout
        leftPanel={
          <div className="space-y-6">
            <StepNavigation />

            <div className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm">
              {state.currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-zinc-800">Choose Pricing Model</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`
                      flex flex-col gap-2 p-6 border-2 rounded-2xl cursor-pointer transition-all
                      ${state.pricingModel === 'hourly' ? 'border-blue-600 bg-blue-50' : 'border-zinc-100 hover:border-zinc-200'}
                    `}>
                      <input
                        type="radio"
                        name="pricingModel"
                        checked={state.pricingModel === 'hourly'}
                        onChange={() => setPricingModel('hourly')}
                        className="sr-only"
                      />
                      <div className="font-bold text-lg">Hourly Rate</div>
                      <div className="text-sm text-zinc-500">Calculate based on total hours per service.</div>
                    </label>
                    <label className={`
                      flex flex-col gap-2 p-6 border-2 rounded-2xl cursor-pointer transition-all
                      ${state.pricingModel === 'project' ? 'border-blue-600 bg-blue-50' : 'border-zinc-100 hover:border-zinc-200'}
                    `}>
                      <input
                        type="radio"
                        name="pricingModel"
                        checked={state.pricingModel === 'project'}
                        onChange={() => setPricingModel('project')}
                        className="sr-only"
                      />
                      <div className="font-bold text-lg">Project-Based</div>
                      <div className="text-sm text-zinc-500">Fixed lump-sum price for the whole project.</div>
                    </label>
                  </div>
                </div>
              )}

              {state.currentStep > 1 && state.currentStep < 7 && CurrentComponent && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <CurrentComponent />
                </div>
              )}

              {state.currentStep === 7 && (
                <div className="text-center py-10">
                  <h3 className="text-2xl font-bold mb-4">Ready to Calculate?</h3>
                  <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                    Review your inputs in the preview panel. Click the button below to persist your quote.
                  </p>
                  <button
                    onClick={handleCalculate}
                    disabled={isSaving || !canProceed}
                    className="px-10 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
                  >
                    {isSaving ? 'Saving...' : 'Calculate & Save'}
                  </button>

                  {calculationMessage && (
                    <div className={`mt-6 p-4 rounded-xl font-medium ${
                      calculationMessage.includes('success') 
                        ? 'bg-green-50 text-green-700 border border-green-100' 
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {calculationMessage}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center px-4 md:px-0">
              <button
                onClick={goToPreviousStep}
                disabled={state.currentStep <= 1}
                className="px-6 py-3 font-semibold text-zinc-600 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              
              {state.currentStep < 7 && (
                <button
                  onClick={goToNextStep}
                  disabled={!canProceed}
                  className="px-10 py-3 bg-zinc-900 text-white font-bold rounded-full hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                >
                  Next Step →
                </button>
              )}
            </div>
          </div>
        }
        rightPanel={<LivePreview />}
      />
    </ErrorBoundary>
  )
}
