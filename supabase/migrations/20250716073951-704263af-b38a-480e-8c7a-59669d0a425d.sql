
-- Add view count column to products table
ALTER TABLE public.products ADD COLUMN view_count integer DEFAULT 0;

-- Create a function to increment product views
CREATE OR REPLACE FUNCTION public.increment_product_view(product_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.products 
  SET view_count = COALESCE(view_count, 0) + 1,
      updated_at = now()
  WHERE id = product_id;
END;
$$;

-- Create an admin user (you'll need to set a password)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@sdmelectronics.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  '',
  '',
  '',
  ''
);

-- Insert the admin user into admin_users table (get the user id from the previous insert)
INSERT INTO public.admin_users (id, email, role, is_active)
SELECT id, email, 'admin', true
FROM auth.users 
WHERE email = 'admin@sdmelectronics.com';

-- Create orders and related tables for checkout system
CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  rate numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default shipping rates
INSERT INTO public.shipping_rates (name, description, rate) VALUES
('Standard Delivery', 'Delivery within Kampala (1-2 days)', 5000),
('Express Delivery', 'Same day delivery within Kampala', 10000),
('Regional Delivery', 'Delivery outside Kampala (2-3 days)', 15000);

-- Enable RLS on shipping_rates
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to shipping rates
CREATE POLICY "Allow public read access to shipping rates"
  ON public.shipping_rates
  FOR SELECT
  USING (true);

-- Create policy for admin full access to shipping rates
CREATE POLICY "Allow admin full access to shipping rates"
  ON public.shipping_rates
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  ));
