import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Sidebar from '@/components/admin/Sidebar'
import LogoutButton from '@/components/admin/LogoutButton'

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

  return {
    email: user.email || 'Unknown',
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminUser = await getAdminUser()

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Admin Dashboard
              </h2>
            </div>
            <LogoutButton email={adminUser.email} />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
