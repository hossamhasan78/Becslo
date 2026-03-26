-- Migration: 013_fix_calculation_costs_rls.sql
-- Description: Add missing INSERT policy on calculation_costs so authenticated
--              users can save their own cost entries via the calculate-and-save API.
--              The API uses the anon-key client (user session), so RLS applies.
--              Also aligns the SELECT policy with calculation_services by including admins.
-- Created: 2026-03-26

-- Drop the existing SELECT policy (only covered the user, not admins)
DROP POLICY IF EXISTS "Users can view own calculation costs" ON public.calculation_costs;

-- Re-create SELECT policy including admins (mirrors calculation_services pattern)
CREATE POLICY "Users can view own calculation costs"
  ON public.calculation_costs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.calculations
      WHERE calculations.id = calculation_costs.calculation_id
        AND (
          calculations.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.user_id = auth.uid()
          )
        )
    )
  );

-- Add INSERT policy (was missing — caused "Failed to save calculation costs")
CREATE POLICY "Users can insert own calculation costs"
  ON public.calculation_costs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calculations
      WHERE calculations.id = calculation_costs.calculation_id
        AND calculations.user_id = auth.uid()
    )
  );

-- Add DELETE policy (for cascade cleanup safety, mirrors calculation_services)
CREATE POLICY "Users can delete own calculation costs"
  ON public.calculation_costs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.calculations
      WHERE calculations.id = calculation_costs.calculation_id
        AND (
          calculations.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.user_id = auth.uid()
          )
        )
    )
  );
