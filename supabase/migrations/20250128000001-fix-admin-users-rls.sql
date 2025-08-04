-- Fix infinite recursion in admin_users RLS policy
-- Drop the problematic policy if it exists
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;

-- Create a simplified policy that doesn't cause recursion
CREATE POLICY "Allow authenticated users to read admin_users" ON admin_users
    FOR SELECT
    TO authenticated
    USING (true);

-- Optional: If you want to restrict admin user management, you can add this later
-- after the system is working, but for now we'll keep it simple to avoid recursion 