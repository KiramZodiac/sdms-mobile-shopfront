import { ReactNode, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminLogin } from '@/components/admin/AdminLogin';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, LoaderCircle } from 'lucide-react';

// Supported roles for route protection
type UserRole = 'admin' | 'super_admin' | 'moderator';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Required role(s) to access this route */
  requiredRole?: UserRole | UserRole[];
  /** Custom fallback component when not authenticated */
  fallback?: ReactNode;
  /** Redirect path after successful login */
  redirectTo?: string;
  /** Whether to show loading state during auth check */
  showLoading?: boolean;
  error?: string;
}

/**
 * Higher-order component that protects routes based on authentication and role
 */
export const ProtectedRoute = ({ 
  children, 
  requiredRole,
  fallback,
  redirectTo,
  showLoading = true
}: ProtectedRouteProps) => {
  const { admin, loading, error } = useAdminAuth();
  const location = useLocation();

  // Store the intended destination for post-login redirect
  useEffect(() => {
    if (!admin && !loading) {
      sessionStorage.setItem('intended_destination', location.pathname);
    }
  }, [admin, loading, location.pathname]);

  // Show loading state
  if (loading && showLoading) {
    return <LoadingFallback />;
  }

  // Show error state if auth check failed
  if (error) {
    return <ErrorFallback error={error} />;
  }

  // User not authenticated
  if (!admin) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // For API routes or when redirectTo is specified, redirect instead of showing login
    if (redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    
    return <AdminLogin />;
  }

  // User is authenticated but inactive
  if (!admin.is_active) {
    return <InactiveFallback />;
  }

  // Check role-based access if required
  if (requiredRole && !hasRequiredRole(admin.role, requiredRole)) {
    return <UnauthorizedFallback userRole={admin.role} requiredRole={requiredRole} />;
  }

  // All checks passed, render protected content
  return <>{children}</>;
};

/**
 * Check if user has required role
 */
const hasRequiredRole = (userRole: string, requiredRole: UserRole | UserRole[]): boolean => {
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Define role hierarchy (higher roles include lower role permissions)
  const roleHierarchy: Record<UserRole, number> = {
    moderator: 1,
    admin: 2,
    super_admin: 3,
  };

  const userRoleLevel = roleHierarchy[userRole as UserRole] || 0;
  const requiredLevel = Math.min(...requiredRoles.map(role => roleHierarchy[role] || 999));

  return userRoleLevel >= requiredLevel;
};

/**
 * Loading fallback component with admin-themed skeleton
 */
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md w-full mx-auto p-6">
      <div className="flex items-center justify-center mb-8">
        <Shield className="h-12 w-12 text-blue-600 animate-pulse" />
      </div>
      
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div className="mt-8 text-center">
        <LoaderCircle size="sm" />
        <p className="mt-2 text-sm text-gray-600" role="status" aria-live="polite">
          Verifying credentials...
        </p>
      </div>
    </div>
  </div>
);

/**
 * Error fallback component for auth failures
 */
const ErrorFallback = ({ error }: { error: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="mt-2">
          <strong>Authentication Error</strong>
          <br />
          {error}
          <br />
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </AlertDescription>
      </Alert>
    </div>
  </div>
);

/**
 * Fallback for inactive users
 */
const InactiveFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full">
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription className="mt-2">
          <strong>Account Inactive</strong>
          <br />
          Your account has been deactivated. Please contact your administrator for assistance.
        </AlertDescription>
      </Alert>
    </div>
  </div>
);

/**
 * Fallback for insufficient permissions
 */
const UnauthorizedFallback = ({ 
  userRole, 
  requiredRole 
}: { 
  userRole: string; 
  requiredRole: UserRole | UserRole[];
}) => {
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription className="mt-2">
            <strong>Access Denied</strong>
            <br />
            Your role ({userRole}) does not have permission to access this area.
            <br />
            Required role(s): {requiredRoles.join(', ')}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

// Convenience components for common use cases
export const AdminOnlyRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
);

export const SuperAdminOnlyRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="super_admin">
    {children}
  </ProtectedRoute>
);

export const ModeratorOrHigherRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole={['moderator', 'admin', 'super_admin']}>
    {children}
  </ProtectedRoute>
);

// Hook for checking permissions in components
export const useRoutePermissions = () => {
  const { admin } = useAdminAuth();
  
  return {
    canAccessAdmin: admin?.is_active && hasRequiredRole(admin.role, 'admin'),
    canAccessSuperAdmin: admin?.is_active && hasRequiredRole(admin.role, 'super_admin'),
    canModerate: admin?.is_active && hasRequiredRole(admin.role, 'moderator'),
    userRole: admin?.role,
    isActive: admin?.is_active
  };
};

// Type exports for consumers
export type { UserRole, ProtectedRouteProps };