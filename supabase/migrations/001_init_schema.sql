-- Migration: 001_init_schema.sql
-- Description: Create users and admin_users tables with Row-Level Security (RLS) policies
-- Created: 2026-03-17
-- Purpose: MVP Authentication & Wizard Skeleton - User and admin management

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

-- Enable Row-Level Security on users table only
alter table public.users enable row level security;

-- Users RLS Policies

-- Users can view own data
create policy "Users can view own data"
  on public.users for select
  using (auth.uid() = id);

-- Users can update own data
create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id);

-- Admins can view all users
create policy "Admins can view all users"
  on public.users for select
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

-- Note: admin_users does NOT have RLS enabled - managed via service role

-- Create indexes for performance
create index idx_users_email on public.users(email);
create index idx_users_created_at on public.users(created_at);

create index idx_admin_users_user_id on public.admin_users(user_id);
create index idx_admin_users_role on public.admin_users(role);

-- Database trigger function: handle_new_user()
-- Purpose: Automatically create user record in public.users table when Supabase auth creates a user

-- Function to create user record
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
  for each row
  execute procedure public.handle_new_user();
