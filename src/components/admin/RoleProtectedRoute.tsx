import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole, UserRole } from '../../hooks/useUserRole';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

/**
 * Component that protects routes based on user roles from database
 * Only uses database permissions - no fallback roles
 * Redirects to fallback path (or /admin) if user doesn't have required role or no permissions found
 */
const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  fallbackPath = '/admin',
}) => {
  const { role, loading: roleLoading } = useUserRole();
  const location = useLocation();
  const [dbPermissions, setDbPermissions] = useState<UserRole[] | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  // Get the current route path
  const currentPath = location.pathname;

  // Auto-create role-management entry if missing (admin only)
  useEffect(() => {
    if (currentPath === '/admin/role-management' && role === 'admin' && dbPermissions !== null && dbPermissions.length === 0) {
      const createRoleManagementEntry = async () => {
        try {
          const { error } = await supabase
            .from('menu_role_permissions')
            .upsert({
              path: '/admin/role-management',
              label: 'Управление ролями',
              section: 'Пользователи',
              roles: ['admin'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'path'
            });
          
          if (error) {
            // Silent fail - role-management entry creation is optional
          } else {
            // Refetch permissions to update state
            const { data } = await supabase
              .from('menu_role_permissions')
              .select('roles')
              .eq('path', currentPath)
              .maybeSingle();
            if (data && Array.isArray(data.roles)) {
              setDbPermissions(data.roles as UserRole[]);
            }
          }
        } catch (error) {
          // Silent fail - role-management entry creation is optional
        }
      };
      
      createRoleManagementEntry();
    }
  }, [currentPath, role, dbPermissions]);

  // Fetch permissions from database for this route
  useEffect(() => {
      const fetchRoutePermissions = async () => {
        setPermissionsLoading(true);
        try {
          const { data, error } = await supabase
            .from('menu_role_permissions')
            .select('roles')
            .eq('path', currentPath)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') {
            setDbPermissions(null);
            setPermissionsLoading(false);
            return;
          }

          if (data && Array.isArray(data.roles)) {
            // Database has permissions
            setDbPermissions(data.roles as UserRole[]);
          } else {
            // No database permissions found - deny access (no fallback)
            setDbPermissions([]); // Empty array means no access
          }
        } catch (error) {
          setDbPermissions(null);
        } finally {
          setPermissionsLoading(false);
        }
      };

    fetchRoutePermissions();

    // Subscribe to changes in menu_role_permissions for this specific path
    const subscription = supabase
      .channel(`route_permissions_${currentPath.replace(/\//g, '_')}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'menu_role_permissions',
          filter: `path=eq.${currentPath}`
        },
        () => {
          fetchRoutePermissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentPath]);

  // Only use database permissions - no fallback
  // null means still loading, [] means no permissions found (deny access)
  const allowedRoles = dbPermissions;

  if (roleLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If no role, deny access
  if (!role) {
    toast.error('У вас нет доступа к этой странице');
    return <Navigate to={fallbackPath} replace />;
  }

  // If permissions are still loading, wait
  if (allowedRoles === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Special case: Allow admins to access role-management even if not in database
  // This is needed because admins need this page to configure permissions
  if (allowedRoles.length === 0 && currentPath === '/admin/role-management' && role === 'admin') {
    return <>{children}</>;
  }

  // If no permissions found in database, deny access
  if (allowedRoles.length === 0) {
    toast.error('Доступ к этой странице не настроен');
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if user's role is in allowed roles
  const hasAccess = allowedRoles.includes(role);

  if (!hasAccess) {
    toast.error('У вас нет доступа к этой странице');
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
