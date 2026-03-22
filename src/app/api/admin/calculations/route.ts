import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { ApiResponse, PaginatedCalculationsResponse, CalculationListItem } from '@/types/admin'

async function getAdminUser(supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return null
  }
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
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('page_size') || '25', 10)
    const startDate = searchParams.get('start_date') || undefined
    const endDate = searchParams.get('end_date') || undefined

    if (page < 1 || isNaN(page)) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Page must be >= 1', code: 'INVALID_PAGE' }
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (pageSize < 1 || pageSize > 100 || isNaN(pageSize)) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Page size must be between 1 and 100', code: 'INVALID_PAGE_SIZE' }
      }
      return NextResponse.json(response, { status: 400 })
    }

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

    let query = supabase
      .from('calculations')
      .select('id, user_name, user_email, final_price, created_at', { count: 'exact' })

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', `${endDate}T23:59:59.999Z`)
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: calculations, count, error: calcError } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (calcError) {
      console.error('Error fetching calculations:', calcError)
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Failed to fetch calculations', code: 'INTERNAL_ERROR' }
      }
      return NextResponse.json(response, { status: 500 })
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pageSize)

    const response: ApiResponse<PaginatedCalculationsResponse> = {
      data: {
        calculations: calculations?.map((c): CalculationListItem => ({
          id: c.id,
          user_name: c.user_name,
          user_email: c.user_email,
          final_price: c.final_price,
          created_at: c.created_at,
        })) || [],
        pagination: {
          page,
          page_size: pageSize,
          total_count: totalCount,
          total_pages: totalPages,
        },
      },
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
