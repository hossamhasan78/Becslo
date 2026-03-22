# Phase 1: Data Model - Admin Dashboard & Analytics

**Feature**: Admin Dashboard & Analytics
**Date**: 2026-03-22
**Status**: Complete

## Overview

This document defines the data model for the admin dashboard and analytics feature. The model extends the existing database schema from Phase 1 with new tables and relationships specific to admin operations. All entities follow the existing Supabase PostgreSQL structure with Row-Level Security (RLS).

## Entity Definitions

### Admin User

**Description**: Represents users with administrative privileges who can access the admin dashboard.

**Table**: `admin_users` (existing from Phase 1)

**Fields**:
- `user_id` (UUID, primary key, references `users.id`) - Link to user account
- `role` (text) - User role, values: 'admin', 'super_admin' (if needed)
- `created_at` (timestamptz, default now()) - Record creation timestamp

**Relationships**:
- One-to-one with `users` table via `user_id`

**Validation Rules**:
- `user_id` must exist in `users` table
- `role` must be one of allowed values
- Each user can have at most one admin role record

**State Transitions**:
- None (admin role is assigned/revoked via direct table operations)

**RLS Policies**:
- Admin users can read all admin_users records
- Regular users cannot read any admin_users records
- Only super_admin (if exists) can insert/update admin_users

---

### Service

**Description**: Represents a type of service users can select for pricing calculation.

**Table**: `services` (existing from Phase 1)

**Fields**:
- `id` (UUID, primary key) - Unique identifier
- `name` (text, not null) - Service name
- `category` (text, not null) - Service category (e.g., "Strategy & Research", "Design & UI")
- `default_hours` (numeric, not null, >= 0) - Default hours for this service
- `min_hours` (numeric, not null, >= 0) - Minimum allowable hours
- `max_hours` (numeric, not null, >= min_hours) - Maximum allowable hours
- `is_active` (boolean, default true) - Whether service is available for users
- `created_at` (timestamptz, default now()) - Record creation timestamp
- `updated_at` (timestamptz) - Last update timestamp

**Relationships**:
- One-to-many with `calculation_services` via `id`

**Validation Rules**:
- `name` must not be empty
- `category` must not be empty
- `default_hours` must be between `min_hours` and `max_hours`
- `min_hours` must be >= 0
- `max_hours` must be >= `min_hours`
- `is_active` defaults to true for new services

**State Transitions**:
- Active → Inactive: Via admin deactivate operation
- Inactive → Active: Via admin activate operation
- Cannot delete if used in any calculation (enforced by application logic per FR-007A)

**RLS Policies**:
- Admin users can read, insert, update all services
- Regular users can only read services where `is_active = true`
- No user can delete services (deletion handled via `is_active` flag)

**Indexes**:
- Primary key on `id`
- Partial index on `id` where `is_active = true` for active services queries
- Index on `category` for category filtering

---

### Configuration

**Description**: Represents pricing parameters that can be adjusted by admin.

**Table**: `config` (existing from Phase 1)

**Fields**:
- `id` (UUID, primary key) - Unique identifier (should be single record)
- `base_rate` (numeric, not null, > 0) - Base hourly rate in USD
- `risk_buffer_min` (numeric, not null, >= 0, <= 50) - Minimum risk buffer percentage
- `risk_buffer_max` (numeric, not null, >= risk_buffer_min, <= 50) - Maximum risk buffer percentage
- `profit_margin_min` (numeric, not null, >= 10, <= 50) - Minimum profit margin percentage
- `profit_margin_max` (numeric, not null, >= profit_margin_min, <= 50) - Maximum profit margin percentage
- `version` (integer, default 1) - Version for optimistic locking
- `updated_at` (timestamptz) - Last update timestamp
- `updated_by` (UUID, references `users.id`) - Admin user who last updated

**Relationships**:
- Many-to-one with `users` via `updated_by`

**Validation Rules**:
- Only one configuration record should exist (enforced by application)
- `base_rate` must be > 0
- `risk_buffer_min` must be >= 0 and <= 50
- `risk_buffer_max` must be >= `risk_buffer_min` and <= 50
- `profit_margin_min` must be >= 10 and <= 50
- `profit_margin_max` must be >= `profit_margin_min` and <= 50
- `version` increments on each update (optimistic locking)

**State Transitions**:
- Updated via admin configuration editor
- Version increments on each successful update
- Concurrent updates detected via version check

**RLS Policies**:
- Admin users can read and update configuration
- Regular users can only read configuration (for calculation purposes)
- No user can insert or delete configuration records

**Indexes**:
- Primary key on `id`

---

### Calculation

**Description**: Represents a completed pricing calculation with user data.

**Table**: `calculations` (existing from Phase 1)

**Fields**:
- `id` (UUID, primary key) - Unique identifier
- `user_id` (UUID, references `users.id`, not null) - User who created calculation
- `user_name` (text, not null) - User name (for analytics per Constitution II)
- `user_email` (text, not null) - User email (for analytics per Constitution II)
- `pricing_model` (text, not null) - Pricing model type
- `experience_designer` (numeric, not null, 1-10) - Designer experience level
- `experience_freelance` (numeric, not null, 1-10) - Freelance experience level
- `designer_country_id` (UUID, references `countries.id`, not null) - Designer country
- `client_country_id` (UUID, references `countries.id`, not null) - Client country
- `total_hours` (numeric, not null, >= 0) - Total hours across all services
- `subtotal` (numeric, not null, >= 0) - Base cost before risk and profit
- `risk_buffer` (numeric, not null, >= 0) - Risk buffer amount
- `profit_margin` (numeric, not null, >= 0) - Profit margin amount
- `final_price` (numeric, not null, >= 0, rounded to nearest dollar) - Final calculated price
- `recommended_min` (numeric, not null, >= 0) - Recommended minimum price
- `recommended_max` (numeric, not null, >= 0) - Recommended maximum price
- `created_at` (timestamptz, default now()) - Calculation creation timestamp

**Relationships**:
- Many-to-one with `users` via `user_id`
- Many-to-one with `countries` via `designer_country_id` and `client_country_id`
- One-to-many with `calculation_services` via `id`

**Validation Rules**:
- `user_id` must exist in `users` table
- `experience_designer` and `experience_freelance` must be between 1 and 10
- `total_hours` must be sum of hours from `calculation_services`
- `final_price` must be rounded to nearest dollar (Constitution requirement)
- `recommended_min` and `recommended_max` are 20% below/above final_price
- All monetary values must be non-negative

**State Transitions**:
- Created when user completes wizard and saves calculation
- Read-only after creation (immutable per Constitution II - no personal save/edit)
- Used for analytics and admin inspection

**RLS Policies**:
- Admin users can read all calculations
- Regular users can only read their own calculations (via `user_id`)
- No user can update or delete calculations (immutable)

**Indexes**:
- Primary key on `id`
- Index on `created_at DESC` for date range filtering (critical for analytics)
- Index on `client_country_id` for top countries query
- Index on `user_id` for user-specific queries
- Composite index on (`created_at`, `client_country_id`) for analytics queries

---

### Calculation Services

**Description**: Represents services included in a calculation with their hours and costs.

**Table**: `calculation_services` (existing from Phase 1)

**Fields**:
- `id` (UUID, primary key) - Unique identifier
- `calculation_id` (UUID, references `calculations.id`, not null) - Parent calculation
- `service_id` (UUID, references `services.id`, not null) - Service used
- `hours` (numeric, not null, >= 0) - Hours for this service
- `adjusted_rate` (numeric, not null, > 0) - Rate after multipliers
- `cost` (numeric, not null, >= 0) - Total cost (hours × adjusted_rate)
- `created_at` (timestamptz, default now()) - Record creation timestamp

**Relationships**:
- Many-to-one with `calculations` via `calculation_id`
- Many-to-one with `services` via `service_id`

**Validation Rules**:
- `calculation_id` must exist in `calculations` table
- `service_id` must exist in `services` table
- `hours` must be between service's `min_hours` and `max_hours`
- `adjusted_rate` calculated from base_rate × multipliers
- `cost` must equal `hours × adjusted_rate`

**State Transitions**:
- Created with parent calculation
- Read-only after creation (immutable with parent calculation)

**RLS Policies**:
- Admin users can read all calculation_services
- Regular users can only read calculation_services for their own calculations
- No user can insert, update, or delete calculation_services (handled via parent calculation)

**Indexes**:
- Primary key on `id`
- Index on `calculation_id` for parent calculation queries
- Index on `service_id` for most used services query (critical for analytics)
- Composite index on (`service_id`, `created_at`) for service usage analytics

---

### Country

**Description**: Represents a country with geography multiplier for pricing calculations.

**Table**: `countries` (existing from Phase 1)

**Fields**:
- `id` (UUID, primary key) - Unique identifier
- `name` (text, not null) - Country name
- `code` (text, unique, not null) - Country code (e.g., "US", "UK")
- `multiplier` (numeric, not null, > 0) - Geography multiplier
- `created_at` (timestamptz, default now()) - Record creation timestamp

**Relationships**:
- One-to-many with `calculations` via `designer_country_id` and `client_country_id`

**Validation Rules**:
- `name` must not be empty
- `code` must be unique and standard country code
- `multiplier` must be > 0 (typically 0.5 to 2.0 range)

**State Transitions**:
- Updated via admin configuration editor (if geography multipliers are configurable)
- Otherwise, seeded and relatively static

**RLS Policies**:
- All authenticated users can read countries (needed for wizard)
- Admin users can update country multipliers
- Regular users cannot insert, update, or delete countries

**Indexes**:
- Primary key on `id`
- Unique index on `code`

---

### Category

**Description**: Represents service categories for organizing services.

**Table**: `categories` (existing from Phase 1)

**Fields**:
- `id` (UUID, primary key) - Unique identifier
- `name` (text, not null) - Category name
- `display_order` (integer, not null) - Display order in UI
- `created_at` (timestamptz, default now()) - Record creation timestamp

**Relationships**:
- One-to-many with `services` via `services.category` (though not foreign key, can add)

**Validation Rules**:
- `name` must not be empty
- `display_order` must be unique and >= 0

**State Transitions**:
- Created via seeding or admin operations
- Updated via admin operations

**RLS Policies**:
- All authenticated users can read categories
- Admin users can insert, update, delete categories
- Regular users cannot insert, update, or delete categories

**Indexes**:
- Primary key on `id`
- Index on `display_order` for sorting

---

### User

**Description**: Represents application users (from Supabase Auth).

**Table**: `users` (existing from Phase 1, managed by Supabase Auth)

**Fields**:
- `id` (UUID, primary key) - Unique identifier (from Supabase Auth)
- `email` (text, unique, not null) - User email
- `name` (text) - User name
- `created_at` (timestamptz, default now()) - Account creation timestamp

**Relationships**:
- One-to-one with `admin_users` via `id`
- One-to-many with `calculations` via `id`

**Validation Rules**:
- Managed by Supabase Auth
- `email` must be unique

**State Transitions**:
- Managed by Supabase Auth (signup, login, logout)
- Admin role assigned via `admin_users` table

**RLS Policies**:
- Admin users can read all users
- Regular users can only read their own user record
- No user can insert or delete users (managed by Supabase Auth)

**Indexes**:
- Primary key on `id`
- Unique index on `email`

---

### Cost

**Description**: Represents overhead costs that can be added to calculations.

**Table**: `costs` (existing from Phase 1)

**Fields**:
- `id` (UUID, primary key) - Unique identifier
- `name` (text, not null) - Cost name
- `is_active` (boolean, default true) - Whether cost is available
- `default_cost` (numeric, not null, >= 0) - Default cost amount
- `created_at` (timestamptz, default now()) - Record creation timestamp

**Relationships**:
- Junction table to calculations (if costs are selected per calculation)

**Validation Rules**:
- `name` must not be empty
- `default_cost` must be >= 0

**State Transitions**:
- Activated/deactivated via admin operations
- Updated via admin operations

**RLS Policies**:
- Admin users can read, insert, update all costs
- Regular users can only read active costs
- No user can delete costs (handled via `is_active` flag)

**Indexes**:
- Primary key on `id`
- Partial index on `id` where `is_active = true` for active costs queries

---

## Database Indexing Summary

### Critical Indexes for Analytics Performance

1. **calculations.created_at** (DESC) - Date range filtering for analytics and calculations viewer
2. **calculation_services.service_id** - "Most used services" query
3. **calculations.client_country_id** - "Top client countries" query
4. **calculation_services(calculation_id, created_at)** - Service usage over time
5. **services.id** partial index WHERE is_active = true - Active services filtering

### Secondary Indexes

1. **calculations.user_id** - User-specific queries
2. **services.category** - Category filtering
3. **countries.code** (unique) - Country code lookups
4. **categories.display_order** - Category sorting

## Data Migration Strategy

No schema migrations required for this feature as all tables exist from Phase 1. Only application-level logic and RLS policies need to be updated.

## Privacy & Security Considerations

### User Data Access (Constitution II Compliance)
- Admin users can view user name and email in calculation details for analytics
- Regular users cannot access other users' data (RLS enforced)
- User data stored only for admin analytics, not for personal save functionality

### Role-Based Access Control
- Admin role determined via `admin_users` table
- All admin operations verify admin role in middleware and API routes
- Database-level RLS provides additional security layer

### Data Retention
- Calculations retained indefinitely for analytics (no personal save feature in MVP)
- Services and configuration changes tracked via timestamps
- Version column in config table enables audit trail

## Performance Targets

- Analytics queries: <3 seconds for up to 10,000 calculations
- Pagination: <2 seconds per page for 25 items
- Configuration updates: <5 seconds to apply to new calculations
- Service CRUD operations: <30 seconds per operation (SC-001)
