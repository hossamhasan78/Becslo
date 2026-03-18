import { redirect } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-8 text-center">Sign In</h1>

        <div className="flex flex-col items-center gap-4">
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 text-white rounded">
              {errorMessage}
            </div>
          )}

          <GoogleLoginButton />
        </div>
      </div>
    </div>
  )
}
