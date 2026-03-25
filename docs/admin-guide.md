# Becslo Admin User Setup Guide

**Purpose**: Step-by-step guide for setting up and managing admin users  
**Last Updated**: 2026-03-24  
**Feature**: Phase 5 - User Story 3

---

## Overview

Becslo supports two user roles:
1. **Regular Users** - Can create pricing calculations via the wizard
2. **Admin Users** - Full access to analytics, configuration, and user data

This guide covers how to:
- Create admin users
- Manage admin permissions
- Access the admin dashboard

---

## Prerequisites

Before setting up admin users, ensure:
- [ ] Supabase project is configured
- [ ] Database migrations have been applied
- [ ] At least one admin user account exists

---

## Creating Admin Users

### Method 1: Via Supabase Dashboard (Recommended)

1. **Navigate to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your Becslo project
   - Click on **Authentication** → **Users**

2. **Create or Update User**
   - Find the user you want to make an admin
   - Click on the user to view details
   - Note the user's `id` (UUID)

3. **Set Admin Role via Database**
   - Go to **SQL Editor** in Supabase
   - Run the following SQL to promote a user to admin:
   ```sql
   -- Replace 'USER_UUID_HERE' with the actual user ID
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('USER_UUID_HERE', 'admin')
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
   ```

4. **Verify the Role**
   ```sql
   SELECT * FROM public.user_roles WHERE user_id = 'USER_UUID_HERE';
   ```

### Method 2: Via Seed Script (Initial Setup)

For initial deployment, admin users can be seeded:

1. Edit `supabase/migrations/002_seed_admin.sql`
2. Add the admin user's email:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   SELECT id, 'admin'
   FROM auth.users 
   WHERE email = 'your-admin-email@example.com';
   ```

3. Run the migration:
   ```bash
   supabase db push
   ```

---

## Accessing the Admin Dashboard

### URL
The admin dashboard is available at: `https://becslo.vercel.app/admin`

### Login Requirements
- Only users with `admin` role can access the dashboard
- Regular users will be redirected to the wizard if they try to access `/admin`

### First-Time Admin Login
1. Log in with your admin account credentials
2. You will be automatically redirected to `/admin` dashboard
3. If not redirected, navigate to `/admin` manually

---

## Admin Dashboard Features

### 1. Main Dashboard (`/admin`)

**Purpose**: Overview of system status and quick access to features

**Features**:
- Quick stats (total users, total calculations, revenue metrics)
- Navigation to other admin sections

---

### 2. Calculations Viewer (`/admin/calculations`)

**Purpose**: View all user calculations

**Features**:
- List of all calculations with timestamps
- Filter by date range
- Filter by user
- View calculation details

**How to Use**:
1. Navigate to `/admin/calculations`
2. Browse the list of calculations
3. Click on any calculation to view details
4. Use filters to find specific calculations

---

### 3. Calculation Details (`/admin/calculations/[id]`)

**Purpose**: View detailed breakdown of a single calculation

**Features**:
- Complete input parameters (services, experience, geography, costs)
- Calculated prices and multipliers
- Risk buffer and profit margin applied

---

### 4. Analytics Dashboard (`/admin/analytics`)

**Purpose**: Business intelligence and usage analytics

**Features**:
- Revenue trends over time
- Popular services (most frequently selected)
- User activity metrics
- Geographic distribution of users
- Average calculation values

---

### 5. Configuration Editor (`/admin/config`)

**Purpose**: Manage application settings

**Features**:
- Edit base rate
- Configure risk buffer range (min/max)
- Configure profit margin range (min/max)

**Important Notes**:
- Changes take effect immediately for new calculations
- Existing calculations retain their original values
- Audit trail of configuration changes is stored

---

### 6. Services Management (`/admin/services`)

**Purpose**: Manage available services

**Features**:
- View all services
- Add new services
- Edit existing services
- Toggle service active status
- Set base rates per service

**Service Fields**:
- `name` - Display name
- `category` - Service category
- `default_hours` - Default hours for estimation
- `min_hours` / `max_hours` - Valid hours range
- `base_rate` - Hourly rate in USD

---

## Role-Based Access Control (RBAC)

### User Roles

| Role | Access Level | Description |
|------|--------------|-------------|
| `user` | Basic | Can use wizard, create calculations |
| `admin` | Full | Full dashboard access + user management |

### Adding Roles via SQL

```sql
-- Grant admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID', 'admin');

-- Revoke admin role (set back to user)
UPDATE public.user_roles 
SET role = 'user' 
WHERE user_id = 'USER_ID';
```

### Verifying User Roles

```sql
-- List all admins
SELECT u.email, ur.role, ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role = 'admin';

-- Check specific user role
SELECT * FROM public.user_roles WHERE user_id = 'USER_ID';
```

---

## Troubleshooting

### Issue: "Access Denied" when visiting /admin

**Cause**: User doesn't have admin role

**Solution**:
1. Verify user exists in auth.users
2. Run SQL to check user_roles table:
   ```sql
   SELECT * FROM public.user_roles WHERE user_id = 'YOUR_USER_ID';
   ```
3. If no record, insert admin role:
   ```sql
   INSERT INTO public.user_roles (user_id, role) 
   VALUES ('YOUR_USER_ID', 'admin');
   ```

### Issue: Admin Dashboard not loading

**Cause**: Database migration not applied

**Solution**:
1. Check Supabase dashboard for migrations
2. Apply pending migrations:
   ```bash
   supabase db push
   ```

### Issue: Can't see all calculations

**Cause**: RLS policies may be blocking

**Solution**:
1. Verify admin has correct RLS exemptions
2. Check SQL for admin bypass in RLS policies

---

## Security Best Practices

### Admin Account Security
- Use strong, unique passwords
- Enable two-factor authentication in Supabase
- Limit admin accounts to essential personnel only

### Access Control
- Regularly audit admin user list
- Remove admin access when no longer needed
- Use separate admin accounts for different administrators

### Monitoring
- Review audit logs regularly
- Set up alerts for suspicious activity
- Monitor calculation volumes for anomalies

---

## API Reference

### Admin API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/calculations` | List all calculations (admin) |
| GET | `/api/v1/admin/calculations/[id]` | Get calculation details |
| GET | `/api/v1/admin/analytics` | Get analytics data |
| GET | `/api/v1/admin/config` | Get current configuration |
| PUT | `/api/v1/admin/config` | Update configuration |
| GET | `/api/v1/admin/services` | List all services |
| POST | `/api/v1/admin/services` | Create new service |
| PUT | `/api/v1/admin/services/[id]` | Update service |
| DELETE | `/api/v1/admin/services/[id]` | Delete service |

---

## Quick Reference

### Common SQL Commands

```sql
-- List all admin users
SELECT u.email, ur.role FROM public.user_roles ur 
JOIN auth.users u ON ur.user_id = u.id 
WHERE ur.role = 'admin';

-- Add new admin
INSERT INTO public.user_roles (user_id, role) 
VALUES ('USER_ID', 'admin');

-- Remove admin
DELETE FROM public.user_roles WHERE user_id = 'USER_ID';
```

### Useful URLs

| Page | URL |
|------|-----|
| Main App | https://becslo.vercel.app |
| Admin Dashboard | https://becslo.vercel.app/admin |
| Supabase Dashboard | https://supabase.com/dashboard |

---

## Document Version

- **Version**: 1.0.0
- **Last Updated**: 2026-03-24
- **Related Docs**:
  - `deployment-checklist.md` - Production deployment guide
  - `api-documentation.md` - API endpoint documentation
  - `quickstart.md` - User quick start guide