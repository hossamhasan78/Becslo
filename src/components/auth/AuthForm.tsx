'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getClient } from '@/lib/supabase/client'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

function getFriendlyError(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('invalid login') || lowerMessage.includes('invalid email or password')) {
    return 'Invalid email or password. Please try again.'
  }
  if (lowerMessage.includes('user already exists') || lowerMessage.includes('already registered')) {
    return 'An account with this email already exists. Please log in instead.'
  }
  if (lowerMessage.includes('password')) {
    return 'Password must be at least 6 characters.'
  }
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'Unable to connect. Please check your internet connection and try again.'
  }
  if (lowerMessage.includes('email')) {
    return 'Please enter a valid email address.'
  }
  if (lowerMessage.includes('email not confirmed')) {
    return 'Please confirm your email address before logging in.'
  }
  if (lowerMessage.includes('too many requests')) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }

  return 'An unexpected error occurred. Please try again.'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = useMemo(() => getClient(), [])

  // Check for email confirmation success message
  useEffect(() => {
    const confirmed = searchParams.get('confirmed')
    if (confirmed === 'true') {
      setSuccess('Email confirmed! You can now log in.')
      setError('')
    }

    const errorParam = searchParams.get('error')
    if (errorParam === 'confirmation_failed') {
      setError('Email confirmation failed. Please try signing up again.')
      setSuccess('')
    } else if (errorParam === 'invalid_code') {
      setError('Invalid confirmation link. Please try signing up again.')
      setSuccess('')
    }
  }, [searchParams])

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Please fill in all required fields.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(getFriendlyError(error.message))
    } else if (data.session) {
      const isAdmin = data.user?.user_metadata?.role === 'admin'
      router.push(isAdmin ? '/admin' : '/wizard')
    } else if (data.user) {
      setError('Please check your email to confirm your account before logging in.')
    } else {
      setError('Login failed. Please try again.')
    }
    setLoading(false)
  }

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    if (!email || !password || !name) {
      setError('Please fill in all required fields.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://becslo.hsd-designs.com'}/auth/callback`
      }
    })
    
    if (error) {
      setError(getFriendlyError(error.message))
    } else {
      setSuccess('Account created! Please log in.')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    }
    setLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'login') {
      handleLogin()
    } else {
      handleSignup()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'signup' && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="John Doe"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••"
        />
        {mode === 'signup' && (
          <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm p-3 bg-red-50 rounded border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-600 text-sm p-3 bg-green-50 rounded border border-green-200">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : mode === 'signup' ? 'Sign Up' : 'Sign In'}
      </button>
    </form>
  )
}
