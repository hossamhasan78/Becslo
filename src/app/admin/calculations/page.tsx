'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { CalculationListItem, PaginationResult } from '@/types/admin'
import CalculationsList from '@/components/admin/CalculationsList'
import DateRangeFilter from '@/components/admin/DateRangeFilter'

const EMPTY_PAGINATION: PaginationResult = {
  page: 1,
  page_size: 25,
  total_count: 0,
  total_pages: 0,
}

export default function CalculationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [calculations, setCalculations] = useState<CalculationListItem[]>([])
  const [pagination, setPagination] = useState<PaginationResult>(EMPTY_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string | undefined>()
  const [endDate, setEndDate] = useState<string | undefined>()

  const page = parseInt(searchParams.get('page') || '1', 10)

  const fetchCalculations = useCallback(async (pageNum: number, start?: string, end?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      let url = `/api/admin/calculations?page=${pageNum}&page_size=25`
      const params = new URLSearchParams()
      if (start) params.append('start_date', start)
      if (end) params.append('end_date', end)
      if (params.toString()) url += `&${params.toString()}`

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

      setCalculations(result.data?.calculations || [])
      setPagination(result.data?.pagination || EMPTY_PAGINATION)
    } catch (err) {
      console.error('Error fetching calculations:', err)
      setError('Failed to load calculations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCalculations(page, startDate, endDate)
  }, [page, startDate, endDate, fetchCalculations])

  const handleFilterChange = useCallback((start: string | undefined, end: string | undefined) => {
    setStartDate(start)
    setEndDate(end)
    router.push('/admin/calculations')
  }, [router])

  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams()
    params.set('page', String(newPage))
    router.push(`/admin/calculations?${params.toString()}`)
  }, [router])

  const isEmpty = calculations.length === 0 && !isLoading

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Calculations</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchCalculations(page, startDate, endDate)}
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
        <h1 className="text-2xl font-bold text-gray-900">Calculations</h1>
        <p className="mt-2 text-sm text-gray-600">
          View all pricing calculations with user information.
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
        <div className="space-y-4">
          <div className="bg-gray-200 rounded-lg h-12 animate-pulse"></div>
          <div className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
        </div>
      ) : (
        <CalculationsList
          calculations={calculations}
          pagination={pagination}
          currentPage={page}
          onPageChange={handlePageChange}
          isEmpty={isEmpty}
        />
      )}
    </div>
  )
}
