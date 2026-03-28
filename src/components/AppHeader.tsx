'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'

export function AppHeader() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const [showLogoFallback, setShowLogoFallback] = useState(true)

  const displayName = user?.user_metadata?.full_name || user?.email || 'Account'

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setLogoutError(null)

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        router.push('/login')
        router.refresh()
      } else {
        setLogoutError('Logout failed. Please try again.')
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error('Logout error:', error)
      setLogoutError('Logout failed. Please try again.')
      setIsLoggingOut(false)
    }
  }

  if (loading) {
    return null
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-zinc-200 shadow-sm">
      <div className="flex items-center justify-between h-full px-6 md:px-8">
        {/* Brand Area */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 flex items-center justify-center">
            <img
              src=""
              alt="Becslo"
              className={`w-full h-full object-contain ${showLogoFallback ? 'hidden' : 'block'}`}
              onLoad={() => setShowLogoFallback(false)}
              onError={() => setShowLogoFallback(true)}
            />
            {showLogoFallback && (
              <span className="text-sm font-semibold text-zinc-900">Becslo</span>
            )}
          </div>
        </div>

        {/* User Identity and Logout */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-700 truncate max-w-xs">
            {displayName}
          </span>
          <div className="flex flex-col items-end">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            >
              {isLoggingOut ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging out...
                </span>
              ) : (
                'Logout'
              )}
            </button>
            {logoutError && (
              <span className="text-xs text-red-600 mt-1">{logoutError}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
