-- Migration: 014_update_base_rate_default.sql
-- Description: Update base_rate default from $50 to $10 for new pricing model
-- Created: 2026-03-29
-- Purpose: Implement new pricing with lower base rates and reduced experience multiplier scale

-- Update default value for base_rate column
ALTER TABLE public.services ALTER COLUMN base_rate SET DEFAULT 10;

-- Update all existing services to $10 base rate (affects new calculations)
UPDATE public.services SET base_rate = 10 WHERE base_rate = 50;
