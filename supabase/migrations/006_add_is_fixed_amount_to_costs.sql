-- Migration: 006_add_is_fixed_amount_to_costs.sql
-- Description: Add is_fixed_amount column to costs table
-- Created: 2026-03-19
-- Purpose: Fix schema mismatch - costs table needs is_fixed_amount column

-- Add is_fixed_amount column to costs table
alter table public.costs add column if not exists is_fixed_amount boolean default false not null;

-- Update existing costs to have appropriate values
-- Fixed amount costs (dollar values)
update public.costs set is_fixed_amount = true 
where lower(name) in (
  'software licenses',
  'stock photos/videos',
  'domain names',
  'hosting (monthly)',
  'email marketing platform',
  'analytics tools',
  'design tools subscription',
  'development tools',
  'project management tools',
  'communication tools',
  'vpn & security',
  'backup services',
  'api services',
  'ssl certificates'
);

-- Percentage-based costs
update public.costs set is_fixed_amount = false 
where lower(name) like '%fee%' 
   or lower(name) like '%percent%'
   or lower(name) like '%commission%';
