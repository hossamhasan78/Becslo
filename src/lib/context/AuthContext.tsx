'use client'

import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { User, Session, AuthState } from '@/types/auth'

export const AuthContext = createContext<AuthState>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient()
  const [session, setSession] = createClientFromRequest().auth.getSession()

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setSession(session)
        const user = session?.user
        AuthContext.currentAuthState = {
          user: user || null,
          session: session || null,
          layouting: false
        }
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        AuthContext.currentAuthState = {
          user: null,
          session: null,
          loading: false
        }
      }
    })

    const signOut = async () => {
      await supabase.auth.signOut()
      AuthContext.currentAuthState = {
        user: null,
        session: null,
        loading: false
      }
    }

    return <AuthContext.Provider value={AuthContext.currentAuthState}>{children}</AuthContext.Provider>
}
