import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { User, Mail, Phone, Calendar, Shield, Eye, EyeOff, Trash2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  date_of_birth?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'user' as 'user' | 'admin',
    date_of_birth: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
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

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete from auth.users (this will cascade to user_profiles due to foreign key)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) throw authError;
      
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const createUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast.error('Email и пароль обязательны');
      return;
    }

    if (newUser.password.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов');
      return;
    }

    setCreating(true);
    let responseData: any = null;
    try {
      // Call edge function to create user (uses service role key)
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newUser.email,
          password: newUser.password,
          full_name: newUser.full_name || null,
          phone: newUser.phone || null,
          date_of_birth: newUser.date_of_birth || null,
          role: newUser.role
        }
      });

      responseData = data;

      if (error) {
        // Extract user-friendly error message
        const errorMessage = data?.message || error.message || data?.error || 'Неизвестная ошибка';
        toast.error(errorMessage);
        return;
      }

      if (!data?.success) {
        // Use the message field if available, otherwise fall back to error field
        const errorMessage = data?.message || data?.error || 'Не удалось создать пользователя';
        toast.error(errorMessage);
        return;
      }

      toast.success('Пользователь успешно создан');
      setShowAddModal(false);
      setNewUser({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        role: 'user',
        date_of_birth: ''
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      // Prioritize message field, then error field, then error.message
      const errorMessage = responseData?.message || error.message || responseData?.error || error.error || 'Произошла неизвестная ошибка при создании пользователя. Попробуйте еще раз или обратитесь к администратору.';
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="text-red-500" size={16} />;
      case 'user':
      default:
        return <User className="text-blue-500" size={16} />;
    }
  };

  const getRoleText = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'user':
      default:
        return 'Пользователь';
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'user':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredUsers = filterRole === 'all' 
    ? users 
    : users.filter(user => (user.role || 'user') === filterRole);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление пользователями</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Всего пользователей: {users.length}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Plus size={20} />
            Добавить пользователя
          </button>
        </div>
      </div>

      {/* Role Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filterRole === 'all' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Все ({users.length})
          </button>
          {['user', 'admin'].map(role => {
            const count = users.filter(u => (u.role || 'user') === role).length;
            return (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filterRole === role ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {getRoleText(role)} ({count})
              </button>
            );
          })}
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
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="user">Пользователь</option>
                        <option value="admin">Администратор</option>
                      </select>
                      
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Добавить пользователя</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Минимум 6 символов"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Полное имя
                </label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Иван Иванов"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="+992 93 123 45 67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата рождения
                </label>
                <input
                  type="date"
                  value={newUser.date_of_birth}
                  onChange={(e) => setNewUser({ ...newUser, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Роль *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'user' | 'admin' })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="user">Пользователь</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={creating}
              >
                Отмена
              </button>
              <button
                onClick={createUser}
                disabled={creating || !newUser.email || !newUser.password}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Создание...' : 'Создать пользователя'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;