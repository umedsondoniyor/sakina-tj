import { supabase } from '../lib/supabaseClient';
import type { UserRole } from '../hooks/useUserRole';

/**
 * Finds the first accessible menu item for a user based on their role
 * Menu items are ordered by section and then by their position in baseNavSections
 */
export async function getFirstAccessibleMenuPath(userRole: UserRole | null): Promise<string> {
  if (!userRole) {
    return '/admin';
  }

  // Special case: /admin (Dashboard) is always accessible to admin role only
  if (userRole === 'admin') {
    // Dashboard is always accessible to admins, return it as first option
    return '/admin';
  }

  // Menu order matches baseNavSections in AdminLayout.tsx
  const menuOrder: { section: string; items: { path: string }[] }[] = [
    {
      section: 'Главное',
      items: [{ path: '/admin' }],
    },
    {
      section: 'Контент',
      items: [
        { path: '/admin/carousel' },
        { path: '/admin/about' },
        { path: '/admin/mattresses' },
        { path: '/admin/services' },
        { path: '/admin/delivery-payment' },
        { path: '/admin/reviews' },
        { path: '/admin/blog' },
        { path: '/admin/navigation' },
      ],
    },
    {
      section: 'Товары',
      items: [
        { path: '/admin/products' },
        { path: '/admin/variants' },
        { path: '/admin/related-products' },
      ],
    },
    {
      section: 'Заказы и платежи',
      items: [
        { path: '/admin/one-click-orders' },
        { path: '/admin/payments' },
      ],
    },
    {
      section: 'Пользователи',
      items: [
        { path: '/admin/users' },
        { path: '/admin/club-members' },
        { path: '/admin/role-management' },
      ],
    },
    {
      section: 'Настройки',
      items: [
        { path: '/admin/quiz' },
        { path: '/admin/sms-templates' },
        { path: '/admin/showrooms' },
      ],
    },
  ];

  try {
    // Fetch menu permissions from database
    const { data: permissions, error } = await supabase
      .from('menu_role_permissions')
      .select('path, roles')
      .order('section', { ascending: true });

    if (error) {
      console.error('Error fetching menu permissions:', error);
      return '/admin';
    }

    // Create a map of path to roles for quick lookup
    const permissionsMap: Record<string, UserRole[]> = {};
    if (permissions) {
      permissions.forEach((item: any) => {
        if (item.path && Array.isArray(item.roles)) {
          permissionsMap[item.path] = item.roles as UserRole[];
        }
      });
    }

    // Iterate through menu order to find first accessible item
    for (const section of menuOrder) {
      for (const item of section.items) {
        const dbRoles = permissionsMap[item.path];

        // Check if user has access to this menu item
        if (dbRoles && dbRoles.length > 0 && dbRoles.includes(userRole)) {
          return item.path;
        }
      }
    }

    // Fallback: if no accessible menu found, return /admin
    return '/admin';
  } catch (error) {
    console.error('Error in getFirstAccessibleMenuPath:', error);
    return '/admin';
  }
}

