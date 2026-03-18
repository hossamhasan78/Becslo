# API Contracts: MVP Authentication & Wizard Skeleton

**Feature**: MVP Authentication & Wizard Skeleton
**Date**: 2026-03-17
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines external interfaces exposed by the application, including API endpoints, authentication flows, and data contracts for the MVP authentication and wizard skeleton feature.

---

## Interface Categories

The application exposes three categories of interfaces:

1. **User Interfaces**: Browser-based UI for authentication and wizard
2. **Authentication Flows**: Email/password signup and login handlers and session management
3. **External Integrations**: Email/password provider (configured in Supabase)

---

## 1. User Interface Contracts

### 1.1 Login Page

**URL**: `/login`

**Purpose**: Entry point for users to authenticate via email/password.

**UI Elements**:

| Component | Type | Behavior |
|-----------|------|----------|
| Email/Password Login Form | Form | Accepts email and password, submits to auth API |
| Error Message Display | Text | Shows authentication errors if present |
| Loading Indicator | Spinner | Displays while authenticating |

**User Actions**:

| Action | Input | Output |
|---------|-------|--------|
| Submit Credentials | email, password | Authenticates user, redirects to wizard on success |
| View Error Page | Error parameter (URL query) | Display user-friendly error message |

**Response Times**:
- Page load: < 1 second
- Button click to redirect: < 500ms

---

### 1.2 Wizard Page

**URL**: `/wizard`

**Purpose**: Main wizard interface with two-panel layout (3/4 left, 1/4 right).

**Access Control**: Requires authenticated session (redirects to `/login` if not authenticated).

**UI Structure**:

```typescript
interface WizardLayout {
  leftPanel: {
    width: '75%'
    content: 'Step navigation + current step content'
  }
  rightPanel: {
    width: '25%'
    content: 'Live preview placeholder'
  }
}
```

**UI Elements**:

| Panel | Component | Type | Behavior |
|-------|-----------|------|----------|
| Left | Step Navigation | List | Shows 7 steps, highlights current step |
| Left | Step Content | Dynamic | Placeholder for current step (Step 0: Pricing Model) |
| Left | Next/Prev Buttons | Buttons | Navigate between steps (disabled in MVP) |
| Right | Preview Area | Text/Card | Displays "Live preview coming soon" message |
| Right | Summary Info | Text | Shows minimal info (current step name) |

**User Actions**:

| Action | Input | Output |
|---------|-------|--------|
| View Wizard | Authenticated session | Two-panel layout with Step 0 active |
| Click Next Button | None | No action (disabled in MVP) |
| Click Prev Button | None | No action (disabled in MVP) |

**Response Times**:
- Page load: < 2 seconds (Success Criterion SC-003)
- Layout render: < 100ms

---

### 1.3 Signup Page

**Purpose**: Entry point for users to register with email/password.

**Access Control**: Public endpoint (new user registration).

**Behavior**:

1. Receives signup form with name, email, password
2. Exchanges code for session with Supabase
3. Creates/updates user record in database
4. Sets session cookie
5. Redirects to `/wizard` on success or `/login` on failure

**Response**:
- Success: HTTP 302 redirect to `/wizard`
- Failure: HTTP 302 redirect to `/login?error=<type>`

---

## 2. Authentication Flow Contracts

### 2.1 Email/Password Authentication Flow

**Sequence Diagram**:

```
User          Browser         App              Supabase
  │              │                │                  │
  ├─ Enter credentials ──────────┤                  │
  │              ├─ POST /api/auth/login ───────────┤
  │              │               │  Verify credentials             │
  │              │               ├──────────────────>│
  │              │               │<──────────────────│
  │              │<─────────────┤                  │
  │  Redirect to wizard          │                  │
  │<─────────────│               │
  │  Wizard Page  │
```

**Credentials Required**:
- `email`: User's email address
- `password`: User's password (min 6 characters)

---

### 2.2 Session Management

**Session Storage**: HTTP-only cookies managed by Supabase Auth.

**Session Lifetime**:
- Access Token: 1 hour (configurable)
- Refresh Token: 30 days (configurable)
- Automatic token refresh handled by Supabase client

**Session State**:

| State | Description | User Impact |
|-------|-------------|--------------|
| Active | Valid session present | User can access protected routes |
| Expired | Access token expired | Auto-refreshed if refresh token valid |
| Invalid | Both tokens invalid | User redirected to `/login` |

---

## 3. External Integration Contracts

### 3.1 Email/Password Provider

**Integration Type**: Email/Password Authentication with Supabase Auth

**Configuration**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Configuration | Type | Required | Description |
|---------------|------|----------|-------------|
| Email Provider | Provider | Yes | Enabled in Supabase Dashboard |
| Supabase URL | string | Yes | Your Supabase project URL |
| Supabase Anon Key | string | Yes | Your Supabase anon key |
| Redirect URI | string | Yes | Application callback URL |
| Scopes | array | Yes | `profile`, `email` |

**Provider**: Supabase Auth (manages email/password flow internally)

**Failure Modes**:

| Error | Handling |
|-------|-----------|
| Network timeout | Display error message, retry button |
| User denies permission | Show specific error, return to login |
| Invalid credentials | Show system error, contact admin |
| Provider outage | Display maintenance message |

---

## 4. Data Exchange Contracts

### 4.1 User Profile Data

**Direction**: Application → Supabase Auth → Database

**Data Contract**:

```typescript
interface UserProfile {
  id: string           // UUID (from Supabase Auth)
  email: string        // User's email address
  name: string | null  // User's display name (nullable)
  avatar_url?: string   // Profile image URL (optional, not stored in MVP)
  // Sign up with email/password
  const { data, error } = await supabase.auth.signUp({
    email: 'user@example.com',
    password: 'password123',
    options: {
      data: {
        name: 'John Doe'
      }
    }
  })

  // Or sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'password123'
  })
  created_at: string    // ISO timestamp
}
```

**Validation Rules**:
- `email`: Must be valid email format
- `name`: Can be null, max 255 chars if present
- `provider`: Must be 'google' (constitution requirement)

---

### 4.2 Admin User Data

**Direction**: Application → Database (via migration)

**Data Contract**:

```typescript
interface AdminUser {
  id: number           // Auto-increment (from database)
  user_id: string      // UUID (references users.id)
  role: 'admin'        // Role designation
  created_at: string    // ISO timestamp
}
```

**Validation Rules**:
- `user_id`: Must reference valid user in `public.users`
- `role`: Must be 'admin' (enforced by constraint)

---

### 4.3 Authentication State (Runtime)

**Direction**: Supabase Auth → React Context → UI Components

**Data Contract**:

```typescript
interface AuthState {
  user: User | null          // Current user (null if not authenticated)
  session: Session | null    // Current session (null if not authenticated)
  loading: boolean           // True while initializing
}

interface User {
  id: string
  email: string
  name: string | null
  created_at: string
}

interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}
```

**Update Frequency**: Real-time via Supabase Auth state change listener.

---

### 4.4 Wizard State (Runtime)

**Direction**: User Interaction → React Context → UI Components

**Data Contract**:

```typescript
interface WizardState {
  currentStep: 0 | 1 | 2 | 3 | 4 | 5 | 6    // Current wizard step
  isAuthenticated: boolean                  // Derived from AuthContext
  isLoading: boolean                      // Loading state
  errors: Record<string, string>           // Validation errors
  placeholders: {
    steps: Array<{
      id: number
      title: string
      description: string
      completed: boolean
    }>
    preview: {
      message: string                     // "Live preview coming soon"
    }
  }
}
```

**Update Frequency**: On user action (navigation, input).

---

## 5. Error Handling Contracts

### 5.1 Error Response Format

**Client-Side Errors** (displayed to user):

| Error Type | HTTP Status | User Message |
|------------|--------------|--------------|
| Invalid Credentials | 401 | "Invalid email or password. Please try again." | User enters wrong email/password |
| User Already Exists | 400 | "An account with this email already exists." | User tries to sign up with existing email |
| Weak Password | 400 | "Password must be at least 6 characters." | Password less than 6 characters |
| Session Expired | 401 (redirect) | Redirect to login page (auto-handled by middleware) |

**Server-Side Errors** (logged, generic message to user):

| Error Type | HTTP Status | User Message | Logging |
|------------|--------------|--------------|----------|
| Database Connection Error | 500 | "An error occurred. Please try again later." | Error with stack trace |
| Auth Configuration Error | 500 | "Authentication system is temporarily unavailable." | Error with stack trace |
| Admin User Already Exists | 200 | N/A (idempotent) | Warning |
| RLS Policy Violation | 403 | "You don't have permission to access this resource." | Error with user ID |

---

## 6. Performance Contracts

### 6.1 Response Time Targets

| Endpoint/Component | Target | Success Criterion |
|-------------------|---------|-------------------|
| Login page load | < 1 second | - |
| OAuth callback → Redirect | < 2 seconds | Part of 30s auth flow (SC-001) |
| Wizard page load | < 2 seconds | Success Criterion SC-003 |
| Protected route middleware check | < 100ms | - |
| State update (AuthContext) | < 50ms | - |

### 6.2 Availability Targets

| Component | Target |
|-----------|---------|
| Authentication Service | 99% uptime |
| Database | 99.9% uptime (Supabase) |
| Application | 99% uptime (Vercel) |

---

## 7. Security Contracts

### 7.1 Authentication Security

**Requirements**:

| Requirement | Implementation |
|-------------|----------------|
| HTTPS Required | Enforced by Vercel (SSL certificates) |
| HTTP-Only Cookies | Managed by Supabase Auth |
| Secure Token Storage | Tokens in cookies, never in localStorage |
| CSRF Protection | Supabase Auth includes CSRF tokens |
| Session Expiry | Tokens expire automatically, refresh on valid refresh token |

### 7.2 Authorization Security

**Requirements**:

| Requirement | Implementation |
|-------------|----------------|
| Route Protection | Middleware verifies session before allowing access |
| Database Access Control | Row-Level Security (RLS) policies enforce data isolation |
| Admin Access | Role-based via `admin_users` table |

### 7.3 Data Privacy

**Requirements**:

| Requirement | Implementation |
|-------------|----------------|
| User Data Isolation | RLS policies prevent cross-user data access |
| Admin Analytics Only | User data stored for analytics, not personal save (Constitution II) |
| GDPR Compliance | Data can be deleted on request (future feature) |
| Minimal Data Collection | Only email and name collected (no personal save) |

---

## 8. Testing Contracts

### 8.1 Test Scenarios

**Authentication Flow**:

1. **Happy Path**: User clicks Google login → Grants permission → Redirected to wizard
2. **Permission Denied**: User denies permission → Redirected to login with error
3. **Network Failure**: Network error during login → Error message shown
4. **Invalid Token**: Session expires → Auto-refresh or redirect to login

**Route Protection**:

1. **Unauthenticated Access**: User tries to access `/wizard` without session → Redirect to `/login`
2. **Authenticated Access**: User with session accesses `/wizard` → Success
3. **Admin Access**: Admin user accesses `/admin` → Success (future feature)
4. **Non-Admin Admin Access**: Regular user tries to access `/admin` → Redirect to login

**Wizard Layout**:

1. **Layout Display**: Authenticated user accesses `/wizard` → Two-panel layout shown
2. **Responsive**: Layout adapts to mobile (stacked panels)
3. **Step Navigation**: Step 0 active, 6 other steps shown

---

## 9. Versioning and Deprecation

### 9.1 API Versioning

**Strategy**: URL-based versioning for future breaking changes

- Current version: No version prefix (v1 implied)
- Future breaking changes: `/v2/auth/callback`, etc.

**Backward Compatibility**:
- Auth API routes will remain stable
- Session management unchanged in v1
- Wizard page structure backward compatible for v1 clients

### 9.2 Deprecation Policy

**Notice Period**: Minimum 30 days before deprecating any public interface

**Migration Path**:
- Provide clear migration documentation
- Update wizard UI to guide users
- Graceful degradation during transition

---

## Summary of External Interfaces

| Interface | Type | Purpose | Access Control |
|------------|------|---------|----------------|
| `/login` | UI | Entry point for authentication | Public |
| `/wizard` | UI | Main wizard interface | Authenticated only |
| `/api/auth/signup` | API Route | Create new user account | Public |
| `/api/auth/login` | API Route | Authenticate user | Public |
| Email/Password | External Integration | Email/password provider | Configured in Supabase |
| Supabase Auth | External Service | Session management | Managed by Supabase |

All interfaces comply with constitutional requirements:
- Email/password only (Principle I)
- Monolithic NextJS application (Principle III)
- User data for analytics only (Principle II)
- Authentication-first development (Principle V)
