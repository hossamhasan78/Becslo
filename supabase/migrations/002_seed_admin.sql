-- Migration: 002_seed_admin.sql
-- Description: Seed initial admin user
-- Created: 2026-03-18
-- Purpose: Create admin user for MVP

-- Function to upsert admin user (idempotent)
CREATE OR REPLACE FUNCTION public.seed_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_email TEXT := COALESCE(
    current_setting('app.admin_email', true),
    'admin@yourdomain.com'
  );
  admin_user_id UUID;
BEGIN
  -- Get user ID from auth.users if exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = admin_email;

  IF admin_user_id IS NOT NULL THEN
    -- Insert or update admin_users table (idempotent)
    INSERT INTO public.admin_users (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET
      role = EXCLUDED.role,
      created_at = NOW();
  END IF;
END;
$$;

-- Note: This function should be called after the admin user signs up
-- Run: SELECT public.seed_admin_user();
