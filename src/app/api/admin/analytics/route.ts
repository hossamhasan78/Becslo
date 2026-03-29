import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getAnalyticsMetrics } from '@/lib/analytics'
import type { ApiResponse } from '@/types/admin'

async function getAdminUser(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: adminRecord } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  if (!adminRecord) return null
  return user
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createSupabaseServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Ignore errors in read-only context
            }
          },
        },
      }
    )

    const adminUser = await getAdminUser(supabase)

    if (!adminUser) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }
      }
      return NextResponse.json(response, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date') || undefined
    const endDate = searchParams.get('end_date') || undefined

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        const response: ApiResponse<null> = {
          data: null,
          error: { message: 'Invalid date format', code: 'INVALID_DATE_RANGE' }
        }
        return NextResponse.json(response, { status: 400 })
      }

      if (start > end) {
        const response: ApiResponse<null> = {
          data: null,
          error: { message: 'Start date must be before or equal to end date', code: 'INVALID_DATE_RANGE' }
        }
        return NextResponse.json(response, { status: 400 })
      }
    }

    const metrics = await getAnalyticsMetrics(supabase, startDate, endDate)

    const response: ApiResponse<typeof metrics> = {
      data: metrics,
      error: null,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Unexpected error:', error)
    const response: ApiResponse<null> = {
      data: null,
      error: { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' }
    }
    return NextResponse.json(response, { status: 500 })
  }
}
