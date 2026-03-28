'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { AnalyticsMetrics } from '@/types/admin'
import AnalyticsTables from '@/components/admin/AnalyticsTables'
import DateRangeFilter from '@/components/admin/DateRangeFilter'

const EMPTY_METRICS: AnalyticsMetrics = {
  average_price: 0,
  average_hours: 0,
  total_calculations: 0,
  most_used_services: [],
  top_client_countries: [],
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<AnalyticsMetrics>(EMPTY_METRICS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string | undefined>()
  const [endDate, setEndDate] = useState<string | undefined>()

  const fetchMetrics = useCallback(async (start?: string, end?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      let url = '/api/admin/analytics'
      const params = new URLSearchParams()
      if (start) params.append('start_date', start)
      if (end) params.append('end_date', end)
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url)
      const result = await response.json()

      if (result.error) {
        if (response.status === 401) {
          router.push('/wizard')
          return
        }
        setError(result.error.message)
        return
      }

      setMetrics(result.data || EMPTY_METRICS)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const handleFilterChange = useCallback((start: string | undefined, end: string | undefined) => {
    setStartDate(start)
    setEndDate(end)
    fetchMetrics(start, end)
  }, [fetchMetrics])

  const isEmpty = metrics.total_calculations === 0

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Analytics</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchMetrics(startDate, endDate)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-sm text-gray-600">
          View key metrics and trends from pricing calculations.
        </p>
      </div>

      <div className="mb-8">
        <DateRangeFilter
          onFilterChange={handleFilterChange}
          initialStartDate={startDate}
          initialEndDate={endDate}
        />
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
            <div className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
            <div className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
          </div>
          <div className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
          <div className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
        </div>
      ) : (
        <AnalyticsTables metrics={metrics} isEmpty={isEmpty} />
      )}
    </div>
  )
}
