-- Migration: 009_fix_services_admin_rls.sql
-- Description: Fix RLS policy for services - admins can view all services
-- Created: 2026-03-22

-- Drop the existing restrictive SELECT policy
drop policy if exists "Anyone can view active services" on public.services;

-- Create new policy: Everyone can view active services
create policy "Anyone can view active services"
  on public.services for select
  using (is_active = true);

-- Create new policy: Admins can view all services
create policy "Admins can view all services"
  on public.services for select
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );
