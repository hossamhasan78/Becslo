'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Configuration, ConfigurationUpdateInput } from '@/types/admin'
import ConfigEditor from '@/components/admin/ConfigEditor'

export default function ConfigPage() {
  const [config, setConfig] = useState<Configuration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/config')
      const result = await response.json()

      if (result.error) {
        if (response.status === 401) {
          window.location.href = '/wizard'
          return
        }
        setError(result.error.message)
        return
      }

      setConfig(result.data)
    } catch (err) {
      console.error('Error fetching config:', err)
      setError('Failed to load configuration. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const handleSave = async (data: ConfigurationUpdateInput): Promise<Configuration> => {
    const response = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result.error) {
      const error = new Error(result.error.message) as Error & { code?: string }
      error.code = result.error.code
      throw error
    }

    setConfig(result.data)
    return result.data
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-6">
            <div className="bg-gray-200 rounded-lg h-40 w-full"></div>
            <div className="bg-gray-200 rounded-lg h-40 w-full"></div>
            <div className="bg-gray-200 rounded-lg h-40 w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Configuration</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchConfig()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">No configuration found.</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>
        <p className="mt-2 text-sm text-gray-600">
          Adjust pricing parameters for the calculator. These settings affect all new calculations.
        </p>
      </div>

      <ConfigEditor
        config={config}
        onSave={handleSave}
        onRefresh={fetchConfig}
      />
    </div>
  )
}
