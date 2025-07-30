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
    const initializeAuth = async () => {
      try {
        // Always check localStorage first (more reliable)
        const savedAdmin = localStorage.getItem('simple_admin_session');
        if (savedAdmin) {
          try {
            const adminData = JSON.parse(savedAdmin);
            setAdmin(adminData);
            console.log('Admin restored from localStorage');
          } catch (error) {
            console.error('Invalid admin data in localStorage:', error);
            localStorage.removeItem('simple_admin_session');
          }
        }
        
                 // Then check if there's an active Supabase session to sync
         const { data: { session }, error } = await supabase.auth.getSession();
         
         if (session && session.user && savedAdmin) {
           // Verify the session matches our admin user
           const adminData = await fetchAdminData(session.user.id);
           if (adminData) {
             setAdmin(adminData);
             localStorage.setItem('simple_admin_session', JSON.stringify(adminData));
             console.log('Supabase session verified and synced');
           } else {
             // Session exists but user is not an admin, sign out
             console.log('User session found but not an admin, signing out');
             await supabase.auth.signOut();
             setAdmin(null);
             localStorage.removeItem('simple_admin_session');
           }
         } else if (!session && savedAdmin) {
           console.log('Admin in localStorage but no Supabase session - trying to refresh session');
           // Try to refresh the session if we have an admin but no session
           try {
             const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
             if (refreshData.session) {
               console.log('Supabase session refreshed successfully');
               const adminData = await fetchAdminData(refreshData.session.user.id);
               if (adminData) {
                 setAdmin(adminData);
                 localStorage.setItem('simple_admin_session', JSON.stringify(adminData));
               }
             } else {
               console.log('Could not refresh session, keeping admin logged in locally');
             }
           } catch (refreshError) {
             console.log('Session refresh failed, keeping admin logged in locally:', refreshError);
           }
         }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes (but be careful not to logout on page refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      // Only handle explicit sign out, not session restoration events
      if (event === 'SIGNED_OUT') {
        console.log('Explicit sign out detected');
        setAdmin(null);
        localStorage.removeItem('simple_admin_session');
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('Token refreshed, updating admin data');
        const adminData = await fetchAdminData(session.user.id);
        if (adminData) {
          setAdmin(adminData);
          localStorage.setItem('simple_admin_session', JSON.stringify(adminData));
        }
      }
      // Don't handle SIGNED_IN here to avoid conflicts with initializeAuth
    });

    return () => subscription.unsubscribe();
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