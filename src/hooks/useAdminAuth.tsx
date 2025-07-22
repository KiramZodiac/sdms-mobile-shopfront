
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Check if user is an admin
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', session.user.id)
            .eq('is_active', true)
            .single();

          if (adminData) {
            setAdmin(adminData);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setAdmin(null);
        } else if (event === 'SIGNED_IN' && session) {
          // Check if user is an admin
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', session.user.id)
            .eq('is_active', true)
            .single();

          if (adminData) {
            setAdmin(adminData);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Automatically logout when user leaves the admin page
  useEffect(() => {
    // Only run this effect if the user is currently logged in as admin
    if (!admin) return;

    // If the current path does not start with /Admin, log out
    if (!location.pathname.startsWith('/Admin')) {
      signOut();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user is an admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', data.user.id)
          .eq('is_active', true)
          .single();

        if (adminError || !adminData) {
          await supabase.auth.signOut();
          return { error: 'Access denied. Admin account required.' };
        }

        setAdmin(adminData);
        toast({
          title: "Success",
          description: "Signed in successfully",
        });
        return {};
      }
    } catch (error: any) {
      return { error: error.message };
    }
    return { error: 'Unknown error occurred' };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
