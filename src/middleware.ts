import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createClient()

  const {
    data: { session: null },
  } = await supabase.auth.getSession()

  if (data.session) {
    // Authenticated - allow access
  } else {
    // Not authenticated - redirect to login
    return NextResponse.redirect(new URL('/login'))
  }
}
