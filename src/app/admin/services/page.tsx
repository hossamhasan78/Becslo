'use client'

import { useState, useCallback, useEffect } from 'react'
import { apiUrl } from '@/lib/api'
import { useRouter, useSearchParams } from 'next/navigation'
import ServicesTable from '@/components/admin/ServicesTable'
import type { Service } from '@/types/admin'

interface ApiResponse<T> {
  data: T | null
  error: { message: string; code: string } | null
}

interface PaginatedData {
  services: Service[]
  pagination: {
    page: number
    page_size: number
    total_count: number
    total_pages: number
  }
}

export default function ServicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [services, setServices] = useState<Service[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 25,
    total_count: 0,
    total_pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchServices = useCallback(async (pageNum: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(apiUrl(`/api/admin/services?page=${pageNum}&page_size=25`))
      const result: ApiResponse<PaginatedData> = await response.json()

      if (result.error) {
        throw new Error(result.error.message)
      }

      setServices(result.data?.services || [])
      setPagination(result.data?.pagination || {
        page: 1,
        page_size: 25,
        total_count: 0,
        total_pages: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices(page)
  }, [fetchServices, page])

  const handlePageChange = (newPage: number) => {
    router.push(`/admin/services?page=${newPage}`)
  }

  const handleToggleActive = async (service: Service) => {
    try {
      const response = await fetch(apiUrl(`/api/admin/services/${service.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !service.is_active }),
      })

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error.message)
      }

      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? result.data : s))
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update service')
    }
  }

  const handleDelete = async (service: Service) => {
    try {
      const response = await fetch(apiUrl(`/api/admin/services/${service.id}`), {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.error) {
        if (result.error.code === 'SERVICE_IN_USE') {
          setServices((prev) =>
            prev.map((s) =>
              s.id === service.id ? { ...s, is_active: false } : s
            )
          )
          alert(result.error.message)
        } else {
          throw new Error(result.error.message)
        }
        return
      }

      setServices((prev) => prev.filter((s) => s.id !== service.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete service')
    }
  }

  const handleCreateSuccess = (newService: Service) => {
    setServices((prev) => [...prev, newService])
    setShowCreateModal(false)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Service
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <ServicesTable
        services={services}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />

      {showCreateModal && (
        <CreateServiceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  )
}

import ServiceForm, { type ServiceFormData } from '@/components/admin/ServiceForm'

function CreateServiceModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: (service: Service) => void
}) {
  const handleSubmit = async (data: ServiceFormData) => {
    const response = await fetch(apiUrl('/api/admin/services'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result.error) {
      throw new Error(result.error.message)
    }

    onSuccess(result.data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Service</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ServiceForm onSubmit={handleSubmit} onCancel={onClose} />
      </div>
    </div>
  )
}
