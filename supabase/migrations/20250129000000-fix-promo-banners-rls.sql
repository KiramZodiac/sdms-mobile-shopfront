-- Fix RLS policies for promo_banners table
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins have full access to promo banners" ON promo_banners;
DROP POLICY IF EXISTS "Authenticated users can view all promo banners" ON promo_banners;

-- Create simplified policies that work with the existing admin system

-- Allow all authenticated users to read promo banners (for admin panel)
CREATE POLICY "Allow authenticated users to read promo banners" ON promo_banners
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow all authenticated users to insert promo banners
CREATE POLICY "Allow authenticated users to insert promo banners" ON promo_banners
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow all authenticated users to update promo banners
CREATE POLICY "Allow authenticated users to update promo banners" ON promo_banners
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow all authenticated users to delete promo banners
CREATE POLICY "Allow authenticated users to delete promo banners" ON promo_banners
    FOR DELETE
    TO authenticated
    USING (true);

-- Note: The "Public can view active promo banners" policy already exists from the previous migration
-- so we don't need to create it again 