-- Becslo Database Schema for Supabase

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  default_hours INTEGER DEFAULT 1,
  min_hours INTEGER DEFAULT 1,
  max_hours INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true
);

-- Calculations table
CREATE TABLE IF NOT EXISTS public.calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  experience_years INTEGER NOT NULL,
  freelance_years INTEGER NOT NULL,
  designer_country TEXT NOT NULL,
  client_country TEXT NOT NULL,
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('hourly', 'project')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'normal', 'high')),
  profit_margin FLOAT DEFAULT 20,
  total_hours FLOAT DEFAULT 0,
  final_price FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calculation services junction table
CREATE TABLE IF NOT EXISTS public.calculation_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id UUID REFERENCES public.calculations(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  hours INTEGER NOT NULL
);

-- Costs table
CREATE TABLE IF NOT EXISTS public.costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id UUID REFERENCES public.calculations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount FLOAT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('monthly', 'project'))
);

-- Config table for multipliers
CREATE TABLE IF NOT EXISTS public.config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Insert default config values
INSERT INTO public.config (key, value) VALUES
  ('base_hourly_rate', '75'),
  ('experience_multipliers', '{"designer": {"0-2": 0.7, "3-5": 1.0, "6-9": 1.3, "10+": 1.6}, "freelance": {"0-1": 0.8, "2-3": 1.0, "4-6": 1.2, "7+": 1.4}}'),
  ('geo_multipliers', '{}'),
  ('risk_buffer', '10'),
  ('profit_margin', '20')
ON CONFLICT (key) DO NOTHING;

-- Insert default services
INSERT INTO public.services (name, category, default_hours, min_hours, max_hours) VALUES
  -- UX Research
  ('User Interviews', 'UX Research', 8, 2, 20),
  ('Usability Testing', 'UX Research', 6, 2, 16),
  ('User Surveys', 'UX Research', 4, 1, 10),
  ('Persona Creation', 'UX Research', 4, 2, 8),
  ('User Journey Mapping', 'UX Research', 6, 2, 12),
  
  -- UI Design
  ('Wireframing', 'UI Design', 8, 2, 24),
  ('High-Fidelity Mockups', 'UI Design', 16, 4, 40),
  ('Design System', 'UI Design', 24, 8, 60),
  ('Prototyping', 'UI Design', 8, 2, 20),
  ('Icon Design', 'UI Design', 4, 1, 8),
  
  -- UX Writing
  ('Content Strategy', 'UX Writing', 6, 2, 16),
  ('Microcopy', 'UX Writing', 2, 1, 6),
  ('User Error Messages', 'UX Writing', 2, 1, 4),
  
  -- Research & Strategy
  ('Competitive Analysis', 'Research & Strategy', 4, 2, 8),
  ('Market Research', 'Research & Strategy', 8, 4, 16),
  ('Product Strategy', 'Research & Strategy', 8, 4, 16),
  
  -- Development Handoff
  ('Figma to Code Handoff', 'Development Handoff', 4, 1, 8),
  ('Design Specifications', 'Development Handoff', 2, 1, 4),
  ('Developer Handoff Meeting', 'Development Handoff', 1, 0.5, 2)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculation_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for admin_users
CREATE POLICY "Admins can view admin_users" ON public.admin_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.user()::text)
  );

-- RLS Policies for services
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.user()::text)
  );

-- RLS Policies for calculations
CREATE POLICY "Users can insert calculations" ON public.calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all calculations" ON public.calculations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.user()::text)
  );

-- RLS Policies for calculation_services
CREATE POLICY "Users can insert calculation_services" ON public.calculation_services
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.calculations WHERE id = calculation_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can view all calculation_services" ON public.calculation_services
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.user()::text)
  );

-- RLS Policies for costs
CREATE POLICY "Users can insert costs" ON public.costs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.calculations WHERE id = calculation_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can view all costs" ON public.costs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.user()::text)
  );

-- RLS Policies for config
CREATE POLICY "Anyone can view config" ON public.config
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage config" ON public.config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.user()::text)
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
