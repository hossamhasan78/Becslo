'use client'

import { ReactNode, useState } from 'react'

interface WizardLayoutProps {
  leftPanel: ReactNode
  rightPanel: ReactNode
}

export function WizardLayout({ leftPanel, rightPanel }: WizardLayoutProps) {
  const [showMobilePreview, setShowMobilePreview] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row relative">
      {/* Main Content Area (Steps) */}
      <main className={`flex-1 p-4 md:p-6 lg:p-10 transition-all duration-300 ${showMobilePreview ? 'hidden md:block' : 'block'}`}>
        <div className="max-w-4xl mx-auto">
          {leftPanel}
        </div>
      </main>

      {/* Sidebar (Live Preview) */}
      <aside 
        className={`
          fixed inset-0 z-40 bg-white md:relative md:inset-auto md:z-0 md:w-1/4 lg:w-1/5 
          md:border-l border-zinc-200 shadow-xl md:shadow-none transition-transform duration-300
          ${showMobilePreview ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >
        <div className="h-full overflow-y-auto p-4 md:p-6 sticky top-0">
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h2 className="text-xl font-bold">Calculation Preview</h2>
            <button 
              onClick={() => setShowMobilePreview(false)}
              className="p-2 text-zinc-500 hover:text-zinc-900"
              aria-label="Close preview"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {rightPanel}
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      {!showMobilePreview && (
        <button 
          onClick={() => setShowMobilePreview(true)}
          className="md:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all transform active:scale-95"
          aria-label="Show preview"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      )}
    </div>
  )
}
