
-- Create admin users table for authentication
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('product-images', 'product-images', true),
  ('product-videos', 'product-videos', true),
  ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for product images
CREATE POLICY "Allow public read access to product images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'product-images');

CREATE POLICY "Allow admin upload to product images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow admin update product images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete product images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Create storage policies for product videos
CREATE POLICY "Allow public read access to product videos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'product-videos');

CREATE POLICY "Allow admin upload to product videos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'product-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow admin update product videos" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'product-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete product videos" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'product-videos' AND auth.role() = 'authenticated');

-- Create storage policies for category images
CREATE POLICY "Allow public read access to category images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'category-images');

CREATE POLICY "Allow admin upload to category images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'category-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow admin update category images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'category-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete category images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'category-images' AND auth.role() = 'authenticated');

-- Add video_url column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin users
CREATE POLICY "Allow admin read own profile" 
  ON public.admin_users FOR SELECT 
  USING (id = auth.uid());

-- Update existing RLS policies to check for admin authentication
DROP POLICY IF EXISTS "Allow admin full access to products" ON public.products;
CREATE POLICY "Allow admin full access to products" 
  ON public.products FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  ));

DROP POLICY IF EXISTS "Allow admin full access to categories" ON public.categories;
CREATE POLICY "Allow admin full access to categories" 
  ON public.categories FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  ));

DROP POLICY IF EXISTS "Allow admin full access to customers" ON public.customers;
CREATE POLICY "Allow admin full access to customers" 
  ON public.customers FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  ));

DROP POLICY IF EXISTS "Allow admin full access to orders" ON public.orders;
CREATE POLICY "Allow admin full access to orders" 
  ON public.orders FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  ));

DROP POLICY IF EXISTS "Allow admin full access to order_items" ON public.order_items;
CREATE POLICY "Allow admin full access to order_items" 
  ON public.order_items FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  ));

DROP POLICY IF EXISTS "Allow admin full access to product_reviews" ON public.product_reviews;
CREATE POLICY "Allow admin full access to product_reviews" 
  ON public.product_reviews FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  ));
