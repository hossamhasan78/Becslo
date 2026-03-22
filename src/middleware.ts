import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Admin routes that require admin role
 */
const ADMIN_ROUTES = ['/admin']

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password']

/**
 * Check if a path requires admin role
 */
function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some((route) => pathname.startsWith(route))
}

/**
 * Check if a path is public (no auth required)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Handle admin routes - require admin role
  if (isAdminRoute(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Check admin role from user metadata
    const isAdmin = user.user_metadata?.role === 'admin'

    if (!isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/wizard'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  // Handle wizard routes - require authentication
  if (pathname.startsWith('/wizard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Handle login/signup pages - redirect if already authenticated
  if (isPublicRoute(pathname) && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/wizard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/wizard/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
    '/forgot-password',
  ],
}
