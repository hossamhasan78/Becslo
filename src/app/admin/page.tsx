import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

async function getAdminStats() {
  const supabase = await createSupabaseServerClient()

  const [
    { count: servicesCount },
    { count: calculationsCount },
    { count: activeServicesCount },
  ] = await Promise.all([
    supabase.from('services').select('*', { count: 'exact', head: true }),
    supabase.from('calculations').select('*', { count: 'exact', head: true }),
    supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
  ])

  return {
    servicesCount: servicesCount || 0,
    calculationsCount: calculationsCount || 0,
    activeServicesCount: activeServicesCount || 0,
  }
}

async function getAdminUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return {
    email: user.email,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
  }
}

export default async function AdminDashboard() {
  const [adminUser, stats] = await Promise.all([
    getAdminUser(),
    getAdminStats(),
  ])

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {adminUser.name}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Services</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.servicesCount}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {stats.activeServicesCount} active
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Total Calculations
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.calculationsCount}
          </p>
          <p className="mt-1 text-sm text-gray-500">All time</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Services</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.activeServicesCount}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Available to users
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/services"
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <svg
              className="w-12 h-12 text-blue-600 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="font-medium text-gray-900">Manage Services</span>
            <span className="text-sm text-gray-500">Add, edit, or deactivate</span>
          </Link>

          <Link
            href="/admin/config"
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <svg
              className="w-12 h-12 text-green-600 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium text-gray-900">Configuration</span>
            <span className="text-sm text-gray-500">Adjust pricing settings</span>
          </Link>

          <Link
            href="/admin/analytics"
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <svg
              className="w-12 h-12 text-purple-600 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="font-medium text-gray-900">Analytics</span>
            <span className="text-sm text-gray-500">View metrics and trends</span>
          </Link>

          <Link
            href="/admin/calculations"
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <svg
              className="w-12 h-12 text-orange-600 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium text-gray-900">Calculations</span>
            <span className="text-sm text-gray-500">View calculation history</span>
          </Link>
        </div>
      </div>

      {/* Admin Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Admin Account
        </h2>
        <div className="text-sm text-gray-600">
          <p>
            <span className="font-medium">Email:</span> {adminUser.email}
          </p>
          <p className="mt-1">
            <span className="font-medium">Role:</span> Admin
          </p>
        </div>
      </div>
    </div>
  )
}
