'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { CalculationDetails as CalculationDetailsType } from '@/types/admin'
import CalculationDetails from '@/components/admin/CalculationDetails'

export default function CalculationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [details, setDetails] = useState<CalculationDetailsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDetails() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/admin/calculations/${id}`)
        const result = await response.json()

        if (result.error) {
          if (response.status === 401) {
            router.push('/wizard')
            return
          }
          if (response.status === 404) {
            setError('Calculation not found')
            return
          }
          setError(result.error.message)
          return
        }

        setDetails(result.data)
      } catch (err) {
        console.error('Error fetching calculation details:', err)
        setError('Failed to load calculation details. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [id])

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Calculation</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/admin/calculations"
            className="inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Calculations
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-6">
          <div className="bg-gray-200 rounded-lg h-40 animate-pulse"></div>
          <div className="bg-gray-200 rounded-lg h-40 animate-pulse"></div>
          <div className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!details) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-500">No details available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/calculations"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Calculations
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calculation Details</h1>
        <p className="mt-2 text-sm text-gray-600">
          Detailed breakdown of calculation #{details.id.slice(0, 8)}
        </p>
      </div>

      <CalculationDetails details={details} />
    </div>
  )
}
