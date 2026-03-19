-- Migration: 007_fix_schema_columns.sql
-- Description: Fix missing columns in local database schema
-- Created: 2026-03-19
-- Purpose: Add base_rate to services, is_active to countries and costs for local dev

-- Add base_rate column to services table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'base_rate'
  ) THEN
    ALTER TABLE public.services ADD COLUMN base_rate numeric(10,2) DEFAULT 50 NOT NULL;
  END IF;
END $$;

-- Add is_active column to countries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'countries' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.countries ADD COLUMN is_active boolean DEFAULT true NOT NULL;
  END IF;
END $$;

-- Add is_fixed_amount column to costs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'costs' AND column_name = 'is_fixed_amount'
  ) THEN
    ALTER TABLE public.costs ADD COLUMN is_fixed_amount boolean DEFAULT false NOT NULL;
  END IF;
END $$;
