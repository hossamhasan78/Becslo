-- Migration: 005_enable_rls.sql
-- Description: Enable Row-Level Security and create policies for user data isolation
-- Created: 2026-03-18
-- Purpose: Database & Configuration Setup - User data protection

-- Enable RLS on all new tables
alter table public.categories enable row level security;
alter table public.services enable row level security;
alter table public.countries enable row level security;
alter table public.calculations enable row level security;
alter table public.calculation_services enable row level security;
alter table public.costs enable row level security;
alter table public.config enable row level security;

-- Categories: Everyone can read, only admins can modify
create policy "Anyone can view categories"
  on public.categories for select
  using (true);

create policy "Admins can manage categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

-- Services: Everyone can read active services, only admins can modify
create policy "Anyone can view active services"
  on public.services for select
  using (is_active = true);

create policy "Admins can manage services"
  on public.services for all
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

-- Countries: Everyone can read, only admins can modify
create policy "Anyone can view countries"
  on public.countries for select
  using (true);

create policy "Admins can manage countries"
  on public.countries for all
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

-- Calculations: Users can only see their own calculations, admins can see all
create policy "Users can view own calculations"
  on public.calculations for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Users can insert their own calculations"
  on public.calculations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own calculations"
  on public.calculations for update
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Users can delete own calculations"
  on public.calculations for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

-- Calculation Services: Users can only see their own line items via calculations
create policy "Users can view own calculation services"
  on public.calculation_services for select
  using (
    exists (
      select 1 from public.calculations
      where calculations.id = calculation_services.calculation_id
      and (calculations.user_id = auth.uid()
        or exists (
          select 1 from public.admin_users
          where admin_users.user_id = auth.uid()
        ))
    )
  );

create policy "Users can insert own calculation services"
  on public.calculation_services for insert
  with check (
    exists (
      select 1 from public.calculations
      where calculations.id = calculation_services.calculation_id
      and calculations.user_id = auth.uid()
    )
  );

create policy "Users can update own calculation services"
  on public.calculation_services for update
  using (
    exists (
      select 1 from public.calculations
      where calculations.id = calculation_services.calculation_id
      and (calculations.user_id = auth.uid()
        or exists (
          select 1 from public.admin_users
          where admin_users.user_id = auth.uid()
        ))
    )
  );

create policy "Users can delete own calculation services"
  on public.calculation_services for delete
  using (
    exists (
      select 1 from public.calculations
      where calculations.id = calculation_services.calculation_id
      and (calculations.user_id = auth.uid()
        or exists (
          select 1 from public.admin_users
          where admin_users.user_id = auth.uid()
        ))
    )
  );

-- Costs: Everyone can read active costs, only admins can modify
create policy "Anyone can view active costs"
  on public.costs for select
  using (is_active = true);

create policy "Admins can manage costs"
  on public.costs for all
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

-- Config: Everyone can read, only admins can modify
create policy "Anyone can view config"
  on public.config for select
  using (true);

create policy "Admins can manage config"
  on public.config for all
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );
