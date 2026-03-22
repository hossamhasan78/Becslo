'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ServiceForm, { type ServiceFormData } from '@/components/admin/ServiceForm'
import type { Service } from '@/types/admin'

interface ApiResponse<T> {
  data: T | null
  error: { message: string; code: string } | null
}

export default function EditServicePage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string

  const [service, setService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchService() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/admin/services/${serviceId}`)
        const result: ApiResponse<Service> = await response.json()

        if (result.error) {
          throw new Error(result.error.message)
        }

        setService(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch service')
      } finally {
        setIsLoading(false)
      }
    }

    if (serviceId) {
      fetchService()
    }
  }, [serviceId])

  const handleSubmit = async (data: ServiceFormData) => {
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result: ApiResponse<Service> = await response.json()

      if (result.error) {
        throw new Error(result.error.message)
      }

      router.push('/admin/services')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service')
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/services')
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-500">Loading service...</span>
        </div>
      </div>
    )
  }

  if (error && !service) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/admin/services')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Services
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/services')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Services
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {service && (
          <div className="bg-white rounded-lg shadow p-6">
            <ServiceForm
              service={service}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>
    </div>
  )
}
