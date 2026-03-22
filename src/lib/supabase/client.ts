import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let clientInstance: SupabaseClient | null = null

/**
 * Get or create a Supabase browser client singleton
 * @returns Supabase client instance for client-side usage
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return clientInstance
}

/**
 * Type alias for the browser client function
 */
export const getClient = getSupabaseBrowserClient
