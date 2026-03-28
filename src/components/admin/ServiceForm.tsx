'use client'

import { useState, useEffect } from 'react'
import { apiUrl } from '@/lib/api'
import type { Service } from '@/types/admin'

interface Category {
  id: number;
  name: string;
  display_order: number;
  created_at: string;
}

interface ServiceFormProps {
  service?: Service | null
  onSubmit: (data: ServiceFormData) => Promise<void>
  onCancel: () => void
}

export interface ServiceFormData {
  name: string
  category: string
  default_hours: number
  min_hours: number
  max_hours: number
}

export default function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(service?.name || '')
  const [category, setCategory] = useState(service?.category || '')
  const [defaultHours, setDefaultHours] = useState(service?.default_hours || 20)
  const [minHours, setMinHours] = useState(service?.min_hours || 0)
  const [maxHours, setMaxHours] = useState(service?.max_hours || 100)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true)
      try {
        const response = await fetch(apiUrl('/api/v1/categories'))
        const data = await response.json()
        setCategories(data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    } else if (name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less'
    }

    if (!category) {
      newErrors.category = 'Category is required'
    }

    if (minHours < 0) {
      newErrors.minHours = 'Minimum hours must be non-negative'
    }

    if (maxHours < minHours) {
      newErrors.maxHours = 'Maximum hours must be greater than or equal to minimum hours'
    }

    if (defaultHours < minHours || defaultHours > maxHours) {
      newErrors.defaultHours = `Default hours must be between ${minHours} and ${maxHours}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        category,
        default_hours: defaultHours,
        min_hours: minHours,
        max_hours: maxHours,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Service Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
            errors.name
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
          placeholder="e.g., UI Design"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isLoading}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
            errors.category
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="minHours" className="block text-sm font-medium text-gray-700">
            Min Hours
          </label>
          <input
            type="number"
            id="minHours"
            value={minHours}
            onChange={(e) => setMinHours(Number(e.target.value))}
            min={0}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
              errors.minHours
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
          {errors.minHours && <p className="mt-1 text-sm text-red-600">{errors.minHours}</p>}
        </div>

        <div>
          <label htmlFor="defaultHours" className="block text-sm font-medium text-gray-700">
            Default Hours
          </label>
          <input
            type="number"
            id="defaultHours"
            value={defaultHours}
            onChange={(e) => setDefaultHours(Number(e.target.value))}
            min={0}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
              errors.defaultHours
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
          {errors.defaultHours && <p className="mt-1 text-sm text-red-600">{errors.defaultHours}</p>}
        </div>

        <div>
          <label htmlFor="maxHours" className="block text-sm font-medium text-gray-700">
            Max Hours
          </label>
          <input
            type="number"
            id="maxHours"
            value={maxHours}
            onChange={(e) => setMaxHours(Number(e.target.value))}
            min={minHours}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
              errors.maxHours
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
          {errors.maxHours && <p className="mt-1 text-sm text-red-600">{errors.maxHours}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
        </button>
      </div>
    </form>
  )
}
