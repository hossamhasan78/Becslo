'use client'

import { createClient } from '@supabase/supabase-js'
import { User, Session } from '@/types/auth'
import { redirect } from 'next/navigation'

export function GoogleLoginButton() {
  const supabase = createClient()

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Google OAuth error:', error)
        alert(`Failed to sign in: ${error.message}`)
      }
    }
  } catch (err) {
      console.error('Unexpected error:', err)
      alert(`An unexpected error occurred: ${err.message}`)
    }
  }

  return (
    <button
      onClick={handleLogin}
      className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Sign in with Google
    </button>
  )
}
