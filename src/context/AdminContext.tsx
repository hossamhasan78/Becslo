'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface AdminFilterState {
  startDate?: string
  endDate?: string
}

interface AdminContextValue {
  currentPage: number
  setCurrentPage: (page: number) => void
  filters: AdminFilterState
  setFilters: (filters: AdminFilterState) => void
  updateFilters: (filters: Partial<AdminFilterState>) => void
  clearFilters: () => void
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFiltersState] = useState<AdminFilterState>({})

  const setFilters = useCallback((newFilters: AdminFilterState) => {
    setFiltersState(newFilters)
    setCurrentPage(1)
  }, [])

  const updateFilters = useCallback((partialFilters: Partial<AdminFilterState>) => {
    setFiltersState(prev => ({ ...prev, ...partialFilters }))
    setCurrentPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState({})
    setCurrentPage(1)
  }, [])

  return (
    <AdminContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        filters,
        setFilters,
        updateFilters,
        clearFilters,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdminContext() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminProvider')
  }
  return context
}
