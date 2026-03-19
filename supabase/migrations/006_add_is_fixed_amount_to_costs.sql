-- Migration: 006_add_is_fixed_amount_to_costs.sql
-- Description: Add is_fixed_amount column to costs table
-- Created: 2026-03-19
-- Purpose: Fix schema mismatch - costs table needs is_fixed_amount column

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'costs' AND column_name = 'is_fixed_amount'
  ) THEN
    ALTER TABLE public.costs ADD COLUMN is_fixed_amount boolean DEFAULT false NOT NULL;
  END IF;
END $$;

UPDATE public.costs SET is_fixed_amount = true 
WHERE lower(name) IN (
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

UPDATE public.costs SET is_fixed_amount = false 
WHERE lower(name) LIKE '%fee%' 
   OR lower(name) LIKE '%percent%'
   OR lower(name) LIKE '%commission%';
