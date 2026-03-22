'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Configuration, ConfigurationUpdateInput } from '@/types/admin'
import { debounce } from '@/lib/debounce'

interface ConfigEditorProps {
  config: Configuration
  onSave: (data: ConfigurationUpdateInput) => Promise<Configuration>
  onRefresh: () => Promise<void>
}

interface ValidationErrors {
  base_rate?: string
  risk_buffer_min?: string
  risk_buffer_max?: string
  profit_margin_min?: string
  profit_margin_max?: string
}

function validateFieldValue(
  field: string,
  value: number,
  riskBufferMax: number,
  riskBufferMin: number,
  profitMarginMax: number,
  profitMarginMin: number
): string | null {
  switch (field) {
    case 'base_rate':
      if (value <= 0) return 'Base rate must be a positive number'
      break
    case 'risk_buffer_min':
      if (value < 0 || value > 50) return 'Must be between 0 and 50'
      if (value > riskBufferMax) return 'Must be less than or equal to max'
      break
    case 'risk_buffer_max':
      if (value < 0 || value > 50) return 'Must be between 0 and 50'
      if (value < riskBufferMin) return 'Must be greater than or equal to min'
      break
    case 'profit_margin_min':
      if (value < 10 || value > 50) return 'Must be between 10 and 50'
      if (value > profitMarginMax) return 'Must be less than or equal to max'
      break
    case 'profit_margin_max':
      if (value < 10 || value > 50) return 'Must be between 10 and 50'
      if (value < profitMarginMin) return 'Must be greater than or equal to min'
      break
  }
  return null
}

export default function ConfigEditor({ config, onSave, onRefresh }: ConfigEditorProps) {
  const [baseRate, setBaseRate] = useState(config.base_rate)
  const [riskBufferMin, setRiskBufferMin] = useState(config.risk_buffer_min)
  const [riskBufferMax, setRiskBufferMax] = useState(config.risk_buffer_max)
  const [profitMarginMin, setProfitMarginMin] = useState(config.profit_margin_min)
  const [profitMarginMax, setProfitMarginMax] = useState(config.profit_margin_max)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [conflictError, setConflictError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const errorsRef = useRef(errors)
  errorsRef.current = errors

  useEffect(() => {
    setBaseRate(config.base_rate)
    setRiskBufferMin(config.risk_buffer_min)
    setRiskBufferMax(config.risk_buffer_max)
    setProfitMarginMin(config.profit_margin_min)
    setProfitMarginMax(config.profit_margin_max)
  }, [config])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedValidate = useCallback(
    debounce((field: string, value: number) => {
      const error = validateFieldValue(
        field,
        value,
        riskBufferMax,
        riskBufferMin,
        profitMarginMax,
        profitMarginMin
      )
      
      setErrors(prev => {
        const updated = { ...prev }
        if (error) {
          updated[field as keyof ValidationErrors] = error
        } else {
          delete updated[field as keyof ValidationErrors]
        }
        return updated
      })
    }, 300),
    [riskBufferMax, riskBufferMin, profitMarginMax, profitMarginMin]
  )

  const handleBlur = (field: string, value: number) => {
    debouncedValidate(field, value)
  }

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (baseRate <= 0) {
      newErrors.base_rate = 'Base rate must be a positive number'
    }

    if (riskBufferMin < 0 || riskBufferMin > 50) {
      newErrors.risk_buffer_min = 'Must be between 0 and 50'
    }

    if (riskBufferMax < 0 || riskBufferMax > 50) {
      newErrors.risk_buffer_max = 'Must be between 0 and 50'
    }

    if (riskBufferMax < riskBufferMin) {
      newErrors.risk_buffer_max = 'Must be greater than or equal to min'
    }

    if (profitMarginMin < 10 || profitMarginMin > 50) {
      newErrors.profit_margin_min = 'Must be between 10 and 50'
    }

    if (profitMarginMax < 10 || profitMarginMax > 50) {
      newErrors.profit_margin_max = 'Must be between 10 and 50'
    }

    if (profitMarginMax < profitMarginMin) {
      newErrors.profit_margin_max = 'Must be greater than or equal to min'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const hasChanges = (): boolean => {
    return (
      baseRate !== config.base_rate ||
      riskBufferMin !== config.risk_buffer_min ||
      riskBufferMax !== config.risk_buffer_max ||
      profitMarginMin !== config.profit_margin_min ||
      profitMarginMax !== config.profit_margin_max
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setConflictError(null)
    setServerError(null)

    if (!validate()) {
      return
    }

    if (!hasChanges()) {
      return
    }

    setIsSubmitting(true)

    try {
      const updateData: ConfigurationUpdateInput = {
        base_rate: baseRate,
        risk_buffer_min: riskBufferMin,
        risk_buffer_max: riskBufferMax,
        profit_margin_min: profitMarginMin,
        profit_margin_max: profitMarginMax,
        version: config.version,
      }

      await onSave(updateData)
      setLastSaved(new Date().toLocaleTimeString())
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'CONFLICT') {
        setConflictError('Configuration has been modified by another user. Please refresh to see the latest values.')
      } else {
        setServerError('Failed to save configuration. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefresh = async () => {
    setConflictError(null)
    setServerError(null)
    try {
      await onRefresh()
    } catch {
      setServerError('Failed to refresh configuration. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {conflictError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-yellow-700">{conflictError}</p>
              <button
                type="button"
                onClick={handleRefresh}
                className="mt-2 text-sm font-medium text-yellow-700 underline hover:text-yellow-600"
              >
                Refresh Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Base Rate</h3>
        <div>
          <label htmlFor="baseRate" className="block text-sm font-medium text-gray-700">
            Hourly Rate (USD) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="baseRate"
              value={baseRate}
              onChange={(e) => setBaseRate(Number(e.target.value))}
              onBlur={(e) => handleBlur('base_rate', Number(e.target.value))}
              min={0.01}
              step={0.01}
              className={`block w-full pl-7 rounded-md border px-3 py-2 focus:outline-none focus:ring-1 sm:text-sm ${
                errors.base_rate
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
          </div>
          {errors.base_rate && <p className="mt-1 text-sm text-red-600">{errors.base_rate}</p>}
          <p className="mt-2 text-sm text-gray-500">
            The base hourly rate in USD used for all calculations.
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Risk Buffer Range</h3>
        <p className="text-sm text-gray-500 mb-4">
          Percentage added to cover unexpected costs or scope changes.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="riskBufferMin" className="block text-sm font-medium text-gray-700">
              Minimum (%)
            </label>
            <input
              type="number"
              id="riskBufferMin"
              value={riskBufferMin}
              onChange={(e) => setRiskBufferMin(Number(e.target.value))}
              onBlur={(e) => handleBlur('risk_buffer_min', Number(e.target.value))}
              min={0}
              max={50}
              className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 sm:text-sm ${
                errors.risk_buffer_min
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {errors.risk_buffer_min && <p className="mt-1 text-sm text-red-600">{errors.risk_buffer_min}</p>}
          </div>
          <div>
            <label htmlFor="riskBufferMax" className="block text-sm font-medium text-gray-700">
              Maximum (%)
            </label>
            <input
              type="number"
              id="riskBufferMax"
              value={riskBufferMax}
              onChange={(e) => setRiskBufferMax(Number(e.target.value))}
              onBlur={(e) => handleBlur('risk_buffer_max', Number(e.target.value))}
              min={0}
              max={50}
              className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 sm:text-sm ${
                errors.risk_buffer_max
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {errors.risk_buffer_max && <p className="mt-1 text-sm text-red-600">{errors.risk_buffer_max}</p>}
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Range: {riskBufferMin}% - {riskBufferMax}%
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Profit Margin Range</h3>
        <p className="text-sm text-gray-500 mb-4">
          Percentage added for business sustainability and growth.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="profitMarginMin" className="block text-sm font-medium text-gray-700">
              Minimum (%)
            </label>
            <input
              type="number"
              id="profitMarginMin"
              value={profitMarginMin}
              onChange={(e) => setProfitMarginMin(Number(e.target.value))}
              onBlur={(e) => handleBlur('profit_margin_min', Number(e.target.value))}
              min={10}
              max={50}
              className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 sm:text-sm ${
                errors.profit_margin_min
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {errors.profit_margin_min && <p className="mt-1 text-sm text-red-600">{errors.profit_margin_min}</p>}
          </div>
          <div>
            <label htmlFor="profitMarginMax" className="block text-sm font-medium text-gray-700">
              Maximum (%)
            </label>
            <input
              type="number"
              id="profitMarginMax"
              value={profitMarginMax}
              onChange={(e) => setProfitMarginMax(Number(e.target.value))}
              onBlur={(e) => handleBlur('profit_margin_max', Number(e.target.value))}
              min={10}
              max={50}
              className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 sm:text-sm ${
                errors.profit_margin_max
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {errors.profit_margin_max && <p className="mt-1 text-sm text-red-600">{errors.profit_margin_max}</p>}
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Range: {profitMarginMin}% - {profitMarginMax}%
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-500">
          Version: {config.version}
          {lastSaved && <span className="ml-4">Last saved: {lastSaved}</span>}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !hasChanges() || Object.keys(errors).length > 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  )
}
