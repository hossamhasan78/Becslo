'use client'

import { useState } from 'react'
import { useWizard } from '@/components/WizardContext'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export function ExportPdfStep() {
  const { input, result, setStep } = useWizard()
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'quote.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('Unable to generate PDF. Please try again or contact support if the problem persists.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Export Quote</h2>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">
            ${result.finalPrice.toLocaleString()}
          </div>
          <div className="text-sm text-green-600">
            {input.pricingModel === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">Your Quote Includes:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Complete pricing breakdown
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Service details and hours
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Experience and geography multipliers
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Risk buffer and profit margin
          </li>
        </ul>
      </div>

      <button
        onClick={handleExport}
        disabled={isExporting || !result}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <LoadingSpinner size="sm" />
            Generating...
          </>
        ) : (
          'Download PDF'
        )}
      </button>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(6)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    </div>
  )
}
