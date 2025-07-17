
-- Fix RLS policy for orders to allow public insertion
DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
CREATE POLICY "Allow public insert orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (true);

-- Create banners table for admin banner management
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  video_url TEXT,
  cta_text TEXT DEFAULT 'Learn More',
  cta_link TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on banners
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active banners
CREATE POLICY "Allow public read access to active banners" 
  ON public.banners 
  FOR SELECT 
  USING (is_active = true);

-- Allow admin full access to banners
CREATE POLICY "Allow admin full access to banners" 
  ON public.banners 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  ));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_banners_updated_at 
  BEFORE UPDATE ON public.banners 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
