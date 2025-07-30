import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SimpleAdminUser {
  username: string;
  isAuthenticated: boolean;
}

interface SimpleAdminAuthContextType {
  admin: SimpleAdminUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

const SimpleAdminAuthContext = createContext<SimpleAdminAuthContextType | undefined>(undefined);

export const SimpleAdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<SimpleAdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedAdmin = localStorage.getItem('simple_admin_session');
    if (savedAdmin) {
      try {
        const adminData = JSON.parse(savedAdmin);
        setAdmin(adminData);
      } catch (error) {
        localStorage.removeItem('simple_admin_session');
      }
    }
    setLoading(false);
  }, []);

  // Helper function to fetch admin data from database
  const fetchAdminData = async (userId: string): Promise<SimpleAdminUser | null> => {
    try {
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('id, email, role, is_active, created_at')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Failed to fetch admin data:', error);
        return null;
      }

      return { username: adminData.email, isAuthenticated: true };
    } catch (error) {
      console.error('Exception fetching admin data:', error);
      return null;
    }
  };

  const signIn = async (username: string, password: string): Promise<boolean> => {
    try {
      // Use Supabase Auth to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        return false;
      }

      if (data.user) {
        // Verify the user is an admin by checking admin_users table
        const adminData = await fetchAdminData(data.user.id);
        
        if (!adminData) {
          // User signed in but is not an admin
          await supabase.auth.signOut();
          return false;
        }

        setAdmin(adminData);
        localStorage.setItem('simple_admin_session', JSON.stringify(adminData));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    setAdmin(null);
    localStorage.removeItem('simple_admin_session');
  };

  const value: SimpleAdminAuthContextType = {
    admin,
    loading,
    signIn,
    signOut
  };

  return (
    <SimpleAdminAuthContext.Provider value={value}>
      {children}
    </SimpleAdminAuthContext.Provider>
  );
};

export const useSimpleAdminAuth = () => {
  const context = useContext(SimpleAdminAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAdminAuth must be used within a SimpleAdminAuthProvider');
  }
  return context;
}; 