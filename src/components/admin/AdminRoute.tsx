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

        // Get user profile to check role
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Profile retrieval error:', profileError);
          throw profileError;
        }

        if (!profile || profile.role !== 'admin') {
          console.log('User is not an admin:', profile?.role);
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