-- Migration: 016_update_config_base_rate.sql
-- Description: Update config table base_rate to $10 to match services base_rate
-- Created: 2026-03-29
-- Purpose: Ensure config.base_rate is consistent with services.base_rate

-- Update config base_rate to $10
UPDATE public.config SET base_rate = 10 WHERE id = 1;

-- Insert default config if it doesn't exist
INSERT INTO public.config (id, base_rate) VALUES (1, 10)
ON CONFLICT (id) DO UPDATE SET base_rate = 10;
