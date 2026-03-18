'use client'

import { WizardLayout } from '@/components/wizard/WizardLayout'
import { StepNavigation } from '@/components/wizard/StepNavigation'
import { LivePreview } from '@/components/wizard/LivePreview'

export default function WizardPage() {
  return (
    <WizardLayout
      leftPanel={
        <div>
          <StepNavigation />
          <div className="bg-white border border-zinc-200 rounded-lg p-8">
            <p className="text-zinc-600">
              Step {1} content will go here. This is a placeholder for the wizard step content.
            </p>
          </div>
        </div>
      }
      rightPanel={<LivePreview />}
    />
  )
}
