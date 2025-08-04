-- Fix storage bucket RLS policies for promo-banners bucket

-- Enable RLS on the storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload to promo-banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view promo-banners" ON storage.objects;

-- Create policy to allow authenticated users to upload files to promo-banners bucket
CREATE POLICY "Allow authenticated users to upload to promo-banners" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'promo-banners');

-- Create policy to allow public to view files from promo-banners bucket
CREATE POLICY "Allow public to view promo-banners" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'promo-banners');

-- Create policy to allow authenticated users to update files in promo-banners bucket
CREATE POLICY "Allow authenticated users to update promo-banners" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'promo-banners')
    WITH CHECK (bucket_id = 'promo-banners');

-- Create policy to allow authenticated users to delete files from promo-banners bucket
CREATE POLICY "Allow authenticated users to delete promo-banners" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'promo-banners');