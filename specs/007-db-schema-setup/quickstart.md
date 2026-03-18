# Quick Start Guide: Database & Configuration Setup

**Feature**: Database & Configuration Setup
**Date**: 2026-03-18
**Target Audience**: Developers implementing this feature

## Overview

This guide provides instructions for setting up the database schema, seeding initial data, and testing API endpoints.

---

## Prerequisites

### Required Software

- Node.js 18+
- Supabase CLI
- Git

### Environment Variables

Ensure `.env.local` contains:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## Step 1: Run Database Migrations

### Local Development

```bash
# Start local Supabase
npx supabase start

# Push migrations
npx supabase db push --local
```

### Verify Migration

Check that all tables exist:

```bash
npx supabase db query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" --local
```

Expected tables:
- users (extended from auth.users)
- admin_users
- services
- categories
- countries
- calculations
- calculation_services
- costs
- config

---

## Step 2: Verify Seed Data

### Check Categories

```bash
npx supabase db query "SELECT * FROM categories ORDER BY display_order;" --local
```

Expected: 3-5 categories

### Check Services

```bash
npx supabase db query "SELECT COUNT(*) as count FROM services WHERE is_active = true;" --local
```

Expected: 120+ services

### Check Countries

```bash
npx supabase db query "SELECT COUNT(*) as count FROM countries;" --local
```

Expected: ~200 countries

### Check Config

```bash
npx supabase db query "SELECT * FROM config;" --local
```

Expected: 1 record with base_rate, multiplier ranges

---

## Step 3: Test API Endpoints

### Start Development Server

```bash
npm run dev
```

### Test Endpoints

```bash
# Services (with category filter)
curl http://localhost:3000/api/v1/services

# Categories
curl http://localhost:3000/api/v1/categories

# Countries
curl http://localhost:3000/api/v1/countries

# Costs
curl http://localhost:3000/api/v1/costs

# Config
curl http://localhost:3000/api/v1/config
```

---

## Step 4: Verify Row-Level Security

### Test User Isolation

1. Create two users via signup
2. User A creates a calculation
3. User B queries calculations - should only see their own

### Test Admin Access

1. Log in as admin user
2. Query all calculations - should see all users' data

---

## Troubleshooting

### Migration Fails

**Issue**: Tables already exist
**Solution**: Reset database first: `npx supabase db reset --local`

### Seed Data Missing

**Issue**: Categories/services/countries not populated
**Solution**: Check migration includes seed data INSERT statements

### API Returns 401

**Issue**: Not authenticated
**Solution**: Include session token in request header

---

## Next Steps

After completing this setup:
1. Proceed to Phase 2: Core Pricing Engine
2. Implement pricing calculation logic
3. Integrate with wizard flow
