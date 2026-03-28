import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Email confirmation callback handler
 * Receives the code from Supabase email confirmation link
 * Exchanges it for a session and redirects to /wizard or /login
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=invalid_code', request.url))
  }

  try {
    const supabase = await createSupabaseServerClient()

    // Exchange the confirmation code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Email confirmation error:', error.message)
      return NextResponse.redirect(new URL('/login?error=confirmation_failed', request.url))
    }

    if (!data.session) {
      console.error('Email confirmation error: No session returned')
      return NextResponse.redirect(new URL('/login?error=confirmation_failed', request.url))
    }

    // Session is automatically set in cookies by the server client
    // Redirect to wizard on success
    return NextResponse.redirect(new URL('/wizard', request.url))
  } catch (error) {
    console.error('Unexpected error in email confirmation:', error)
    return NextResponse.redirect(new URL('/login?error=confirmation_failed', request.url))
  }
}
