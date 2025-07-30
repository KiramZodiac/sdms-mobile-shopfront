import { ReactNode } from 'react';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import { SimpleAdminLogin } from '@/components/admin/SimpleAdminLogin';

interface SimpleProtectedRouteProps {
  children: ReactNode;
}

export const SimpleProtectedRoute = ({ children }: SimpleProtectedRouteProps) => {
  const { admin, loading } = useSimpleAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!admin || !admin.isAuthenticated) {
    return <SimpleAdminLogin />;
  }

  return <>{children}</>;
}; 