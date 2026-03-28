# Data Model: Persistent Application Header

**Branch**: `022-persistent-app-header`
**Date**: 2026-03-28

---

## Overview

This feature introduces no new data entities, database tables, or API endpoints. All data used by the header is sourced from the existing authenticated session already available globally in the application.

---

## Consumed Existing Data

### User (from auth session — read only)

| Field | Source | Usage in header |
|-------|--------|-----------------|
| `user.email` | Supabase auth session | Displayed as identity fallback if no display name |
| `user.user_metadata.full_name` | Supabase user metadata | Displayed as preferred identity label |

**Display priority**: `full_name` → `email` → `'Account'` (static fallback)

No new fields are added to the user record. No writes to auth data.

---

## Header UI State (in-component only, not persisted)

| State field | Type | Purpose |
|-------------|------|---------|
| `isLoggingOut` | boolean | Disables logout button and shows spinner during logout request |
| `logoutError` | string \| null | Holds inline error message if logout fails; null when idle |

These are ephemeral component-level states — they reset on unmount and are never stored in context, session, or any external system.

---

## No Contracts Required

The header calls the existing `POST /api/auth/logout` endpoint. No new API surface is introduced. No contracts directory is needed.
