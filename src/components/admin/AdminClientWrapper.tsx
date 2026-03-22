'use client'

import { ReactNode } from 'react'
import ErrorBoundary from '@/components/admin/ErrorBoundary'
import { AdminProvider } from '@/context/AdminContext'

interface AdminClientWrapperProps {
  children: ReactNode
}

export default function AdminClientWrapper({ children }: AdminClientWrapperProps) {
  return (
    <AdminProvider>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </AdminProvider>
  )
}
