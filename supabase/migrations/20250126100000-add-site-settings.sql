-- Add site settings table for marquee and other site-wide configurations
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default marquee setting
INSERT INTO public.site_settings (setting_key, setting_value, is_active) 
VALUES ('marquee_text', '🔥 Welcome to SDM Electronics - Your trusted source for quality electronics in Uganda! 📱💻 Free delivery within Kampala 🔥', true);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site settings
CREATE POLICY "Allow public read site settings" 
  ON public.site_settings FOR SELECT 
  USING (true);

-- Only allow admin users to modify site settings
CREATE POLICY "Allow admin modify site settings" 
  ON public.site_settings 
  FOR ALL 
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_site_settings_updated_at 
  BEFORE UPDATE ON public.site_settings 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at(); 