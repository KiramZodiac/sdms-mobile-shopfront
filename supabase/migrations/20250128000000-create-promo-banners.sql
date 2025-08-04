-- Create promo_banners table
CREATE TABLE IF NOT EXISTS promo_banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    image_url TEXT NOT NULL,
    cta_text VARCHAR(100) DEFAULT 'Shop Now',
    badge_text VARCHAR(50),
    category_slug VARCHAR(100),
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promo_banners_active ON promo_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_banners_sort_order ON promo_banners(sort_order);
CREATE INDEX IF NOT EXISTS idx_promo_banners_dates ON promo_banners(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promo_banners_category ON promo_banners(category_slug);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_promo_banners_updated_at 
    BEFORE UPDATE ON promo_banners 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to get active promo banners
CREATE OR REPLACE FUNCTION get_active_promo_banners()
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    description TEXT,
    image_url TEXT,
    cta_text VARCHAR(100),
    badge_text VARCHAR(50),
    category_slug VARCHAR(100),
    link_url TEXT,
    sort_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pb.id,
        pb.title,
        pb.subtitle,
        pb.description,
        pb.image_url,
        pb.cta_text,
        pb.badge_text,
        pb.category_slug,
        pb.link_url,
        pb.sort_order
    FROM promo_banners pb
    WHERE pb.is_active = true
    AND (pb.start_date IS NULL OR pb.start_date <= NOW())
    AND (pb.end_date IS NULL OR pb.end_date >= NOW())
    ORDER BY pb.sort_order ASC, pb.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_promo_banner_view(banner_id UUID)
RETURNS VOID AS $$
BEGIN
    -- This function can be extended to track banner views
    -- For now, it's a placeholder for future analytics
    NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;

-- Create policies for different access levels

-- Public read access for active banners
CREATE POLICY "Public can view active promo banners" ON promo_banners
    FOR SELECT
    USING (is_active = true);

-- Admin full access (insert, select, update, delete)
CREATE POLICY "Admins have full access to promo banners" ON promo_banners
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND u.email IN (
                SELECT email FROM admin_users 
                WHERE is_active = true
            )
        )
    );

-- Allow authenticated users to view all banners (for admin panel)
CREATE POLICY "Authenticated users can view all promo banners" ON promo_banners
    FOR SELECT
    TO authenticated
    USING (true);

-- Create admin_users table if it doesn't exist (for admin access control)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for admin_users updated_at
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Simplified policy for admin_users - allow all authenticated users to read
-- This prevents the infinite recursion issue
CREATE POLICY "Allow authenticated users to read admin_users" ON admin_users
    FOR SELECT
    TO authenticated
    USING (true);

-- Create some sample promo banners
INSERT INTO promo_banners (
    title, 
    subtitle, 
    description, 
    image_url, 
    cta_text, 
    badge_text, 
    category_slug,
    link_url,
    sort_order
) VALUES 
(
    'Smartphones',
    'Top Picks for 2025',
    'Browse our premium selection of smartphones with cutting-edge features and sleek design.',
    '/phone.jpeg',
    'Shop Now',
    'NEW',
    'smartphones',
    '/products?category=smartphones',
    1
),
(
    'Wireless Headphones',
    'Built for Sound',
    'Explore noise-canceling wireless headphones engineered for immersive audio and comfort.',
    '/headphones.jpeg',
    'Explore',
    'SALE',
    'headphones',
    '/products?category=headphones',
    2
),
(
    'Smart TVs',
    'Home Entertainment',
    'Discover ultra HD smart TVs with crisp visuals, streaming apps, and voice control.',
    '/smarttv.jpeg',
    'Discover',
    'FEATURED',
    'smart-tvs',
    '/products?category=smart-tvs',
    3
);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = user_email AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = user_email AND is_active = true AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON promo_banners TO anon, authenticated;
GRANT ALL ON admin_users TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_active_promo_banners() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_promo_banner_view(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_admin(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin(TEXT) TO anon, authenticated;

-- Analyze tables for better query planning
ANALYZE promo_banners;
ANALYZE admin_users; 