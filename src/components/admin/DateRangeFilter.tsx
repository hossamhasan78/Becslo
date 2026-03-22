'use client'

import { useState, useCallback } from 'react'

interface DateRangeFilterProps {
  onFilterChange: (startDate: string | undefined, endDate: string | undefined) => void
  initialStartDate?: string
  initialEndDate?: string
}

export default function DateRangeFilter({ 
  onFilterChange,
  initialStartDate,
  initialEndDate 
}: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState(initialStartDate || '')
  const [endDate, setEndDate] = useState(initialEndDate || '')
  const [error, setError] = useState<string | null>(null)

  const handleApply = useCallback(() => {
    setError(null)

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (start > end) {
        setError('Start date must be before or equal to end date')
        return
      }
    }

    onFilterChange(startDate || undefined, endDate || undefined)
  }, [startDate, endDate, onFilterChange])

  const handleClear = useCallback(() => {
    setStartDate('')
    setEndDate('')
    setError(null)
    onFilterChange(undefined, undefined)
  }, [onFilterChange])

  const handleQuickSelect = useCallback((days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)

    const formatDate = (d: Date) => d.toISOString().split('T')[0]
    
    setStartDate(formatDate(start))
    setEndDate(formatDate(end))
    onFilterChange(formatDate(start), formatDate(end))
  }, [onFilterChange])

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-sm text-gray-500">Quick select:</span>
        <button
          type="button"
          onClick={() => handleQuickSelect(7)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Last 7 days
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(30)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Last 30 days
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(90)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Last 90 days
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(365)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Last year
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
