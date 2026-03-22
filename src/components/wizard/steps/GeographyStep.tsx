'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { useState, useMemo } from 'react'
import { StepSkeleton } from '../Skeleton'

interface Country {
  id: number
  name: string
  code: string
  multiplier: number
}

export function GeographyStep() {
  const { 
    state, 
    updateState,
    allCountries,
    isLoading
  } = useWizard()
  
  const [searchDesigner, setSearchDesigner] = useState('')
  const [searchClient, setSearchClient] = useState('')
  
  const filteredDesigner = useMemo(() => 
    allCountries.filter((c: Country) => c.name.toLowerCase().includes(searchDesigner.toLowerCase())),
    [allCountries, searchDesigner]
  )
  
  const filteredClient = useMemo(() => 
    allCountries.filter((c: Country) => c.name.toLowerCase().includes(searchClient.toLowerCase())),
    [allCountries, searchClient]
  )
  
  const handleSelectDesigner = (country: Country) => {
    updateState({
      designerCountryId: country.id,
      designerCountryCode: country.code
    })
    setSearchDesigner('')
  }
  
  const handleSelectClient = (country: Country) => {
    updateState({
      clientCountryId: country.id,
      clientCountryCode: country.code
    })
    setSearchClient('')
  }
  
  const selectedDesignerCountry = allCountries.find((c: Country) => c.id === state.designerCountryId)
  const selectedClientCountry = allCountries.find((c: Country) => c.id === state.clientCountryId)
  
  if (isLoading) {
    return <StepSkeleton />
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-zinc-900">Project Geography</h3>
        <p className="text-sm text-zinc-500">Location affects local market rates and purchasing power parity.</p>
      </div>
 
      <div className="space-y-6">
        
        <div className="space-y-3">
          <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
            Where are you based?
          </label>
          <div className="relative group">
            <div className={`
              flex items-center gap-4 p-4 border-2 rounded-2xl transition-all
              ${state.designerCountryId 
                ? 'border-zinc-200 bg-white' 
                : !isLoading && !state.designerCountryId && state.currentStep === 4 
                  ? 'border-red-100 bg-red-50/50' 
                  : 'border-zinc-100 bg-zinc-50'}
            `}>
              <div className="flex-1">
                <input
                  type="text"
                  id="designer-country"
                  placeholder={selectedDesignerCountry ? selectedDesignerCountry.name : "Search for a country..."}
                  value={searchDesigner}
                  onChange={(e) => setSearchDesigner(e.target.value)}
                  aria-autocomplete="list"
                  aria-expanded={searchDesigner.length > 0 ? "true" : undefined}
                  aria-haspopup="listbox"
                  className="w-full bg-transparent border-none outline-none text-zinc-900 font-semibold placeholder:text-zinc-400 focus:ring-0"
                />
                {selectedDesignerCountry && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                    <span className="text-xs font-bold uppercase tracking-wider">Multiplier</span>
                    <span className="text-sm font-black">×{selectedDesignerCountry.multiplier.toFixed(2)}</span>
                  </div>
                )}
              </div>
              {searchDesigner && (
                <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white border border-zinc-100 rounded-2xl shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200">
                  {filteredDesigner.length > 0 ? (
                    filteredDesigner.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleSelectDesigner(c)
                        }}
                        className="w-full flex items-center justify-between px-6 py-3 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0 text-left"
                      >
                        <span className="font-medium text-zinc-800">{c.name}</span>
                        <span className="text-xs font-bold text-zinc-400">×{c.multiplier.toFixed(2)}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-sm text-zinc-400 italic text-center">No countries found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
            Where is your client based?
          </label>
          <div className="relative group">
            <div className={`
              flex items-center gap-4 p-4 border-2 rounded-2xl transition-all
              ${state.clientCountryId 
                ? 'border-zinc-200 bg-white' 
                : !isLoading && !state.clientCountryId && state.currentStep === 4 
                  ? 'border-red-100 bg-red-50/50' 
                  : 'border-zinc-100 bg-zinc-50'}
            `}>
              <div className="flex-1">
                <input
                  type="text"
                  id="client-country"
                  placeholder={selectedClientCountry ? selectedClientCountry.name : "Search for a country..."}
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  aria-autocomplete="list"
                  aria-expanded={searchClient.length > 0 ? "true" : undefined}
                  aria-haspopup="listbox"
                  className="w-full bg-transparent border-none outline-none text-zinc-900 font-semibold placeholder:text-zinc-400 focus:ring-0"
                />
                {selectedClientCountry && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                    <span className="text-xs font-bold uppercase tracking-wider">Multiplier</span>
                    <span className="text-sm font-black">×{selectedClientCountry.multiplier.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {!state.designerCountryId || !state.clientCountryId ? (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs font-bold font-serif">i</div>
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              Please select both locations to accurately calculate regional price modifiers.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <div className="w-6 h-6 flex items-center justify-center bg-green-600 text-white rounded-full text-xs font-bold">✓</div>
            <p className="text-xs text-green-700 leading-relaxed font-medium">
              Location modifiers applied. We'll use PPP adjustments for {selectedDesignerCountry?.name} and {selectedClientCountry?.name}.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
