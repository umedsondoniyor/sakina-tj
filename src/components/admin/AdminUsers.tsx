import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { User, Mail, Phone, Calendar, Shield, Eye, EyeOff, Trash2, Edit2, Plus, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserRole } from '../../hooks/useUserRole';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const IS_DEV = import.meta.env.DEV;

interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  date_of_birth?: string;
  role?: UserRole;
  created_at: string;
  updated_at: string;
}

interface UserFormData {
  email: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
  role: UserRole;
  password: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  
  const createDefaultFormState = (): UserFormData => ({
    email: '',
    full_name: '',
    phone: '',
    date_of_birth: '',
    role: 'user',
    password: '',
  });
  
  const [formData, setFormData] = useState<UserFormData>(createDefaultFormState());
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Helper function to validate and refresh session
  const ensureValidSession = useCallback(async () => {
    let { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData?.session) {
      throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
    }

    // Check if session is expired or about to expire
    const expiresAt = sessionData.session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt && expiresAt - now < 60) {
      // Refresh the session if it's about to expire
      const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshedSession?.session) {
        throw new Error('Не удалось обновить сессию. Пожалуйста, войдите снова.');
      }
      sessionData = refreshedSession;
    }

    if (!sessionData.session) {
      throw new Error('Сессия недоступна. Пожалуйста, войдите снова.');
    }

    return sessionData.session;
  }, []);

  // Helper function to verify admin role
  const verifyAdminRole = useCallback(async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !profile) {
      throw new Error('Не удалось проверить права доступа.');
    }

    if (profile.role !== 'admin') {
      throw new Error('У вас нет прав администратора для выполнения этого действия.');
    }

    return true;
  }, []);

  // Helper function to call edge function with proper auth
  const callEdgeFunction = useCallback(async (
    functionName: string,
    body: Record<string, any>
  ) => {
    const session = await ensureValidSession();
    await verifyAdminRole(session.user.id);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify(body)
    });

    const responseData = await response.json();
    const data = response.ok ? responseData : null;
    const error = response.ok ? null : { 
      message: responseData.message || responseData.error || 'Operation failed' 
    };

    if (IS_DEV) {
      console.log(`${functionName} response:`, { data, error });
    }

    return { data, error };
  }, [ensureValidSession, verifyAdminRole]);

  // Helper function to handle edge function responses
  const handleEdgeFunctionResponse = useCallback((
    data: any, 
    error: any, 
    defaultErrorMsg: string
  ): { success: boolean; message?: string } => {
    if (error) {
      if (IS_DEV) {
        console.error('Edge function error:', error);
      }
      
      // For 401 errors, provide a more helpful message
      if (error.message?.includes('401') || (error as any)?.status === 401) {
        return { 
          success: false, 
          message: 'Ошибка авторизации. Пожалуйста, войдите снова или убедитесь, что у вас есть права администратора.' 
        };
      }
      
      // Try multiple ways to extract error message
      const errorMsg = 
        data?.message || 
        data?.error || 
        error.message || 
        (error as any)?.context?.message ||
        (error as any)?.error_description ||
        defaultErrorMsg;
      return { success: false, message: errorMsg };
    }

    if (!data) {
      return { success: false, message: 'Не получен ответ от сервера' };
    }

    if (!data.success) {
      const errorMsg = data.message || data.error || defaultErrorMsg;
      return { success: false, message: errorMsg };
    }

    return { success: true, message: data.message };
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setActiveUser(null);
    setFormData(createDefaultFormState());
    setFormError(null);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    setActiveUser(user);
    setFormData({
      email: user.email || '',
      full_name: user.full_name || '',
      phone: user.phone || '',
      date_of_birth: user.date_of_birth ? user.date_of_birth.slice(0, 10) : '',
      role: (user.role as UserRole) || 'user',
      password: '',
    });
    setFormError(null);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (formLoading) return;
    setIsModalOpen(false);
    setActiveUser(null);
    setFormData(createDefaultFormState());
    setFormError(null);
    setShowPassword(false);
  };

  const handleFormChange = (field: keyof UserFormData, value: string | UserRole) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      setFormError('Email обязателен');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError('Неверный формат email адреса');
      return;
    }

    if (!activeUser) {
      // Creating new user - password is required
      if (!formData.password.trim()) {
        setFormError('Пароль обязателен для нового пользователя');
        return;
      }
      if (formData.password.trim().length < 6) {
        setFormError('Пароль должен содержать минимум 6 символов');
        return;
      }
    } else {
      // Updating user - password is optional
      if (formData.password.trim() && formData.password.trim().length < 6) {
        setFormError('Пароль должен содержать минимум 6 символов');
        return;
      }
    }

    setFormLoading(true);
    try {
      if (activeUser) {
        // Update existing user via edge function
        const { data, error } = await callEdgeFunction('manage-user', {
          action: 'update',
          userId: activeUser.id,
          email: trimmedEmail,
          password: formData.password.trim() || undefined,
          role: formData.role,
          full_name: formData.full_name.trim() || null,
          phone: formData.phone.trim() || null,
          date_of_birth: formData.date_of_birth || null,
        });

        const result = handleEdgeFunctionResponse(data, error, 'Не удалось обновить пользователя');
        if (!result.success) {
          throw new Error(result.message);
        }

        toast.success(result.message || 'Пользователь успешно обновлён');
      } else {
        // Create new user via edge function
        const { data, error } = await supabase.functions.invoke('create-user', {
          body: {
            email: trimmedEmail,
            password: formData.password.trim(),
            full_name: formData.full_name.trim() || null,
            phone: formData.phone.trim() || null,
            date_of_birth: formData.date_of_birth || null,
            role: formData.role
          }
        });

        if (error) {
          const errorMsg = data?.message || error.message || 'Не удалось создать пользователя';
          throw new Error(errorMsg);
        }

        if (!data) {
          throw new Error('Не получен ответ от сервера');
        }

        if (!data.success) {
          const errorMsg = data.message || data.error || 'Не удалось создать пользователя';
          throw new Error(errorMsg);
        }

        toast.success('Пользователь успешно создан');
      }

      await fetchUsers();
      closeModal();
    } catch (error: any) {
      console.error('Error saving user:', error);
      const errorMessage = error?.message || 'Не удалось сохранить пользователя';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!confirm(`Вы уверены, что хотите изменить роль пользователя на "${getRoleText(newRole)}"?`)) {
      return;
    }

    setUpdatingRoleId(userId);
    try {
      const { data, error } = await callEdgeFunction('manage-user', {
        action: 'update',
        userId: userId,
        role: newRole,
      });

      const result = handleEdgeFunctionResponse(data, error, 'Не удалось обновить роль');
      if (!result.success) {
        throw new Error(result.message);
      }

      // Update local state optimistically
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      toast.success('Роль пользователя успешно обновлена');
    } catch (error: any) {
      if (IS_DEV) {
        console.error('Error updating user role:', error);
      }
      const errorMessage = error?.message || 'Не удалось обновить роль пользователя';
      toast.error(errorMessage);
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const deleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    const userName = user?.full_name || user?.email || 'этого пользователя';
    
    if (!confirm(`Вы уверены, что хотите удалить ${userName}? Это действие нельзя отменить.`)) {
      return;
    }

    try {
      const { data, error } = await callEdgeFunction('manage-user', {
        action: 'delete',
        userId: userId
      });

      const result = handleEdgeFunctionResponse(data, error, 'Не удалось удалить пользователя');
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Remove from local state
      setUsers(users.filter(user => user.id !== userId));
      toast.success('Пользователь успешно удалён');
    } catch (error: any) {
      if (IS_DEV) {
        console.error('Error deleting user:', error);
      }
      const errorMessage = error?.message || 'Не удалось удалить пользователя';
      toast.error(errorMessage);
    }
  };

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="text-red-500" size={16} />;
      case 'editor':
        return <Edit2 className="text-purple-500" size={16} />;
      case 'moderator':
        return <Shield className="text-orange-500" size={16} />;
      case 'user':
      default:
        return <User className="text-blue-500" size={16} />;
    }
  };

  const getRoleText = (role?: UserRole | 'all') => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'editor':
        return 'Редактор';
      case 'moderator':
        return 'Модератор';
      case 'user':
        return 'Пользователь';
      case 'all':
        return 'Все';
      default:
        return 'Пользователь';
    }
  };

  const getRoleColor = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-purple-100 text-purple-800';
      case 'moderator':
        return 'bg-orange-100 text-orange-800';
      case 'user':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getAllRoles = (): UserRole[] => ['admin', 'editor', 'moderator', 'user'];

  const filteredUsers = filterRole === 'all' 
    ? users 
    : users.filter(user => (user.role || 'user') === filterRole);
  
  const getRoleCount = (role: UserRole | 'all') => {
    if (role === 'all') return users.length;
    return users.filter(u => (u.role || 'user') === role).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Управление пользователями</h1>
          <div className="text-sm text-gray-600">
            Всего пользователей: {users.length}
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy transition-colors font-semibold"
        >
          <Plus size={16} />
          Добавить пользователя
        </button>
      </div>

      {/* Role Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterRole === 'all' ? 'bg-brand-turquoise text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Все ({getRoleCount('all')})
          </button>
          {getAllRoles().map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filterRole === role ? 'bg-brand-turquoise text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {getRoleText(role)} ({getRoleCount(role)})
            </button>
          ))}
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            {filterRole === 'all' ? 'Нет пользователей' : `Нет пользователей с ролью "${getRoleText(filterRole)}"`}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Зарегистрированные пользователи будут отображаться здесь.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Контакты</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата регистрации</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || 'Не указано'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {user.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail size={14} className="mr-2" />
                          {user.email}
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={14} className="mr-2" />
                          {user.phone}
                        </div>
                      )}
                      {user.date_of_birth && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar size={14} className="mr-2" />
                          {new Date(user.date_of_birth).toLocaleDateString('ru-RU')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1">{getRoleText(user.role)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                        disabled={updatingRoleId === user.id}
                        className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Изменить роль"
                      >
                        {getAllRoles().map(role => (
                          <option key={role} value={role}>
                            {getRoleText(role)}
                          </option>
                        ))}
                      </select>
                      {updatingRoleId === user.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      )}
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Редактировать"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Удалить пользователя"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {activeUser ? 'Редактировать пользователя' : 'Новый пользователь'}
                </h2>
                <p className="text-sm text-gray-500">
                  {activeUser ? 'Обновите данные и сохраните изменения' : 'Укажите данные для создания учётной записи'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={formLoading}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Пароль {activeUser && <span className="text-gray-400">(необязательно)</span>}
                  </label>
                  {activeUser && (
                    <span className="text-xs text-gray-500">Оставьте пустым, чтобы не менять пароль</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleFormChange('password', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={activeUser ? 'Новый пароль' : 'Минимум 6 символов'}
                    disabled={formLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Полное имя</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleFormChange('full_name', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Телефон</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="+992 ..."
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Дата рождения</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleFormChange('date_of_birth', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    max={new Date().toISOString().slice(0, 10)}
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Роль</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleFormChange('role', e.target.value as UserRole)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    disabled={formLoading}
                  >
                    {getAllRoles().map(role => (
                      <option key={role} value={role}>
                        {getRoleText(role)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-lg bg-brand-turquoise text-white hover:bg-brand-navy transition-colors disabled:opacity-70 font-semibold"
                >
                  {formLoading ? 'Сохранение...' : activeUser ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;