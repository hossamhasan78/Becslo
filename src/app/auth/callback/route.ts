import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Email confirmation callback handler
 * Receives the code from Supabase email confirmation link
 * Exchanges it for a session and redirects to login with confirmation status
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tools.hsd-designs.com/becslo').replace(/\/$/, '')

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login?error=invalid_code`)
  }

  try {
    const supabase = await createSupabaseServerClient()

    // Exchange the confirmation code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Email confirmation error:', error.message)
      return NextResponse.redirect(`${siteUrl}/login?error=confirmation_failed`)
    }

    if (!data.session) {
      console.error('Email confirmation error: No session returned')
      return NextResponse.redirect(`${siteUrl}/login?error=confirmation_failed`)
    }

    // Session is automatically set in cookies by the server client
    // Redirect to login with confirmation success message
    return NextResponse.redirect(`${siteUrl}/login?confirmed=true`)
  } catch (error) {
    console.error('Unexpected error in email confirmation:', error)
    return NextResponse.redirect(`${siteUrl}/login?error=confirmation_failed`)
  }
}
