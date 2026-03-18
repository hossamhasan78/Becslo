import { redirect } from 'next/navigation'

export async function GET() {
  const supabase = createClient()

  // Exchange code for session (handled by Supabase)
  // Create/update user in database (handled by trigger)

  // Redirect to wizard
  redirect('/wizard')
}
