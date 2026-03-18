import { ReactNode } from 'react'

interface WizardLayoutProps {
  leftPanel: ReactNode
  rightPanel: ReactNode
}

export function WizardLayout({ leftPanel, rightPanel }: WizardLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <div className="w-full lg:w-3/4 p-6 lg:p-8">
          {leftPanel}
        </div>
        <div className="w-full lg:w-1/4 p-6 lg:p-8 lg:border-l lg:border-zinc-200 bg-white">
          {rightPanel}
        </div>
      </div>
    </div>
  )
}
