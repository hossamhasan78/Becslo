# Data Model: MVP Authentication & Wizard Skeleton

**Feature**: MVP Authentication & Wizard Skeleton
**Date**: 2026-03-17
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the data model for user authentication, admin management, and wizard state management. The model enforces constitutional requirements for data privacy, user isolation via Row-Level Security (RLS), and admin-configured system.

---

## Entity Definitions

### 1. User

**Description**: Represents an authenticated user who has logged in via Google OAuth. Stores essential profile information for analytics and authentication purposes.

**Table**: `public.users`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, FOREIGN KEY to `auth.users(id)` | Unique identifier, references Supabase Auth user |
| `email` | `text` | UNIQUE, NOT NULL | User's email address from Google OAuth |
| `name` | `text` | NULLABLE | User's display name from Google OAuth |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT `now()` | Timestamp of user creation |

**Relationships**:
- One-to-many with `admin_users` (via `user_id`)
- Referenced by `admin_users.user_id`

**Validation Rules**:
- Email must be unique (enforced by UNIQUE constraint)
- `id` must reference valid Supabase Auth user (enforced by FOREIGN KEY cascade delete)

**State Transitions**:
- N/A - User record is created once on first successful OAuth login

**Privacy Note**: User data is stored for admin analytics purposes only (Constitution II). No personal save functionality.

---

### 2. Admin User

**Description**: Represents a user with administrative privileges. Admin users can access protected administrative routes and configure system settings.

**Table**: `public.admin_users`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Auto-incrementing identifier |
| `user_id` | `uuid` | FOREIGN KEY to `public.users(id)`, UNIQUE, NOT NULL | Reference to user record |
| `role` | `text` | NOT NULL, DEFAULT `'admin'` | User role (currently only 'admin') |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT `now()` | Timestamp of admin role assignment |

**Relationships**:
- Many-to-one with `users` (via `user_id`)
- Unique constraint on `user_id` ensures one admin record per user

**Validation Rules**:
- `user_id` must reference valid user (enforced by FOREIGN KEY cascade delete)
- One user cannot have multiple admin records (enforced by UNIQUE constraint)
- Role must be a valid role string (currently limited to 'admin')

**State Transitions**:
- N/A - Admin role is assigned once per user

**Seeding**: Initial admin user is created via SQL migration during deployment.

---

### 3. Authentication State (Runtime)

**Description**: Represents the current session state for a logged-in user. Managed by Supabase Auth and exposed via React Context.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `user` | `User \| null` | Current authenticated user object (null if not logged in) |
| `session` | `Session \| null` | Current session with access token, refresh token, expiry |
| `loading` | `boolean` | Indicates if authentication state is being initialized |

**User Object Structure**:
```typescript
interface User {
  id: string          // UUID
  email: string       // User's email
  name: string        // User's display name (nullable)
  created_at: string  // ISO timestamp
}
```

**Session Object Structure**:
```typescript
interface Session {
  access_token: string   // JWT access token
  refresh_token: string  // Refresh token for token renewal
  expires_at: number    // Expiry timestamp
  user: User            // Associated user object
}
```

**Lifecycle**:
- **Created**: User successfully authenticates via Google OAuth
- **Updated**: Token refresh occurs automatically via Supabase
- **Destroyed**: User signs out, tokens invalidated

**Storage**: Managed by Supabase Auth in HTTP-only cookies (client-side), exposed via React Context.

---

### 4. Wizard State (Runtime)

**Description**: Represents the current state of the wizard navigation and placeholder data. This is a client-side state object managed by React Context.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `currentStep` | `number` | Currently active wizard step (0-6 for 7 steps) |
| `isAuthenticated` | `boolean` | Indicates if user is authenticated (derived from AuthContext) |
| `isLoading` | `boolean` | Indicates if wizard is loading data |
| `errors` | `Record<string, string>` | Validation errors by field name |
| `placeholders` | `object` | Placeholder data for UI rendering |

**Step Navigation Structure**:
```typescript
type WizardStep =
  | 0 // Pricing Model Selection
  | 1 // Service Selection
  | 2 // Experience Input
  | 3 // Geography Input
  | 4 // Costs Input
  | 5 // Risk & Profit Input
  | 6 // Live Results Review
```

**Placeholder Data Structure** (MVP - Step 0 only):
```typescript
interface WizardPlaceholders {
  steps: Array<{
    id: number
    title: string
    description: string
    completed: boolean
  }>
  preview: {
    message: string
    // Future: Service breakdown, calculations, etc.
  }
}
```

**State Transitions**:
- **Initialize**: User navigates to wizard page, state loads with step 0 active
- **Navigate**: User clicks next/previous, `currentStep` updates
- **Error**: Validation fails, error added to `errors` object
- **Complete**: User reaches final step, state ready for submission

**Storage**: Managed entirely client-side via React Context (no persistence to database in MVP).

---

## Database Schema (SQL)

### Migration 001: Initialize Schema

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
create policy "Admins can view all admin users"
  on public.admin_users for select
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Admins can insert admin users"
  on public.admin_users for insert
  with check (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Admins can update admin users"
  on public.admin_users for update
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Admins can delete admin users"
  on public.admin_users for delete
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );
```

### Migration 002: Seed Initial Admin User

```sql
-- Insert admin user (only if doesn't exist)
-- Uses environment variable ${ADMIN_EMAIL}
insert into public.admin_users (user_id, role)
select id, 'admin'
from auth.users
where email = lower('${ADMIN_EMAIL}')
  and not exists (
    select 1 from public.admin_users where user_id = auth.users.id
  );
```

---

## Row-Level Security (RLS) Summary

### Security Model

| Table | Read Access | Write Access | Admin Override |
|-------|-------------|---------------|----------------|
| `public.users` | Own record only | Own record only | All records |
| `public.admin_users` | Admin users only | Admin users only | All records |

### Access Patterns

**Regular User**:
- Can SELECT their own user record
- Can UPDATE their own user record (e.g., name changes)
- Cannot SELECT/UPDATE/INSERT/DELETE admin_users records
- Cannot see other users' data

**Admin User**:
- Can SELECT all users records
- Can SELECT/UPDATE/INSERT/DELETE all admin_users records
- Cannot DELETE other users' records (user isolation preserved)

### Enforcement

RLS policies are enforced at the database level via Supabase Auth session context (`auth.uid()`). Application code cannot bypass these policies.

---

## TypeScript Type Definitions

### Database Types (Generated from Supabase)

```typescript
// types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: number
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          role?: string
          created_at?: string
        }
      }
    }
  }
}
```

### Application Types

```typescript
// types/auth.ts
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
  loading: boolean
  signOut: () => Promise<void>
}
```

```typescript
// types/wizard.ts
export type WizardStep = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface WizardStepInfo {
  id: WizardStep
  title: string
  description: string
  completed: boolean
}

export interface WizardPreview {
  message: string
}

export interface WizardState {
  currentStep: WizardStep
  isAuthenticated: boolean
  isLoading: boolean
  errors: Record<string, string>
  placeholders: {
    steps: WizardStepInfo[]
    preview: WizardPreview
  }
}
```

---

## Data Flow Diagrams

### Google OAuth Authentication Flow

```
┌─────────┐
│  User   │
│  Login   │
└────┬────┘
     │ 1. Click "Sign in with Google"
     ▼
┌──────────────────┐
│  Google OAuth    │
│  Consent Screen  │
└────┬─────────────┘
     │ 2. User grants permission
     ▼
┌──────────────────┐
│  Google OAuth    │
│  Callback w/ Code│
└────┬─────────────┘
     │ 3. Redirect to /auth/callback
     ▼
┌──────────────────┐
│  Supabase Auth   │
│  Exchange Code    │
│  for Session      │
└────┬─────────────┘
     │ 4. Create/Update user in public.users
     ▼
┌──────────────────┐
│  Session Created  │
│  Cookie Set       │
└────┬─────────────┘
     │ 5. Redirect to /wizard
     ▼
┌──────────────────┐
│  Wizard Page     │
│  (Protected)     │
└──────────────────┘
```

### User State Management Flow

```
┌──────────────────────┐
│   AuthContext       │
│   (React Context)   │
└─────────┬──────────┘
          │
          │ 1. onAuthStateChange listener
          ▼
┌──────────────────────┐
│   Supabase Auth     │
│   Session Updates   │
└─────────┬──────────┘
          │
          │ 2. Session change (sign in/out/token refresh)
          ▼
┌──────────────────────┐
│   AuthContext       │
│   Updates State     │
│   (user, loading)  │
└─────────┬──────────┘
          │
          │ 3. Re-renders all consumers
          ▼
┌──────────────────────┐
│   Protected Pages   │
│   (Wizard, Admin)  │
└──────────────────────┘
```

---

## Indexes and Performance

### Recommended Indexes

```sql
-- Users table
create index idx_users_email on public.users(email);
create index idx_users_created_at on public.users(created_at);

-- Admin users table
create index idx_admin_users_user_id on public.admin_users(user_id);
create index idx_admin_users_role on public.admin_users(role);
```

**Rationale**:
- `email` index enables fast lookups for existing users
- `created_at` index supports analytics queries (for future use)
- `user_id` index accelerates RLS policy checks for admins
- `role` index supports admin filtering (for future multi-role support)

---

## Migration Strategy

### Initial Deployment

1. Run Migration 001 (`001_init_schema.sql`)
   - Creates tables
   - Enables RLS
   - Applies policies

2. Run Migration 002 (`002_seed_admin.sql`)
   - Seeds initial admin user
   - Idempotent (safe to re-run)

### Future Migrations

All schema changes must be versioned migrations:
- Create new migration file with incrementing number
- Run migration in all environments (dev → staging → production)
- Never modify existing migrations (create new ones instead)

---

## Compliance with Constitution

| Constitutional Principle | Data Model Compliance |
|------------------------|----------------------|
| I. Authentication-First | User data model supports Google OAuth only |
| II. Data Privacy & Analytics | User data stored for analytics only, no personal save |
| III. Monolithic Architecture | Single PostgreSQL database, no microservices |
| IV. Admin-Configured Pricing | Admin users table for role-based access (pricing config deferred) |
| V. MVP Incremental Development | Minimal data model for Phase 0 (no pricing data yet) |

---

## Summary

The data model consists of:
- **2 database tables**: `users` (extends Supabase Auth) and `admin_users` (role management)
- **Row-Level Security**: User isolation enforced at database level
- **2 runtime state objects**: AuthContext (authentication) and WizardContext (wizard navigation)
- **Constitutional compliance**: All principles upheld through database schema and RLS policies

This model provides the foundation for authentication, admin access, and wizard navigation while maintaining data privacy and user isolation as required by the constitution.
