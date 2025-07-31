-- SECURE STORAGE POLICIES - Replace unsafe public access
-- This migration fixes the security vulnerability in 20250119120000-make-storage-public.sql

-- =====================================================
-- PRODUCT IMAGES BUCKET - Admin write, Public read
-- =====================================================
DROP POLICY IF EXISTS "Allow public upload to product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update product images" ON storage.objects;  
DROP POLICY IF EXISTS "Allow public delete product images" ON storage.objects;

-- Allow authenticated users to read product images
CREATE POLICY "Allow public read product images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'product-images');

-- Only allow admin users to upload product images
CREATE POLICY "Allow admin upload to product images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'product-images' AND 
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Only allow admin users to update product images
CREATE POLICY "Allow admin update product images" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'product-images' AND 
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Only allow admin users to delete product images
CREATE POLICY "Allow admin delete product images" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'product-images' AND 
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- PRODUCT VIDEOS BUCKET - Admin write, Public read
-- =====================================================
DROP POLICY IF EXISTS "Allow public upload to product videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update product videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete product videos" ON storage.objects;

CREATE POLICY "Allow public read product videos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'product-videos');

CREATE POLICY "Allow admin upload to product videos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'product-videos' AND 
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Allow admin update product videos" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'product-videos' AND 
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Allow admin delete product videos" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'product-videos' AND 
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- CATEGORY IMAGES BUCKET - Admin write, Public read
-- =====================================================
DROP POLICY IF EXISTS "Allow public upload to category images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update category images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete category images" ON storage.objects;

CREATE POLICY "Allow public read category images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'category-images');

CREATE POLICY "Allow admin upload to category images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'category-images' AND 
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Allow admin update category images" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'category-images' AND 
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Allow admin delete category images" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'category-images' AND 
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- SHOP IMAGES BUCKET - Admin write, Public read  
-- =====================================================
DROP POLICY IF EXISTS "Allow public upload to shop images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update shop images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete shop images" ON storage.objects;

-- Keep the public read policy for shop images
-- CREATE POLICY "Allow public read access to shop images" already exists

CREATE POLICY "Allow admin upload to shop images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'shop-images' AND 
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Allow admin update shop images" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'shop-images' AND 
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Allow admin delete shop images" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'shop-images' AND 
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  ); 