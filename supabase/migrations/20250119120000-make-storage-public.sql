-- Make storage uploads public by removing authentication requirements

-- Update product images policies
DROP POLICY IF EXISTS "Allow admin upload to product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete product images" ON storage.objects;

CREATE POLICY "Allow public upload to product images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public update product images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'product-images');

CREATE POLICY "Allow public delete product images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'product-images');

-- Update product videos policies
DROP POLICY IF EXISTS "Allow admin upload to product videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update product videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete product videos" ON storage.objects;

CREATE POLICY "Allow public upload to product videos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'product-videos');

CREATE POLICY "Allow public update product videos" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'product-videos');

CREATE POLICY "Allow public delete product videos" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'product-videos');

-- Update category images policies
DROP POLICY IF EXISTS "Allow admin upload to category images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update category images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete category images" ON storage.objects;

CREATE POLICY "Allow public upload to category images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'category-images');

CREATE POLICY "Allow public update category images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'category-images');

CREATE POLICY "Allow public delete category images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'category-images');

-- Add shop-images bucket and update policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('shop-images', 'shop-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing shop-images policies if they exist
DROP POLICY IF EXISTS "Allow public read access to shop images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin upload to shop images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update shop images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete shop images" ON storage.objects;

CREATE POLICY "Allow public read access to shop images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'shop-images');

CREATE POLICY "Allow public upload to shop images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'shop-images');

CREATE POLICY "Allow public update shop images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'shop-images');

CREATE POLICY "Allow public delete shop images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'shop-images'); 