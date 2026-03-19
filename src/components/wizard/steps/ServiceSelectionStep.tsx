'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { useState, useEffect, useMemo } from 'react'
import { SelectedService } from '@/types/wizard'
import { StepSkeleton } from '../Skeleton'

interface Category {
  id: number
  name: string
  display_order: number
}

interface Service {
  id: number
  name: string
  default_hours: number
  min_hours: number
  max_hours: number
  base_rate: number
  category_id: number
}

export function ServiceSelectionStep() {
  const { state, addService, removeService, updateServiceHours, categories, allServices, isLoading, error, loadPricingData } = useWizard()
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({})

  // Open first category by default when data loads
  useEffect(() => {
    if (categories.length > 0 && Object.keys(openCategories).length === 0) {
      setOpenCategories({ [categories[0].id]: true })
    }
  }, [categories, openCategories])

  const groupedServices = useMemo(() => {
    const groups: Record<number, Service[]> = {}
    allServices.forEach(s => {
      if (!groups[s.category_id]) groups[s.category_id] = []
      groups[s.category_id].push(s)
    })
    return groups
  }, [allServices])

  const toggleCategory = (id: number) => {
    setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleToggleService = (service: Service) => {
    const isSelected = state.services.some(s => s.id === service.id)
    if (isSelected) {
      removeService(service.id)
    } else {
      addService({
        id: service.id,
        hours: service.default_hours || 1,
        adjustedRate: service.base_rate || 0,
        cost: 0
      })
    }
  }

  if (isLoading) {
    return <StepSkeleton />
  }

  if (error) {
    return (
      <div className="p-10 bg-red-50/50 border border-red-100 rounded-3xl text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
        <p className="text-red-900 font-bold mb-2">Failed to load services</p>
        <p className="text-red-700 text-sm mb-6">{error}</p>
        <button 
          onClick={loadPricingData}
          className="px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all shadow-md active:scale-95"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-zinc-900">Select Services</h3>
        <p className="text-sm text-zinc-500">Pick the services you'll provide and estimate hours.</p>
      </div>

      <div className="space-y-3">
        {categories.map(category => {
          const categoryServices = groupedServices[category.id] || []
          if (categoryServices.length === 0) return null
          
          const isOpen = !!openCategories[category.id]
          const selectedInCategory = categoryServices.filter(s => 
            state.services.some(ss => ss.id === s.id)
          ).length

          return (
            <div key={category.id} className="border border-zinc-100 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md">
              <button
                onClick={() => toggleCategory(category.id)}
                aria-expanded={isOpen}
                aria-controls={`category-panel-${category.id}`}
                className={`w-full flex items-center justify-between p-5 text-left transition-colors focus:bg-zinc-50 outline-none ${
                  isOpen ? 'bg-zinc-50' : 'bg-white hover:bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-zinc-800">{category.name}</span>
                  {selectedInCategory > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {selectedInCategory}
                    </span>
                  )}
                </div>
                <span className={`text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {isOpen && (
                <div 
                  id={`category-panel-${category.id}`}
                  role="region"
                  aria-labelledby={`category-btn-${category.id}`}
                  className="p-4 bg-white space-y-2 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {categoryServices.map(service => {
                    const selected = state.services.find(s => s.id === service.id)
                    
                    return (
                      <div 
                        key={service.id}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${
                          selected 
                            ? 'border-blue-200 bg-blue-50/30' 
                            : 'border-transparent hover:border-zinc-100 hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={() => handleToggleService(service)}
                            className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <label 
                            className="text-sm font-semibold text-zinc-900 cursor-pointer block truncate"
                            onClick={() => handleToggleService(service)}
                          >
                            {service.name}
                          </label>
                        </div>

                        {selected && (
                          <div className="flex flex-col items-end gap-1 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                value={selected.hours}
                                onChange={(e) => updateServiceHours(service.id, parseInt(e.target.value) || 0)}
                                className={`w-20 px-3 py-1.5 text-sm font-bold bg-white border rounded-lg focus:ring-2 outline-none transition-all ${
                                  selected.hours < 1 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-zinc-200 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                              />
                              <span className="text-xs font-bold text-zinc-400 uppercase">hrs</span>
                            </div>
                            {selected.hours < 1 && (
                              <span className="text-[10px] font-bold text-red-600 animate-in fade-in slide-in-from-top-1">
                                Min 1h required
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
