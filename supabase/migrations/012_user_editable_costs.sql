-- Migration: User-Editable Costs
-- Drop default_cost column and create calculation_costs table
-- This migration enables users to enter their own overhead amounts

-- 1. Drop the default_cost column from costs table
ALTER TABLE public.costs DROP COLUMN IF EXISTS default_cost;

-- 2. Create calculation_costs table to store per-calculation cost line items
CREATE TABLE public.calculation_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id uuid NOT NULL REFERENCES public.calculations(id) ON DELETE CASCADE,
  cost_id integer REFERENCES public.costs(id) ON DELETE SET NULL,
  cost_name text NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0)
);

-- 3. Create index on calculation_id for efficient queries
CREATE INDEX idx_calculation_costs_calculation_id ON public.calculation_costs(calculation_id);

-- 4. Enable Row Level Security
ALTER TABLE public.calculation_costs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies matching calculation_services pattern
-- Users can SELECT their own calculation_costs rows
CREATE POLICY "Users can view own calculation costs"
  ON public.calculation_costs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.calculations
      WHERE calculations.id = calculation_id
      AND calculations.user_id = auth.uid()
    )
  );

-- Users can INSERT cost rows for their own calculations (via calculate-and-save API)
CREATE POLICY "Users can insert own calculation costs"
  ON public.calculation_costs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calculations
      WHERE calculations.id = calculation_id
      AND calculations.user_id = auth.uid()
    )
  );

-- 6. Seed overhead cost categories
-- These are the standard freelance overhead categories visible to users in Step 4.
-- is_fixed_amount = true  → fixed monthly/annual fee
-- is_fixed_amount = false → variable or percentage-based cost
INSERT INTO public.costs (name, is_fixed_amount, is_active) VALUES
  ('Software Licenses',          true,  true),
  ('Design Tools Subscription',  true,  true),
  ('Development Tools',          true,  true),
  ('Project Management Tools',   true,  true),
  ('Communication Tools',        true,  true),
  ('Analytics Tools',            true,  true),
  ('Email Marketing Platform',   true,  true),
  ('Stock Photos / Videos',      true,  true),
  ('Domain Names',               true,  true),
  ('Hosting (Monthly)',          true,  true),
  ('VPN & Security',             true,  true),
  ('Backup Services',            true,  true),
  ('API Services',               true,  true),
  ('SSL Certificates',           true,  true),
  ('Hardware & Equipment',       true,  true),
  ('Office Supplies',            true,  true),
  ('Internet & Phone',           true,  true),
  ('Professional Development',   false, true),
  ('Marketing & Advertising',    false, true),
  ('Accounting & Legal Fees',    false, true),
  ('Insurance',                  true,  true),
  ('Travel & Transport',         false, true)
ON CONFLICT DO NOTHING;
