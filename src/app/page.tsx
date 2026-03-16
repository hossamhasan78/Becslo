'use client'

import { WizardProvider, useWizard } from '@/components/WizardContext'
import { PricingModelStep } from '@/components/wizard/PricingModelStep'
import { ServiceSelectionStep } from '@/components/wizard/ServiceSelectionStep'
import { ExperienceStep } from '@/components/wizard/ExperienceStep'
import { GeographyStep } from '@/components/wizard/GeographyStep'
import { CostsStep } from '@/components/wizard/CostsStep'
import { ResultsPreviewStep } from '@/components/wizard/ResultsPreviewStep'
import { ExportPdfStep } from '@/components/wizard/ExportPdfStep'
import { LivePreview } from '@/components/wizard/LivePreview'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'

const WIZARD_STEPS = [
  { id: 1, title: 'Pricing Model', component: PricingModelStep },
  { id: 2, title: 'Services', component: ServiceSelectionStep },
  { id: 3, title: 'Experience', component: ExperienceStep },
  { id: 4, title: 'Geography', component: GeographyStep },
  { id: 5, title: 'Costs', component: CostsStep },
  { id: 6, title: 'Results', component: ResultsPreviewStep },
  { id: 7, title: 'Export', component: ExportPdfStep },
]

function WizardContent() {
  const { step, setStep, services, config, countries, isLoading } = useWizard()

  const isLoadingData = !services || !config || !countries || Object.keys(services).length === 0

  if (isLoadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading calculator...</p>
        </div>
      </div>
    )
  }

  const currentStep = WIZARD_STEPS.find(s => s.id === step)
  const StepComponent = currentStep?.component

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-3/4 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Freelance Pricing Calculator</h1>
          <p className="text-gray-500">Calculate your project price in minutes</p>
        </div>

        <div className="mb-6">
          <div className="flex gap-1 overflow-x-auto pb-2">
            {WIZARD_STEPS.map((s, index) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${
                  step === s.id
                    ? 'bg-blue-600 text-white'
                    : index < step
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {index + 1}. {s.title}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          {StepComponent && <StepComponent />}
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={() => setStep(Math.min(7, step + 1))}
            disabled={step === 7}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      <div className="w-1/4 p-8 bg-white border-l">
        <h2 className="text-lg font-semibold mb-4">Preview</h2>
        <LivePreview />
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <ErrorBoundary>
      <WizardProvider>
        <WizardContent />
      </WizardProvider>
    </ErrorBoundary>
  )
}
