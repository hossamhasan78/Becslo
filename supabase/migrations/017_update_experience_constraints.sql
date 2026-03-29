-- Migration: 017_update_experience_constraints.sql
-- Description: Update experience constraints from 1-10 to 1-25 years
-- Created: 2026-03-29
-- Purpose: Allow users to enter actual years of experience (up to 25 years)

-- Drop existing constraint
ALTER TABLE public.calculations
DROP CONSTRAINT IF EXISTS calculations_experience_designer_check,
DROP CONSTRAINT IF EXISTS calculations_experience_freelance_check;

-- Add new constraints with 1-25 range
ALTER TABLE public.calculations
ADD CONSTRAINT calculations_experience_designer_check
  CHECK (experience_designer between 1 and 25),
ADD CONSTRAINT calculations_experience_freelance_check
  CHECK (experience_freelance between 1 and 25);
