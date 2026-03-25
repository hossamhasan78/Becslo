'use client'

import { motion } from 'framer-motion'

interface AsyncStatusProps {
  isLoading?: boolean
  isError?: boolean
  error?: string | null
  onRetry?: () => void
  loadingMessage?: string
  children?: React.ReactNode
}

export function AsyncStatus({
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  loadingMessage = 'Loading...',
  children,
}: AsyncStatusProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-8"
      >
        <div className="w-10 h-10 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-medium animate-pulse">{loadingMessage}</p>
      </motion.div>
    )
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-8 px-4"
      >
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-xl mb-4">
          ⚠️
        </div>
        <p className="text-red-600 font-medium text-center mb-4">{error || 'Something went wrong'}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all active:scale-95"
          >
            Try Again
          </button>
        )}
      </motion.div>
    )
  }

  return <>{children}</>
}

interface GlobalLoadingProps {
  message?: string
}

export function GlobalLoading({ message = 'Loading...' }: GlobalLoadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin mb-4" />
        <p className="text-zinc-600 font-medium animate-pulse">{message}</p>
      </div>
    </motion.div>
  )
}