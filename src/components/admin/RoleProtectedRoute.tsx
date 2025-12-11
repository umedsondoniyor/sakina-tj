import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole, UserRole } from '../../hooks/useUserRole';
import toast from 'react-hot-toast';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
  fallbackPath?: string;
}

/**
 * Component that protects routes based on user roles
 * Redirects to fallback path (or /admin) if user doesn't have required role
 */
const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredRoles,
  fallbackPath = '/admin',
}) => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!role || !requiredRoles.includes(role)) {
    toast.error('У вас нет доступа к этой странице');
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
