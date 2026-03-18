import { createClient as createSupabaseClient } from '@/lib/supabase/client'

export const createClientFromRequest = () => {
  return createClient()
}
