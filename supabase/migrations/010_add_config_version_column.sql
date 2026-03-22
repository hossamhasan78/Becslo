-- Migration: Add version and updated_by columns to config table
-- Required for optimistic locking in admin configuration editor

-- Add version column for optimistic locking
ALTER TABLE public.config ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;

-- Add updated_by column to track which admin made changes
ALTER TABLE public.config ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES public.users(id);

-- Update existing record to have version 1
UPDATE public.config SET version = 1 WHERE version IS NULL;

-- Create index on version for potential future use
CREATE INDEX IF NOT EXISTS idx_config_version ON public.config(version);
