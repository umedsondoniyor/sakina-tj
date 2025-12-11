import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Logo from '../Logo';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use standard Supabase Auth login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user profile exists, use maybeSingle to handle missing profiles
        let { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role, email')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) {
          // Some error occurred
          console.error('Profile retrieval error:', profileError);
          throw profileError;
        }

        // If profile doesn't exist, create one with default role
        if (!profile) {
          // Profile doesn't exist, create it
          const defaultRole = (data.user.user_metadata?.role as string) || 'user';
          const { error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: data.user.email || '',
              role: defaultRole,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (createError) {
            console.error('Error creating user profile:', createError);
            throw new Error('Failed to create user profile. Please contact administrator.');
          }

          // Fetch the newly created profile
          const { data: newProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('role, email')
            .eq('id', data.user.id)
            .maybeSingle();

          if (fetchError) {
            console.error('Error fetching new profile:', fetchError);
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
          throw new Error('Unauthorized access. Admin, editor, or moderator role required.');
        }

        toast.success('Успешный вход');
        navigate('/admin/products');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="flex flex-col items-center">
          <Logo variant="horizontal" className="mb-6" />
          <h2 className="text-2xl font-bold">Вход в панель администратора</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-turquoise font-semibold shadow-sm hover:shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Вход...</span>
              </>
            ) : (
              <span>Войти</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
