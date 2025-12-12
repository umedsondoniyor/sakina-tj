import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Shield, Save, RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserRole } from '../../hooks/useUserRole';

interface MenuItem {
  path: string;
  label: string;
  section: string;
  requiredRoles: UserRole[];
}

const AdminRoleManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // All available roles
  const allRoles: UserRole[] = ['admin', 'editor', 'moderator', 'user'];

  // Get role label
  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'editor':
        return 'Редактор';
      case 'moderator':
        return 'Модератор';
      case 'user':
        return 'Пользователь';
      default:
        return role;
    }
  };

  // Get role color
  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'editor':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'moderator':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'user':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Default menu items (matches AdminLayout structure)
  const getDefaultMenuItems = (): MenuItem[] => [
    { path: '/admin', label: 'Панель управления', section: 'Главное', requiredRoles: [] },
    { path: '/admin/carousel', label: 'Карусель', section: 'Контент', requiredRoles: ['admin', 'editor'] },
    { path: '/admin/about', label: 'О компании', section: 'Контент', requiredRoles: ['admin', 'editor'] },
    { path: '/admin/mattresses', label: 'Матрасы', section: 'Контент', requiredRoles: ['admin', 'editor'] },
    { path: '/admin/services', label: 'Услуги', section: 'Контент', requiredRoles: ['admin', 'editor'] },
    { path: '/admin/delivery-payment', label: 'Доставка и оплата', section: 'Контент', requiredRoles: ['admin', 'editor'] },
    { path: '/admin/reviews', label: 'Отзывы', section: 'Контент', requiredRoles: ['admin', 'moderator', 'editor'] },
    { path: '/admin/blog', label: 'Блог', section: 'Контент', requiredRoles: ['admin', 'editor'] },
    { path: '/admin/navigation', label: 'Навигация', section: 'Контент', requiredRoles: ['admin'] },
    { path: '/admin/products', label: 'Товары', section: 'Товары', requiredRoles: ['admin', 'editor'] },
    { path: '/admin/variants', label: 'Варианты и склад', section: 'Товары', requiredRoles: ['admin'] },
    { path: '/admin/related-products', label: 'Сопутствующие товары', section: 'Товары', requiredRoles: ['admin', 'editor'] },
    { path: '/admin/one-click-orders', label: 'Заказы в 1 клик', section: 'Заказы и платежи', requiredRoles: ['admin', 'moderator'] },
    { path: '/admin/payments', label: 'Платежи', section: 'Заказы и платежи', requiredRoles: ['admin', 'moderator'] },
    { path: '/admin/users', label: 'Пользователи', section: 'Пользователи', requiredRoles: ['admin'] },
    { path: '/admin/club-members', label: 'Участники клуба', section: 'Пользователи', requiredRoles: ['admin', 'moderator'] },
    { path: '/admin/role-management', label: 'Управление ролями', section: 'Пользователи', requiredRoles: ['admin'] },
    { path: '/admin/quiz', label: 'Опросник', section: 'Настройки', requiredRoles: ['admin', 'editor'] },
    { path: '/admin/sms-templates', label: 'SMS Шаблоны', section: 'Настройки', requiredRoles: ['admin'] },
    { path: '/admin/showrooms', label: 'Шоурумы', section: 'Настройки', requiredRoles: ['admin', 'editor'] },
  ];

  // Initialize default permissions in database if none exist
  const initializeDefaultPermissions = useCallback(async () => {
    try {
      const { count, error: countError } = await supabase
        .from('menu_role_permissions')
        .select('*', { count: 'exact', head: true });

      if (countError && countError.code !== 'PGRST116') {
        console.error('Error checking menu permissions:', countError);
        return false;
      }

      // If database is empty, initialize with defaults
      if (count === 0) {
        const defaultItems = getDefaultMenuItems();
        const permissionsToInsert = defaultItems.map(item => ({
          path: item.path,
          label: item.label,
          section: item.section,
          roles: item.requiredRoles,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: insertError } = await supabase
          .from('menu_role_permissions')
          .insert(permissionsToInsert);

        if (insertError) {
          console.error('Error initializing default permissions:', insertError);
          return false;
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error initializing permissions:', error);
      return false;
    }
  }, []);

  // Load menu items from database or use defaults
  const loadMenuItems = useCallback(async () => {
    try {
      // Try to initialize defaults if database is empty
      await initializeDefaultPermissions();

      // Try to load from database
      const { data: dbConfig, error } = await supabase
        .from('menu_role_permissions')
        .select('*')
        .order('section', { ascending: true })
        .order('label', { ascending: true });

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading menu permissions:', error);
      }

      if (dbConfig && dbConfig.length > 0) {
        // Convert database format to component format
        const items: MenuItem[] = dbConfig.map((item: any) => ({
          path: item.path,
          label: item.label,
          section: item.section,
          requiredRoles: item.roles || [],
        }));
        setMenuItems(items);
      } else {
        // Use default menu items as fallback (if database still empty after init attempt)
        const defaultItems = getDefaultMenuItems();
        setMenuItems(defaultItems);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast.error('Не удалось загрузить настройки меню');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  // Toggle role for a menu item
  const toggleRole = (path: string, role: UserRole) => {
    setMenuItems(prev => prev.map(item => {
      if (item.path === path) {
        const newRoles = item.requiredRoles.includes(role)
          ? item.requiredRoles.filter(r => r !== role)
          : [...item.requiredRoles, role];
        return { ...item, requiredRoles: newRoles };
      }
      return item;
    }));
    setHasChanges(true);
  };

  // Save menu permissions to database
  const savePermissions = async () => {
    setSaving(true);
    try {
      // Use upsert to update existing or insert new permissions
      const permissionsToUpsert = menuItems.map(item => ({
        path: item.path,
        label: item.label,
        section: item.section,
        roles: item.requiredRoles,
        updated_at: new Date().toISOString(),
      }));

      console.log('Saving permissions:', permissionsToUpsert);

      const { data, error: upsertError } = await supabase
        .from('menu_role_permissions')
        .upsert(permissionsToUpsert, {
          onConflict: 'path',
          ignoreDuplicates: false
        })
        .select();

      if (upsertError) {
        console.error('Error upserting permissions:', upsertError);
        throw upsertError;
      }

      console.log('Permissions saved successfully:', data);

      // Also delete any permissions that are not in the current menu items
      const currentPaths = menuItems.map(item => item.path);
      if (currentPaths.length > 0) {
        // Get all existing paths from database
        const { data: allPaths } = await supabase
          .from('menu_role_permissions')
          .select('path');
        
        if (allPaths) {
          const pathsToDelete = allPaths
            .map(p => p.path)
            .filter(path => !currentPaths.includes(path));
          
          if (pathsToDelete.length > 0) {
            const { error: deleteError } = await supabase
              .from('menu_role_permissions')
              .delete()
              .in('path', pathsToDelete);

            if (deleteError) {
              console.warn('Error cleaning up old permissions:', deleteError);
              // Don't throw - this is just cleanup
            }
          }
        }
      }

      toast.success('Настройки ролей успешно сохранены');
      setHasChanges(false);
      
      // Reload to ensure UI is in sync
      await loadMenuItems();
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      toast.error(error?.message || 'Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  // Group menu items by section
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-brand-turquoise" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-brand-turquoise" size={28} />
            Управление ролями меню
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Настройте, какие роли имеют доступ к каким разделам меню
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadMenuItems}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            <RefreshCw size={16} />
            Обновить
          </button>
          <button
            onClick={savePermissions}
            disabled={saving || !hasChanges}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save size={16} />
                Сохранить изменения
              </>
            )}
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          У вас есть несохраненные изменения. Не забудьте сохранить!
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">{section}</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.path} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{item.label}</h3>
                      <p className="text-sm text-gray-500 font-mono">{item.path}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allRoles.map((role) => {
                        const isEnabled = item.requiredRoles.includes(role);
                        return (
                          <button
                            key={role}
                            onClick={() => toggleRole(item.path, role)}
                            className={`
                              px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                              ${isEnabled
                                ? `${getRoleColor(role)} border-current shadow-sm`
                                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                              }
                            `}
                          >
                            <div className="flex items-center gap-1.5">
                              {isEnabled ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                <XCircle size={14} />
                              )}
                              {getRoleLabel(role)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {menuItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Нет элементов меню
          </h3>
          <p className="text-sm text-gray-500">
            Элементы меню будут отображаться здесь после загрузки.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminRoleManagement;
