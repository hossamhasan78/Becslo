import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Sidebar from '@/components/admin/Sidebar'
import { AppHeader } from '@/components/AppHeader'

async function getAdminUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = user.user_metadata?.role === 'admin'

  if (!isAdmin) {
    redirect('/wizard')
  }

  return user
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await getAdminUser()

  return (
    <>
      <AppHeader />
      <div className="flex min-h-screen bg-gray-100 pt-14">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
