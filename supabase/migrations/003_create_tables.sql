-- Migration: 003_create_tables.sql
-- Description: Create categories, services, countries, calculations, calculation_services, costs, config tables
-- Created: 2026-03-18
-- Purpose: Database & Configuration Setup - Core data tables for pricing wizard

-- Create categories table
create table public.categories (
  id serial primary key,
  name text unique not null,
  display_order integer not null default 0,
  created_at timestamp with time zone not null default now()
);

-- Create services table
create table public.services (
  id serial primary key,
  category_id integer not null references public.categories(id) on delete cascade,
  name text not null,
  default_hours numeric(5,2) not null default 1,
  min_hours numeric(5,2) not null default 1,
  max_hours numeric(5,2) not null default 100,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now()
);

-- Create countries table
create table public.countries (
  id serial primary key,
  name text unique not null,
  code char(2) unique not null,
  multiplier numeric(3,2) not null default 1.0,
  created_at timestamp with time zone not null default now()
);

-- Create calculations table
create table public.calculations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_name text not null,
  user_email text not null,
  pricing_model text not null check (pricing_model in ('hourly', 'project')),
  experience_designer integer not null check (experience_designer between 1 and 10),
  experience_freelance integer not null check (experience_freelance between 1 and 10),
  designer_country_id integer references public.countries(id) on delete set null,
  client_country_id integer references public.countries(id) on delete set null,
  total_hours numeric(10,2) not null default 0,
  subtotal numeric(12,2) not null default 0,
  risk_buffer numeric(12,2) not null default 0,
  profit_margin numeric(12,2) not null default 0,
  final_price numeric(12,2) not null default 0,
  recommended_min numeric(12,2) not null default 0,
  recommended_max numeric(12,2) not null default 0,
  created_at timestamp with time zone not null default now()
);

-- Create calculation_services table
create table public.calculation_services (
  id uuid default gen_random_uuid() primary key,
  calculation_id uuid not null references public.calculations(id) on delete cascade,
  service_id integer not null references public.services(id) on delete restrict,
  hours numeric(5,2) not null,
  adjusted_rate numeric(10,2) not null,
  cost numeric(10,2) not null
);

-- Create costs table
create table public.costs (
  id serial primary key,
  name text not null,
  is_active boolean not null default true,
  default_cost numeric(10,2) not null default 0,
  created_at timestamp with time zone not null default now()
);

-- Create config table (singleton)
create table public.config (
  id serial primary key,
  base_rate numeric(10,2) not null default 50,
  risk_buffer_min numeric(5,2) not null default 0,
  risk_buffer_max numeric(5,2) not null default 50,
  profit_margin_min numeric(5,2) not null default 10,
  profit_margin_max numeric(5,2) not null default 50,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Insert default config record
insert into public.config (id, base_rate) values (1, 50)
on conflict (id) do nothing;

-- Create indexes for performance
create index idx_services_category_id on public.services(category_id);
create index idx_services_is_active on public.services(is_active);
create index idx_countries_code on public.countries(code);
create index idx_calculations_user_id on public.calculations(user_id);
create index idx_calculations_created_at on public.calculations(created_at);
create index idx_calculation_services_calculation_id on public.calculation_services(calculation_id);
create index idx_calculation_services_service_id on public.calculation_services(service_id);
create index idx_costs_is_active on public.costs(is_active);
