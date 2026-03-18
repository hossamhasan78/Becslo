export interface User {
  id: string
  email: string
  name: string | null
  created_at: string
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}
