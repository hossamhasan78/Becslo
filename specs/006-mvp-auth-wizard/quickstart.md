# Quick Start Guide: MVP Authentication & Wizard Skeleton

**Feature**: MVP Authentication & Wizard Skeleton
**Date**: 2026-03-17
**Target Audience**: Developers implementing this feature

## Overview

This guide provides step-by-step instructions for implementing the MVP Authentication & Wizard Skeleton feature, including email/password authentication, wizard layout setup, and admin user seeding.

---

## Prerequisites

### Required Software

- Node.js 18+ (LTS version recommended)
- npm or yarn package manager
- Git
- Supabase account (free tier sufficient)

### Required Accounts

- **Supabase Project**: For backend services (auth, database)
- **Vercel Account**: For deployment (optional for local development)

### Environment Variables

Create a `.env.local` file in project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com

# Email/Password Auth (configured in Supabase, not needed locally)
```

---

## Step 1: Initialize NextJS Project

```bash
# Create new NextJS project with TypeScript and Tailwind
npx create-next-app@latest becslo --typescript --tailwind --app

# Navigate to project directory
cd becslo

# Install Supabase client libraries
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Install additional dependencies
npm install clsx tailwind-merge

# Install development dependencies
npm install -D @types/node jest @testing-library/react @testing-library/jest-dom @playwright/test
```

---

## Step 2: Configure Supabase

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database initialization (2-3 minutes)
4. Copy project URL and anon key to `.env.local`

### 2.2 Enable Email/Password Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Make sure "Confirm email" is disabled for MVP (or enabled if you want email verification)
4. Save configuration

### 2.3 Run Database Migrations

Create `supabase/migrations/001_init_schema.sql`:

```sql
-- Create users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  created_at timestamp with time zone default now()
);

-- Create admin_users table
create table public.admin_users (
  id serial primary key,
  user_id uuid references public.users(id) on delete cascade unique not null,
  role text default 'admin' not null,
  created_at timestamp with time zone default now()
);

-- Enable Row-Level Security
alter table public.users enable row level security;
alter table public.admin_users enable row level security;

-- Users RLS Policies
create policy "Users can view own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id);

create policy "Admins can view all users"
  on public.users for select
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

-- Admin Users RLS Policies
create policy "Admins can manage admin_users"
  on public.admin_users for all
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );
```

Run migration in Supabase dashboard: **SQL Editor** → **New Query** → Paste SQL → **Run**.

Create `supabase/migrations/002_seed_admin.sql`:

```sql
-- Insert admin user (only if doesn't exist)
-- Replace with your admin email
insert into public.admin_users (user_id, role)
select id, 'admin'
from auth.users
where email = lower('admin@yourdomain.com')
  and not exists (
    select 1 from public.admin_users where user_id = auth.users.id
  );
```

---

## Step 3: Set Up Project Structure

```bash
# Create directory structure
mkdir -p src/app/\(auth\)/login src/app/\(auth\)/callback
mkdir -p src/app/\(wizard\)/wizard
mkdir -p src/components/auth src/components/wizard src/components/ui
mkdir -p src/lib/supabase src/lib/context src/lib/utils
mkdir -p src/types
mkdir -p tests/unit/auth tests/integration/auth tests/e2e
mkdir -p supabase/migrations
```

---

## Step 4: Configure Supabase Clients

### 4.1 Client-Side Supabase Client

Create `src/lib/supabase/client.ts`:

```typescript
'use client'

import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

### 4.2 Server-Side Supabase Client

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

---

## Step 5: Implement Authentication Context

Create `src/lib/context/AuthContext.tsx`:

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

## Step 6: Create Login Page

Create `src/app/(auth)/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { loading } = useAuth()
  const supabase = createClient()

  const handleEmailLogin = async (email: string, password: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={() => handleLogin(email, password)}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Sign in with Email
        </button>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Enter your email and password to sign in.
        </p>
      </div>
    </div>
  )
}
```

---

## Step 7: Create OAuth Callback Handler

Create `src/app/(auth)/callback/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)

    // User is created automatically by Supabase
    // Additional user record created by trigger (see below)
  }

  // Redirect to wizard
  redirect('/wizard')
}
```

**Create Database Trigger for User Record** (run in SQL Editor):

```sql
-- Function to create user record on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call function on new user
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## Step 8: Create Route Protection Middleware

Create `middleware.ts` in project root:

```typescript
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect wizard route
  if (req.nextUrl.pathname.startsWith('/wizard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Allow access to public routes
  return res
}

export const config = {
  matcher: ['/wizard/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Step 9: Create Wizard Page with Layout

### 9.1 Wizard Context

Create `src/lib/context/WizardContext.tsx`:

```typescript
'use client'

import { createContext, useContext, useState } from 'react'

interface WizardContextType {
  currentStep: number
  setStep: (step: number) => void
  steps: Array<{
    id: number
    title: string
    description: string
  }>
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { id: 0, title: 'Pricing Model', description: 'Choose your pricing approach' },
    { id: 1, title: 'Service Selection', description: 'Select services you need' },
    { id: 2, title: 'Experience', description: 'Set your experience level' },
    { id: 3, title: 'Geography', description: 'Select your location' },
    { id: 4, title: 'Costs', description: 'Add overhead costs' },
    { id: 5, title: 'Risk & Profit', description: 'Set risk buffer and profit margin' },
    { id: 6, title: 'Review', description: 'Review your quote' },
  ]

  const setStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step)
    }
  }

  return (
    <WizardContext.Provider value={{ currentStep, setStep, steps }}>
      {children}
    </WizardContext.Provider>
  )
}

export const useWizard = () => {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider')
  }
  return context
}
```

### 9.2 Wizard Layout Component

Create `src/components/wizard/WizardLayout.tsx`:

```typescript
'use client'

export function WizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen">
      {/* Left Panel - 3/4 width */}
      <div className="lg:col-span-3 overflow-y-auto p-6">
        {children}
      </div>

      {/* Right Panel - 1/4 width */}
      <div className="lg:col-span-1 bg-gray-50 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
        <p className="text-gray-600">Coming soon...</p>
      </div>
    </div>
  )
}
```

### 9.3 Step Navigation Component

Create `src/components/wizard/StepNavigation.tsx`:

```typescript
'use client'

import { useWizard } from '@/lib/context/WizardContext'

export function StepNavigation() {
  const { steps, currentStep } = useWizard()

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-4">Design Fee Calculator</h1>
      <div className="flex flex-wrap gap-2">
        {steps.map((step) => (
          <button
            key={step.id}
            disabled={true} // Disabled in MVP
            className={`
              px-4 py-2 rounded text-sm font-medium transition
              ${
                step.id === currentStep
                  ? 'bg-blue-600 text-white'
                  : step.id < currentStep
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }
            `}
          >
            {step.id + 1}. {step.title}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### 9.4 Wizard Page

Create `src/app/(wizard)/wizard/page.tsx`:

```typescript
'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { WizardLayout } from '@/components/wizard/WizardLayout'
import { StepNavigation } from '@/components/wizard/StepNavigation'

export default function WizardPage() {
  const { steps, currentStep } = useWizard()
  const currentStepInfo = steps[currentStep]

  return (
    <div className="min-h-screen bg-gray-50">
      <WizardLayout>
        <StepNavigation />

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">
            {currentStepInfo.title}
          </h2>
          <p className="text-gray-600 mb-6">
            {currentStepInfo.description}
          </p>

          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">
              Step {currentStep + 1} content coming soon...
            </p>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              disabled={true}
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={true}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </WizardLayout>
    </div>
  )
}
```

---

## Step 10: Update Root Layout

Update `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/context/AuthContext'
import { WizardProvider } from '@/lib/context/WizardContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Becslo - Design Fee Calculator',
  description: 'Calculate your freelance design project fees',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <WizardProvider>
            {children}
          </WizardProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
```

---

## Step 11: Create Seed Admin User

After starting the application, sign in with your admin email. This will create a user record. Then run the seed migration to assign admin role:

```sql
-- Run in Supabase SQL Editor
insert into public.admin_users (user_id, role)
select id, 'admin'
from auth.users
where email = lower('admin@yourdomain.com')
  and not exists (
    select 1 from public.admin_users where user_id = auth.users.id
  );
```

---

## Step 12: Run Development Server

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
```

---

## Step 13: Test Authentication Flow

### 13.1 Test Email/Password Login

1. Navigate to `http://localhost:3000/login`
2. Enter email and password
3. Click "Sign in"
4. Verify redirect to `http://localhost:3000/wizard`
5. Verify two-panel layout displayed

### 13.2 Test Route Protection

1. Sign out (create sign out button or clear cookies)
2. Navigate directly to `http://localhost:3000/wizard`
3. Verify redirect to `http://localhost:3000/login`

### 13.3 Test Wizard Layout

1. Navigate to wizard (authenticated)
2. Verify left panel shows Step Navigation (7 steps)
3. Verify right panel shows "Live Preview" placeholder
4. Verify layout is 3/4 + 1/4 on desktop
5. Resize browser to mobile - verify panels stack

---

## Step 14: Deploy to Vercel

### 14.1 Push to GitHub

```bash
git add .
git commit -m "Implement MVP authentication and wizard skeleton"
git push origin 006-mvp-auth-wizard
```

### 14.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)
   - `ADMIN_EMAIL`
4. Deploy

### 14.3 Update Email/Password Provider Settings

In Supabase dashboard, ensure Email provider is enabled for production:
- `https://<your-vercel-domain>.vercel.app/auth/callback`

---

## Troubleshooting

### Issue: Email/password authentication fails

**Solution**: Verify email/password provider is enabled in Supabase dashboard and credentials are correct.
- Local: `http://localhost:3000/auth/callback`
- Production: `https://<your-domain>.vercel.app/auth/callback`

### Issue: User not created in database after OAuth

**Solution**: Ensure the trigger `on_auth_user_created` is created in Supabase. Check SQL Editor logs for errors.

### Issue: "RLS policy violation" error

**Solution**: Ensure RLS policies are correctly set up. Test in Supabase dashboard: **Authentication** → **Policies**.

### Issue: Middleware not protecting routes

**Solution**: Ensure `matcher` configuration in `middleware.ts` includes your protected routes. Restart dev server.

---

## Next Steps

After completing this quick start:

1. Implement individual wizard steps (Pricing Model, Service Selection, etc.)
2. Add real-time fee calculation engine
3. Implement PDF export
4. Build admin dashboard
5. Add comprehensive tests
6. Polish and optimize performance

---

## Resources

- [NextJS Documentation](https://nextjs.org/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Auth Helpers for NextJS](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Vercel Deployment](https://vercel.com/docs)

---

**Quick Start Complete!** 🎉

You now have a functioning authentication system with email/password login and a wizard layout skeleton. Proceed to implementing individual wizard steps.
