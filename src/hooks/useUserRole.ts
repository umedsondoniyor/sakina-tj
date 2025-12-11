import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export type UserRole = 'admin' | 'editor' | 'moderator' | 'user';

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        
        if (!session) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } else {
          setRole((profile?.role as UserRole) || 'user');
        }
      } catch (error) {
        console.error('Error in useUserRole:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { role, loading };
};
