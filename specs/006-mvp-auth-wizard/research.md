# Research: MVP Authentication & Wizard Skeleton

**Feature**: MVP Authentication & Wizard Skeleton
**Date**: 2026-03-17
**Phase**: Phase 0 - Research & Technical Investigation

## Overview

This document consolidates research findings for implementing email/password authentication with Supabase in a NextJS 14.x monolithic application, establishing the foundation for the wizard layout and state management architecture.

---

## 1. NextJS 14.x App Router Authentication

### Decision: Use Supabase Auth with Server Components

**Rationale**:
- Supabase provides built-in email/password authentication eliminating need for custom OAuth implementation
- NextJS 14.x App Router supports server-side auth checks via middleware
- Supabase client can be instantiated on both client and server for optimal performance
- Built-in session management eliminates complexity of token handling

**Alternatives Considered**:
- NextAuth.js: Rejected because requires additional configuration and doesn't provide database/backend
- Custom OAuth implementation: Rejected due to complexity and security risks
- Firebase Auth: Rejected because Supabase is constitutionally mandated

### Implementation Pattern:

**Client-side**: Supabase client singleton for browser operations
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

**Server-side**: Supabase server client for server components
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = () =>
  createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  )
```

---

## 2. Email/Password Authentication with Supabase

### Decision: Supabase Auth with Email/Password

**Rationale**:
- Native Google OAuth provider in Supabase
- Automatic session management via cookies
- Token refresh handled automatically
- Redirect handling simplified with Supabase Auth Helpers

**Implementation Steps**:

1. **Enable Email/Password in Supabase Dashboard**:
   - Enable Email provider in Authentication > Providers

2. **Login/Signup Component**:
```typescript
// components/auth/AuthForm.tsx
'use client'
import { createClient } from '@/lib/supabase/client'

export function AuthForm() {
  const supabase = createClient()

  const handleSignup = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })
  }

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
  }

  return (
    <form>
      {/* form fields */}
    </form>
  )
}
```

3. **Callback Handler (Server Action)**:
```typescript
// app/(auth)/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET() {
  const supabase = createClient()

  // Exchange code for session (handled by Supabase)
  // Create/update user in database
  // Redirect to wizard

  redirect('/wizard')
}
```

### Error Handling:

- Network failures: Display user-friendly error with retry option
- User denies permission: Show specific message about required permissions
- Invalid credentials: Redirect to login with error param
- Browser blocks redirects: Detect and provide manual link

---

## 3. Database Schema & RLS Policies

### Decision: PostgreSQL with Row-Level Security

**Rationale**:
- Constitutional requirement for user data isolation
- RLS provides database-enforced security
- Supabase handles RLS automatically with session context
- Separate admin table for role-based access

### Schema Design:

```sql
-- Users table (managed by Supabase Auth)
-- auth.users is created automatically
-- We extend it with public.users for additional fields

create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  created_at timestamp with time zone default now()
);

-- Admin users table
create table public.admin_users (
  id serial primary key,
  user_id uuid references public.users(id) on delete cascade,
  role text default 'admin',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.admin_users enable row level security;
```

### RLS Policies:

```sql
-- Users can only see their own record
create policy "Users can view own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id);

-- Admin has full access to users
create policy "Admins can view all users"
  on public.users for select
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

-- Admin access to admin_users
create policy "Admins can manage admin_users"
  on public.admin_users for all
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );
```

---

## 4. State Management Architecture

### Decision: React Context API for MVP

**Rationale**:
- Built into React, no additional dependencies
- Sufficient for MVP authentication state
- Can be upgraded to Zustand if complexity increases
- Works seamlessly with Server Components

**Implementation**:

```typescript
// lib/context/AuthContext.tsx
'use client'
import { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize on mount and listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          setUser(session?.user ?? null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### Wizard State (Placeholder):

```typescript
// lib/context/WizardContext.tsx
'use client'
import { createContext, useContext, useState } from 'react'

interface WizardContextType {
  currentStep: number
  setStep: (step: number) => void
  // Add state fields as wizard is implemented
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setStep] = useState(0)

  return (
    <WizardContext.Provider value={{ currentStep, setStep }}>
      {children}
    </WizardContext.Provider>
  )
}

export const useWizard = () => {
  const context = useContext(WizardContext)
  if (!context) throw new Error('useWizard must be used within WizardProvider')
  return context
}
```

---

## 5. Route Protection Middleware

### Decision: NextJS Middleware

**Rationale**:
- Middleware runs before all requests for optimal security
- Can redirect unauthenticated users automatically
- Works with both Server and Client Components
- Can set public/auth route groups

**Implementation**:

```typescript
// middleware.ts
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/wizard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Admin routes (for future use)
  if (req.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/wizard/:path*', '/admin/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 6. Wizard Layout Implementation

### Decision: CSS Grid with Tailwind

**Rationale**:
- Tailwind CSS is specified in constitution
- Grid provides precise control over 3/4 + 1/4 split
- Responsive design with mobile-first approach
- Easy to maintain and adjust

**Implementation**:

```typescript
// components/wizard/WizardLayout.tsx
export function WizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen">
      {/* Left Panel - 3/4 width */}
      <div className="lg:col-span-3 overflow-y-auto">
        <LeftPanel>
          {children}
        </LeftPanel>
      </div>

      {/* Right Panel - 1/4 width */}
      <div className="lg:col-span-1 bg-gray-50 p-4 overflow-y-auto">
        <RightPanel />
      </div>
    </div>
  )
}
```

---

## 7. Admin User Seeding

### Decision: SQL Migration with Conditional Creation

**Rationale**:
- Idempotent - can be run multiple times safely
- Runs automatically on deployment
- Uses environment variable for admin email
- Prevents duplicate admin users

**Implementation**:

```sql
-- supabase/migrations/002_seed_admin.sql

-- Insert admin user (only if doesn't exist)
insert into public.admin_users (user_id, role)
select id, 'admin'
from auth.users
where email = lower('${ADMIN_EMAIL}')  -- From environment
  and not exists (
    select 1 from public.admin_users where user_id = auth.users.id
  );
```

---

## 8. Testing Strategy

### Decision: Multi-Layer Testing Approach

**Unit Tests** (Jest):
- AuthContext state management
- Validation utilities
- Helper functions

**Integration Tests** (React Testing Library):
- Login button interaction
- OAuth flow simulation
- Route protection

**E2E Tests** (Playwright):
- Complete Google OAuth flow
- Protected route redirects
- Admin user creation and authentication

**Performance Targets**:
- Page load: < 2 seconds
- Auth flow: < 30 seconds total
- OAuth success rate: 95%+

---

## Summary of Decisions

| Component | Technology | Justification |
|-----------|------------|----------------|
| Authentication | Supabase Auth (email/password) | Constitution requirement, built-in auth, session management |
| Framework | NextJS 14.x App Router | Constitution requirement, SSR, server components |
| Database | Supabase PostgreSQL with RLS | Constitution requirement, user data isolation |
| State Management | React Context API | Built-in, MVP-sufficient, upgradable |
| Styling | Tailwind CSS | Constitution requirement, rapid development |
| Testing | Jest, RTL, Playwright | Standard stack, comprehensive coverage |
| Deployment | Vercel | Constitution requirement, seamless integration |

All technical decisions align with constitutional requirements and best practices for NextJS 14.x + Supabase applications.
