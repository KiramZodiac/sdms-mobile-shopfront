
-- Drop existing storage policies that use auth.role()
DROP POLICY IF EXISTS "Allow admin upload to product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete product images" ON storage.objects;

DROP POLICY IF EXISTS "Allow admin upload to product videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update product videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete product videos" ON storage.objects;

DROP POLICY IF EXISTS "Allow admin upload to category images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update category images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete category images" ON storage.objects;

-- Create new storage policies that check against admin_users table
CREATE POLICY "Allow admin upload to product images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'product-images' AND 
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Allow admin update product images" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'product-images' AND 
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Allow admin delete product images" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'product-images' AND 
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Product videos policies
CREATE POLICY "Allow admin upload to product videos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'product-videos' AND 
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Allow admin update product videos" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'product-videos' AND 
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Allow admin delete product videos" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'product-videos' AND 
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Category images policies
CREATE POLICY "Allow admin upload to category images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'category-images' AND 
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Allow admin update category images" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'category-images' AND 
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Allow admin delete category images" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'category-images' AND 
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );
