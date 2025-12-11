import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface CurrentUser {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  phone?: string;
}

export const useCurrentUser = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        
        if (!session) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Get user profile
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('id, email, full_name, role, phone')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to auth user data if profile doesn't exist
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name,
            role: session.user.user_metadata?.role || 'user',
          });
        } else if (profile) {
          setUser({
            id: profile.id,
            email: profile.email || session.user.email || '',
            full_name: profile.full_name,
            role: profile.role || 'user',
            phone: profile.phone,
          });
        } else {
          // Profile doesn't exist, use auth user data
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name,
            role: session.user.user_metadata?.role || 'user',
          });
        }
      } catch (error) {
        console.error('Error in useCurrentUser:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCurrentUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};
