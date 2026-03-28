'use client'

import { ReactNode } from 'react'

interface WizardLayoutProps {
  leftPanel: ReactNode
}

export function WizardLayout({ leftPanel }: WizardLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row relative">
      {/* Main Content Area (Steps) */}
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {leftPanel}
        </div>
      </main>
    </div>
  )
}
