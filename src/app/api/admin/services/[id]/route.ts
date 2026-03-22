import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Service, ApiResponse } from '@/types/admin'

async function getAdminUser(supabase: ReturnType<typeof createSupabaseServerClient>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return null
  }
  return user
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const { data: service, error } = await supabase
      .from('services')
      .select('id, name, category_id, default_hours, min_hours, max_hours, is_active, created_at')
      .eq('id', id)
      .single()

    if (error || !service) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Service not found', code: 'NOT_FOUND' }
      }
      return NextResponse.json(response, { status: 404 })
    }

    const formattedService: Service = {
      id: String(service.id),
      name: service.name as string,
      category: '',
      default_hours: service.default_hours as number,
      min_hours: service.min_hours as number,
      max_hours: service.max_hours as number,
      is_active: service.is_active as boolean,
      created_at: service.created_at as string,
    }

    const response: ApiResponse<Service> = {
      data: formattedService,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { name, category, default_hours, min_hours, max_hours, is_active } = body

    const { data: existingService, error: fetchError } = await supabase
      .from('services')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingService) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Service not found', code: 'NOT_FOUND' }
      }
      return NextResponse.json(response, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        const response: ApiResponse<null> = {
          data: null,
          error: { message: 'Name cannot be empty', code: 'VALIDATION_ERROR' }
        }
        return NextResponse.json(response, { status: 400 })
      }
      updateData.name = name.trim()
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim().length === 0) {
        const response: ApiResponse<null> = {
          data: null,
          error: { message: 'Category cannot be empty', code: 'VALIDATION_ERROR' }
        }
        return NextResponse.json(response, { status: 400 })
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
      updateData.category_id = categoryData.id
    }

    if (min_hours !== undefined) {
      if (typeof min_hours !== 'number' || min_hours < 0) {
        const response: ApiResponse<null> = {
          data: null,
          error: { message: 'min_hours must be a non-negative number', code: 'VALIDATION_ERROR' }
        }
        return NextResponse.json(response, { status: 400 })
      }
      updateData.min_hours = min_hours
    }

    if (max_hours !== undefined) {
      const currentMinHours = min_hours ?? updateData.min_hours
      if (typeof max_hours !== 'number' || (currentMinHours !== undefined && max_hours < currentMinHours)) {
        const response: ApiResponse<null> = {
          data: null,
          error: { message: 'max_hours must be greater than or equal to min_hours', code: 'VALIDATION_ERROR' }
        }
        return NextResponse.json(response, { status: 400 })
      }
      updateData.max_hours = max_hours
    }

    if (default_hours !== undefined) {
      const currentMinHours = min_hours ?? updateData.min_hours
      const currentMaxHours = max_hours ?? updateData.max_hours
      if (typeof default_hours !== 'number') {
        const response: ApiResponse<null> = {
          data: null,
          error: { message: 'default_hours must be a number', code: 'VALIDATION_ERROR' }
        }
        return NextResponse.json(response, { status: 400 })
      }
      if (currentMinHours !== undefined && (default_hours < currentMinHours || default_hours > currentMaxHours)) {
        const response: ApiResponse<null> = {
          data: null,
          error: { message: 'default_hours must be between min_hours and max_hours', code: 'INVALID_SERVICE_HOURS' }
        }
        return NextResponse.json(response, { status: 422 })
      }
      updateData.default_hours = default_hours
    }

    if (is_active !== undefined) {
      if (typeof is_active !== 'boolean') {
        const response: ApiResponse<null> = {
          data: null,
          error: { message: 'is_active must be a boolean', code: 'VALIDATION_ERROR' }
        }
        return NextResponse.json(response, { status: 400 })
      }
      updateData.is_active = is_active
    }

    if (Object.keys(updateData).length === 0) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'No fields to update', code: 'VALIDATION_ERROR' }
      }
      return NextResponse.json(response, { status: 400 })
    }

    const { data: updatedService, error: updateError } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select('id, name, default_hours, min_hours, max_hours, is_active, created_at')
      .single()

    if (updateError) {
      console.error('Error updating service:', updateError)
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Failed to update service', code: 'INTERNAL_ERROR' }
      }
      return NextResponse.json(response, { status: 500 })
    }

    const formattedService: Service = {
      id: String(updatedService.id),
      name: updatedService.name as string,
      category: '',
      default_hours: updatedService.default_hours as number,
      min_hours: updatedService.min_hours as number,
      max_hours: updatedService.max_hours as number,
      is_active: updatedService.is_active as boolean,
      created_at: updatedService.created_at as string,
    }

    const response: ApiResponse<Service> = {
      data: formattedService,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const { data: existingService, error: fetchError } = await supabase
      .from('services')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError || !existingService) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Service not found', code: 'NOT_FOUND' }
      }
      return NextResponse.json(response, { status: 404 })
    }

    const { count: calculationCount } = await supabase
      .from('calculation_services')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', id)

    if (calculationCount && calculationCount > 0) {
      const { error: deactivateError } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', id)

      if (deactivateError) {
        console.error('Error deactivating service:', deactivateError)
        const response: ApiResponse<null> = {
          data: null,
          error: { message: 'Failed to deactivate service', code: 'INTERNAL_ERROR' }
        }
        return NextResponse.json(response, { status: 500 })
      }

      const response: ApiResponse<null> = {
        data: null,
        error: {
          message: 'Cannot delete service that has been used in existing calculations. Service has been deactivated instead.',
          code: 'SERVICE_IN_USE',
          details: {
            service_id: id,
            calculation_count: calculationCount
          }
        }
      }
      return NextResponse.json(response, { status: 409 })
    }

    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting service:', deleteError)
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Failed to delete service', code: 'INTERNAL_ERROR' }
      }
      return NextResponse.json(response, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Unexpected error:', error)
    const response: ApiResponse<null> = {
      data: null,
      error: { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' }
    }
    return NextResponse.json(response, { status: 500 })
  }
}
