import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Skip auth check if already on login page to prevent infinite redirects
        if (location.pathname === '/admin/login') {
          setIsLoading(false);
          return;
        }

        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        
        if (!session) {
          console.log('No active session found');
          throw new Error('No active session');
        }

        // Get user profile to check role, use maybeSingle to handle missing profiles
        let { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          // Some error occurred
          console.error('Profile retrieval error:', profileError);
          throw profileError;
        }

        // If profile doesn't exist, create one with default role
        if (!profile) {
          // Profile doesn't exist, create it
          const defaultRole = (session.user.user_metadata?.role as string) || 'user';
          const { error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: session.user.id,
              email: session.user.email || '',
              role: defaultRole,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (createError) {
            console.error('Profile creation error:', createError);
            // If creation fails, still try to proceed - might be RLS issue
            // But we'll deny access since we can't verify role
            throw new Error('Failed to create user profile. Please contact administrator.');
          }

          // Fetch the newly created profile
          const { data: newProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          if (fetchError) {
            console.error('Profile retrieval error after creation:', fetchError);
            throw fetchError;
          }
          
          if (!newProfile) {
            throw new Error('Profile was created but could not be retrieved');
          }
          
          profile = newProfile;
        }

        // Allow admin, editor, and moderator roles to access admin area
        const allowedRoles = ['admin', 'editor', 'moderator'];
        if (!profile || !allowedRoles.includes(profile.role)) {
          console.log('User does not have admin access:', profile?.role);
          throw new Error('Unauthorized access');
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication error:', error);
        // Only show toast and redirect if not already on login page
        if (location.pathname !== '/admin/login') {
          toast.error('Please log in as an administrator');
          navigate('/admin/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        // Only redirect to login if not already there
        if (location.pathname !== '/admin/login') {
          navigate('/admin/login');
        }
      } else if (event === 'SIGNED_IN' && session) {
        // Recheck admin status when signed in
        checkAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  // Allow rendering children if authenticated or on login page
  return (location.pathname === '/admin/login' || isAuthenticated) ? <>{children}</> : null;
};

export default AdminRoute;