import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Configuration, ConfigurationUpdateInput, ApiResponse } from '@/types/admin'

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

function validateConfigurationInput(input: Partial<ConfigurationUpdateInput>): string[] {
  const errors: string[] = []

  if (input.base_rate !== undefined) {
    if (typeof input.base_rate !== 'number' || input.base_rate <= 0) {
      errors.push('base_rate must be a positive number')
    }
  }

  if (input.risk_buffer_min !== undefined) {
    if (typeof input.risk_buffer_min !== 'number' || input.risk_buffer_min < 0 || input.risk_buffer_min > 50) {
      errors.push('risk_buffer_min must be between 0 and 50')
    }
  }

  if (input.risk_buffer_max !== undefined) {
    if (typeof input.risk_buffer_max !== 'number' || input.risk_buffer_max < 0 || input.risk_buffer_max > 50) {
      errors.push('risk_buffer_max must be between 0 and 50')
    }
  }

  if (input.risk_buffer_min !== undefined && input.risk_buffer_max !== undefined) {
    if (input.risk_buffer_max < input.risk_buffer_min) {
      errors.push('risk_buffer_max must be greater than or equal to risk_buffer_min')
    }
  }

  if (input.profit_margin_min !== undefined) {
    if (typeof input.profit_margin_min !== 'number' || input.profit_margin_min < 10 || input.profit_margin_min > 50) {
      errors.push('profit_margin_min must be between 10 and 50')
    }
  }

  if (input.profit_margin_max !== undefined) {
    if (typeof input.profit_margin_max !== 'number' || input.profit_margin_max < 10 || input.profit_margin_max > 50) {
      errors.push('profit_margin_max must be between 10 and 50')
    }
  }

  if (input.profit_margin_min !== undefined && input.profit_margin_max !== undefined) {
    if (input.profit_margin_max < input.profit_margin_min) {
      errors.push('profit_margin_max must be greater than or equal to profit_margin_min')
    }
  }

  return errors
}

export async function GET() {
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

    const { data: config, error } = await supabase
      .from('config')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching config:', error)
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Failed to fetch configuration', code: 'INTERNAL_ERROR' }
      }
      return NextResponse.json(response, { status: 500 })
    }

    const configuration: Configuration = {
      id: String(config.id),
      base_rate: config.base_rate as number,
      risk_buffer_min: config.risk_buffer_min as number,
      risk_buffer_max: config.risk_buffer_max as number,
      profit_margin_min: config.profit_margin_min as number,
      profit_margin_max: config.profit_margin_max as number,
      version: config.version as number,
      updated_at: config.updated_at as string | null,
      updated_by: config.updated_by ? String(config.updated_by) : null,
    }

    const response: ApiResponse<Configuration> = {
      data: configuration,
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

export async function PUT(request: NextRequest) {
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

    const body: ConfigurationUpdateInput = await request.json()
    const { version, ...updates } = body

    if (typeof version !== 'number' || version < 1) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Valid version number is required', code: 'VALIDATION_ERROR' }
      }
      return NextResponse.json(response, { status: 400 })
    }

    const validationErrors = validateConfigurationInput(body)
    if (validationErrors.length > 0) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: validationErrors.join(', '), code: 'VALIDATION_ERROR' }
      }
      return NextResponse.json(response, { status: 400 })
    }

    const { data: currentConfig, error: fetchError } = await supabase
      .from('config')
      .select('id, version')
      .single()

    if (fetchError) {
      console.error('Error fetching current config:', fetchError)
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Failed to fetch current configuration', code: 'INTERNAL_ERROR' }
      }
      return NextResponse.json(response, { status: 500 })
    }

    if (currentConfig.version !== version) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Configuration has been modified by another user. Please refresh and try again.', code: 'CONFLICT' }
      }
      return NextResponse.json(response, { status: 409 })
    }

    const updateData: Record<string, unknown> = {
      version: currentConfig.version + 1,
      updated_at: new Date().toISOString(),
      updated_by: adminUser.id,
    }

    if (updates.base_rate !== undefined) updateData.base_rate = updates.base_rate
    if (updates.risk_buffer_min !== undefined) updateData.risk_buffer_min = updates.risk_buffer_min
    if (updates.risk_buffer_max !== undefined) updateData.risk_buffer_max = updates.risk_buffer_max
    if (updates.profit_margin_min !== undefined) updateData.profit_margin_min = updates.profit_margin_min
    if (updates.profit_margin_max !== undefined) updateData.profit_margin_max = updates.profit_margin_max

    const { data: updatedConfig, error: updateError } = await supabase
      .from('config')
      .update(updateData)
      .eq('id', currentConfig.id)
      .eq('version', version)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating config:', updateError)
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Failed to update configuration', code: 'INTERNAL_ERROR' }
      }
      return NextResponse.json(response, { status: 500 })
    }

    if (!updatedConfig) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Configuration has been modified by another user. Please refresh and try again.', code: 'CONFLICT' }
      }
      return NextResponse.json(response, { status: 409 })
    }

    const configuration: Configuration = {
      id: String(updatedConfig.id),
      base_rate: updatedConfig.base_rate as number,
      risk_buffer_min: updatedConfig.risk_buffer_min as number,
      risk_buffer_max: updatedConfig.risk_buffer_max as number,
      profit_margin_min: updatedConfig.profit_margin_min as number,
      profit_margin_max: updatedConfig.profit_margin_max as number,
      version: updatedConfig.version as number,
      updated_at: updatedConfig.updated_at as string | null,
      updated_by: updatedConfig.updated_by ? String(updatedConfig.updated_by) : null,
    }

    const response: ApiResponse<Configuration> = {
      data: configuration,
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
