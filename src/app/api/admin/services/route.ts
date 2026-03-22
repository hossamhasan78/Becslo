import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Service, PaginatedServicesResponse, ApiResponse } from '@/types/admin'

async function getAdminUser(supabase: Awaited<ReturnType<typeof createClient>>) {
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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('page_size') || '25', 10)))
    const isActiveParam = searchParams.get('is_active')
    const category = searchParams.get('category')

    let query = supabase
      .from('services')
      .select('id, name, category_id, default_hours, min_hours, max_hours, is_active, created_at', {
        count: 'exact'
      })

    if (isActiveParam !== null) {
      const isActive = isActiveParam === 'true'
      query = query.eq('is_active', isActive)
    }

    if (category) {
      query = query.eq('category_id', parseInt(category, 10))
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to).order('name')

    const { data: services, error, count } = await query

    if (error) {
      console.error('Error fetching services:', error)
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Failed to fetch services', code: 'INTERNAL_ERROR' }
      }
      return NextResponse.json(response, { status: 500 })
    }

    const formattedServices: Service[] = (services || []).map((s) => ({
      id: String(s.id),
      name: s.name as string,
      category: '',
      default_hours: s.default_hours as number,
      min_hours: s.min_hours as number,
      max_hours: s.max_hours as number,
      is_active: s.is_active as boolean,
      created_at: s.created_at as string,
    }))

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pageSize)

    const response: ApiResponse<PaginatedServicesResponse> = {
      data: {
        services: formattedServices,
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

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, category, default_hours, min_hours, max_hours } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Name is required', code: 'VALIDATION_ERROR' }
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Category is required', code: 'VALIDATION_ERROR' }
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (typeof min_hours !== 'number' || min_hours < 0) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'min_hours must be a non-negative number', code: 'VALIDATION_ERROR' }
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (typeof max_hours !== 'number' || max_hours < min_hours) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'max_hours must be greater than or equal to min_hours', code: 'VALIDATION_ERROR' }
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (typeof default_hours !== 'number' || default_hours < min_hours || default_hours > max_hours) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'default_hours must be between min_hours and max_hours', code: 'INVALID_SERVICE_HOURS' }
      }
      return NextResponse.json(response, { status: 422 })
    }

    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('name', category)
      .single()

    if (categoryError || !categoryData) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: `Category "${category}" not found`, code: 'VALIDATION_ERROR' }
      }
      return NextResponse.json(response, { status: 400 })
    }

    const { data: newService, error: insertError } = await supabase
      .from('services')
      .insert({
        name: name.trim(),
        category_id: categoryData.id,
        default_hours,
        min_hours,
        max_hours,
        is_active: true,
      })
      .select('id, name, default_hours, min_hours, max_hours, is_active, created_at')
      .single()

    if (insertError) {
      console.error('Error creating service:', insertError)
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Failed to create service', code: 'INTERNAL_ERROR' }
      }
      return NextResponse.json(response, { status: 500 })
    }

    const service: Service = {
      id: String(newService.id),
      name: newService.name as string,
      category: categoryData.name,
      default_hours: newService.default_hours as number,
      min_hours: newService.min_hours as number,
      max_hours: newService.max_hours as number,
      is_active: newService.is_active as boolean,
      created_at: newService.created_at as string,
    }

    const response: ApiResponse<Service> = {
      data: service,
      error: null,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    const response: ApiResponse<null> = {
      data: null,
      error: { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' }
    }
    return NextResponse.json(response, { status: 500 })
  }
}
