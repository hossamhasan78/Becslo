'use client'

import { useState, useEffect } from 'react'

import { useWizard } from '@/lib/context/WizardContext'
import { WizardLayout } from '@/components/wizard/WizardLayout'
import { StepNavigation } from '@/components/wizard/StepNavigation'
import { WizardStepWrapper } from '@/components/wizard/WizardStepWrapper'
import { ProgressBar } from '@/components/wizard/ProgressBar'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import WizardLogoutButton from '@/components/wizard/WizardLogoutButton'

// Import new step components
import { ServiceSelectionStep } from '@/components/wizard/steps/ServiceSelectionStep'
import { ExperienceStep } from '@/components/wizard/steps/ExperienceStep'
import { GeographyStep } from '@/components/wizard/steps/GeographyStep'
import { CostsStep } from '@/components/wizard/steps/CostsStep'
import { RiskProfitStep } from '@/components/wizard/steps/RiskProfitStep'
import { ReviewStep } from '@/components/wizard/steps/ReviewStep'

export default function WizardPage() {
  const {
    state,
    isLoading,
    goToNextStep,
    goToPreviousStep,
    validateCurrentStep,
    loadPricingData,
    calculateAndSave
  } = useWizard()

  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === 'Enter' && state.currentStep < 6) {
        const validation = validateCurrentStep()
        if (validation.isValid) {
          goToNextStep()
        }
      }

      if (e.key === 'Escape') {
        if (state.currentStep > 1) {
          goToPreviousStep()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [state.currentStep, validateCurrentStep, goToNextStep, goToPreviousStep])

  const handleCalculate = async () => {
    try {
      await calculateAndSave()
    } catch {
      // Error is set in WizardContext; advance to Step 6 anyway so user sees their result
    }
    goToNextStep()
  }

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true)
      setDownloadError(null)

      const id = state.savedCalculationId
      if (!id) throw new Error('Could not generate Calculation ID')

      const response = await fetch(`/api/v1/export-pdf?id=${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF. Please try again.')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Becslo_Quote_${id.slice(0, 8)}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Download error:', err)
      setDownloadError(err.message || 'Network timeout or error downloading PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <WizardLayout
        leftPanel={
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin mb-4" />
            <p className="text-zinc-500 font-medium animate-pulse">Initializing your bespoke pricing engine...</p>
          </div>
        }
      />
    )
  }

  const renderStep = () => {
    switch (state.currentStep) {
      case 1: return <ServiceSelectionStep />
      case 2: return <ExperienceStep />
      case 3: return <GeographyStep />
      case 4: return <CostsStep />
      case 5: return <RiskProfitStep />
      case 6: return <ReviewStep />
      default: return <ServiceSelectionStep />
    }
  }

  const validation = validateCurrentStep()
  const canProceed = validation.isValid

  return (
    <ErrorBoundary>
      <a href="#wizard-content" className="skip-link">
        Skip to main content
      </a>
      <WizardLayout
        leftPanel={
          <div id="wizard-content" className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
              <StepNavigation />
              <WizardLogoutButton />
            </div>

            <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-10 shadow-sm min-h-[500px] flex flex-col">
              <ProgressBar currentStep={state.currentStep} />
              
              <WizardStepWrapper stepKey={state.currentStep}>
                <div className="flex-1">
                  {renderStep()}
                </div>
              </WizardStepWrapper>

              {/* Navigation Buttons */}
              <div className="flex items-center mt-10 pt-8 border-t border-zinc-100 gap-4">
                {state.currentStep > 1 && (
                  <button
                    onClick={goToPreviousStep}
                    className="px-8 py-3 font-bold text-zinc-500 hover:text-zinc-900 transition-all flex items-center gap-2 group"
                  >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    Back
                  </button>
                )}
                
                <div className="flex-1" />

                {state.currentStep < 6 && (
                  <button
                    onClick={state.currentStep === 5 ? handleCalculate : goToNextStep}
                    disabled={!canProceed}
                    className={`
                      px-10 py-3 rounded-full font-black text-white transition-all shadow-lg active:scale-95 flex items-center gap-2 group
                      ${canProceed
                        ? 'bg-zinc-900 hover:bg-black hover:shadow-xl'
                        : 'bg-zinc-200 cursor-not-allowed text-zinc-400 shadow-none'}
                    `}
                  >
                    {state.currentStep === 5 ? 'Calculate' : 'Next Step'}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                )}

                {state.currentStep === 6 && (
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading || !canProceed}
                    className={`
                      px-10 py-3 rounded-full font-black text-white transition-all shadow-lg active:scale-95 flex items-center gap-2 group
                      ${(canProceed && !isDownloading)
                        ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'
                        : 'bg-zinc-200 cursor-not-allowed text-zinc-400 shadow-none'}
                    `}
                  >
                    {isDownloading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </span>
                    ) : (
                      <>
                        Download PDF
                        <span className="group-hover:-translate-y-1 transition-transform">↓</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Error Toast for PDF Download */}
            {downloadError && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-red-600 font-bold">⚠️</span>
                <p className="text-sm text-red-700 font-medium">{downloadError}</p>
                <button onClick={() => setDownloadError(null)} className="ml-auto text-red-500 hover:text-red-700">✕</button>
              </div>
            )}

            {/* Validation Message */}
            {!canProceed && validation.errors.length > 0 && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 animate-in shake-in-1 duration-300">
                <span className="text-red-600 font-bold">⚠️</span>
                <p className="text-sm text-red-700 font-medium">
                  {validation.errors[0].message}
                </p>
              </div>
            )}
          </div>
        }
      />
    </ErrorBoundary>
  )
}
