import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Image, 
  Star, 
  Package, 
  Layers, 
  CircleHelp as HelpCircle, 
  LogOut, 
  Home, 
  Navigation, 
  MousePointer, 
  Users, 
  Target, 
  FileText, 
  MessageSquare, 
  CreditCard,
  ChevronRight,
  Menu,
  X,
  MapPin,
  User,
  Mail,
  Shield
} from 'lucide-react';
import { supabase } from "../lib/supabaseClient";
import Logo from "../components/Logo";
import { useUserRole, UserRole } from "../hooks/useUserRole";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { getFirstAccessibleMenuPath } from "../utils/getFirstAccessibleMenuPath";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  requiredRoles?: UserRole[]; // Roles that can access this menu item
}

interface NavSection {
  title: string;
  items: NavItem[];
}


const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [menuPermissions, setMenuPermissions] = useState<Record<string, UserRole[]>>({});
  const { role: userRole } = useUserRole();
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'editor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moderator':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'editor':
        return 'Редактор';
      case 'moderator':
        return 'Модератор';
      default:
        return 'Пользователь';
    }
  };

  // Helper function to check if user has access to a menu item
  // Only uses database permissions - empty array means no access
  // Special case: /admin (Dashboard) is always accessible to admin role only
  const hasAccess = useCallback((item: NavItem): boolean => {
    // Special case: /admin is always accessible to admin role only
    if (item.path === '/admin' && userRole === 'admin') {
      return true;
    }
    // If no requiredRoles or empty array, deny access (no permissions configured)
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return false;
    }
    // Check if user's role is in the required roles list
    const hasAccessResult = userRole ? item.requiredRoles.includes(userRole) : false;
    return hasAccessResult;
  }, [userRole]);

  // Initialize default permissions if database is empty (admin only)
  const initializeDefaultPermissions = async () => {
    // Only admins can initialize permissions
    if (userRole !== 'admin') {
      return false;
    }

    try {
      const { count, error: countError } = await supabase
        .from('menu_role_permissions')
        .select('*', { count: 'exact', head: true });

      if (countError && countError.code !== 'PGRST116') {
        return false; // Table might not exist, skip initialization
      }

      if (count === 0) {
        // Database is empty, initialize with defaults
        const defaultPermissions = [
          { path: '/admin', label: 'Панель управления', section: 'Главное', roles: [] },
          { path: '/admin/carousel', label: 'Карусель', section: 'Контент', roles: ['admin', 'editor'] },
          { path: '/admin/about', label: 'О компании', section: 'Контент', roles: ['admin', 'editor'] },
          { path: '/admin/mattresses', label: 'Матрасы', section: 'Контент', roles: ['admin', 'editor'] },
          { path: '/admin/services', label: 'Услуги', section: 'Контент', roles: ['admin', 'editor'] },
          { path: '/admin/delivery-payment', label: 'Доставка и оплата', section: 'Контент', roles: ['admin', 'editor'] },
          { path: '/admin/reviews', label: 'Отзывы', section: 'Контент', roles: ['admin', 'moderator', 'editor'] },
          { path: '/admin/blog', label: 'Блог', section: 'Контент', roles: ['admin', 'editor'] },
          { path: '/admin/navigation', label: 'Навигация', section: 'Контент', roles: ['admin'] },
          { path: '/admin/products', label: 'Товары', section: 'Товары', roles: ['admin', 'editor'] },
          { path: '/admin/variants', label: 'Варианты и склад', section: 'Товары', roles: ['admin'] },
          { path: '/admin/related-products', label: 'Сопутствующие товары', section: 'Товары', roles: ['admin', 'editor'] },
          { path: '/admin/one-click-orders', label: 'Заказы в 1 клик', section: 'Заказы и платежи', roles: ['admin', 'moderator'] },
          { path: '/admin/payments', label: 'Платежи', section: 'Заказы и платежи', roles: ['admin','moderator'] },
          { path: '/admin/users', label: 'Пользователи', section: 'Пользователи', roles: ['admin'] },
          { path: '/admin/club-members', label: 'Участники клуба', section: 'Пользователи', roles: ['admin', 'moderator'] },
          { path: '/admin/role-management', label: 'Управление ролями', section: 'Пользователи', roles: ['admin'] },
          { path: '/admin/quiz', label: 'Опросник', section: 'Настройки', roles: ['admin', 'editor'] },
          { path: '/admin/sms-templates', label: 'SMS Шаблоны', section: 'Настройки', roles: ['admin'] },
          { path: '/admin/showrooms', label: 'Шоурумы', section: 'Настройки', roles: ['admin', 'editor'] },
        ];

        const { error: insertError } = await supabase
          .from('menu_role_permissions')
          .insert(defaultPermissions.map(p => ({
            ...p,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })));

        if (insertError) {
          return false;
        }

        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  };

  // Fetch menu permissions from database
  useEffect(() => {
    const fetchMenuPermissions = async () => {
      try {
        // Try to initialize defaults if database is empty (only for admins)
        if (userRole === 'admin') {
          await initializeDefaultPermissions();
        }

        const { data, error } = await supabase
          .from('menu_role_permissions')
          .select('path, roles')
          .order('section', { ascending: true });

        if (error) {
          // If table doesn't exist or error occurs, use empty permissions
          setMenuPermissions({});
          return;
        }

        if (data && data.length > 0) {
          // Convert array to object for easy lookup
          const permissionsMap: Record<string, UserRole[]> = {};
          data.forEach((item: any) => {
            // Ensure roles is an array and properly typed
            if (item.path && Array.isArray(item.roles)) {
              permissionsMap[item.path] = item.roles as UserRole[];
            } else if (item.path) {
              permissionsMap[item.path] = [];
            }
          });
          setMenuPermissions(permissionsMap);
        } else {
          // No permissions in database
          setMenuPermissions({});
        }
      } catch (error) {
        setMenuPermissions({});
      }
    };

    fetchMenuPermissions();

    // Subscribe to changes in menu_role_permissions table
    const subscription = supabase
      .channel('menu_role_permissions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'menu_role_permissions' },
        () => {
          fetchMenuPermissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userRole]);

  // Redirect non-admin users away from /admin to their first accessible menu item
  useEffect(() => {
    const handleRedirect = async () => {
      // Only redirect if we're on /admin and user is not an admin
      if (location.pathname === '/admin' && userRole && userRole !== 'admin') {
        const firstAccessiblePath = await getFirstAccessibleMenuPath(userRole);
        
        if (firstAccessiblePath && firstAccessiblePath !== '/admin') {
          navigate(firstAccessiblePath, { replace: true });
        }
      }
    };

    if (userRole && menuPermissions && Object.keys(menuPermissions).length > 0) {
      handleRedirect();
    }
  }, [location.pathname, userRole, menuPermissions, navigate]);

  // Fetch pending counts for badges
  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        // Fetch pending orders
        const { count: ordersCount } = await supabase
          .from('one_click_orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch pending payments
        const { count: paymentsCount } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'processing']);

        setPendingOrders(ordersCount || 0);
        setPendingPayments(paymentsCount || 0);
      } catch (error) {
        // Silent fail - pending counts are non-critical
      }
    };

    fetchPendingCounts();

    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel('admin_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'one_click_orders' }, () => {
        fetchPendingCounts();
      })
      .subscribe();

    const paymentsSubscription = supabase
      .channel('admin_payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchPendingCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(paymentsSubscription);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // Base menu structure (no hardcoded roles - only structure)
  const baseNavSections: NavSection[] = useMemo(() => [
    {
      title: 'Главное',
      items: [
        { path: '/admin', label: 'Панель управления', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Контент',
      items: [
        { path: '/admin/carousel', label: 'Карусель', icon: Image },
        { path: '/admin/about', label: 'О компании', icon: Target },
        { path: '/admin/mattresses', label: 'Матрасы', icon: Package },
        { path: '/admin/services', label: 'Услуги', icon: Package },
        { path: '/admin/delivery-payment', label: 'Доставка и оплата', icon: CreditCard },
        { path: '/admin/reviews', label: 'Отзывы', icon: Star },
        { path: '/admin/blog', label: 'Блог', icon: FileText },
        { path: '/admin/navigation', label: 'Навигация', icon: Navigation },
      ],
    },
    {
      title: 'Товары',
      items: [
        { path: '/admin/products', label: 'Товары', icon: Package },
        { path: '/admin/variants', label: 'Варианты и склад', icon: Layers },
        { path: '/admin/related-products', label: 'Сопутствующие товары', icon: Package },
      ],
    },
    {
      title: 'Заказы и платежи',
      items: [
        { 
          path: '/admin/one-click-orders', 
          label: 'Заказы в 1 клик', 
          icon: MousePointer,
          badge: pendingOrders,
        },
        { 
          path: '/admin/payments', 
          label: 'Платежи', 
          icon: CreditCard,
          badge: pendingPayments,
        },
      ],
    },
    {
      title: 'Пользователи',
      items: [
        { path: '/admin/users', label: 'Пользователи', icon: Users },
        { path: '/admin/club-members', label: 'Участники клуба', icon: Users },
        { path: '/admin/role-management', label: 'Управление ролями', icon: Shield },
      ],
    },
    {
      title: 'Настройки',
      items: [
        { path: '/admin/quiz', label: 'Опросник', icon: HelpCircle },
        { path: '/admin/sms-templates', label: 'SMS Шаблоны', icon: MessageSquare },
        { path: '/admin/showrooms', label: 'Шоурумы', icon: MapPin },
      ],
    },
  ], [pendingOrders, pendingPayments]);

  // Merge database permissions with base menu structure
  // Only use database permissions - no fallback
  // Special case: role-management always visible to admins (needed to configure permissions)
  const navSections: NavSection[] = useMemo(() => {
    return baseNavSections.map(section => ({
      ...section,
      items: section.items.map(item => {
        // Special case: role-management always accessible to admins
        if (item.path === '/admin/role-management' && userRole === 'admin') {
          return {
            ...item,
            requiredRoles: ['admin']
          };
        }
        // Only use database permissions - if not found, item won't be shown
        const dbPermissions = menuPermissions[item.path];
        const finalRoles = dbPermissions !== undefined ? dbPermissions : []; // Empty array = no access
        return {
          ...item,
          requiredRoles: finalRoles
        };
      })
    }));
  }, [baseNavSections, menuPermissions, userRole]);

  // Filter menu sections and items based on user role
  const filteredNavSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(hasAccess)
  })).filter(section => section.items.length > 0); // Remove empty sections

  const NavItemComponent: React.FC<{ item: NavItem }> = ({ item }) => {
    const isActive = location.pathname === item.path || 
      (item.path !== '/admin' && location.pathname.startsWith(item.path));
    
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-brand-turquoise text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'
          }`
        }
      >
        <div className="flex items-center space-x-3">
          <item.icon 
            size={20} 
            className={location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
              ? 'text-white' 
              : 'text-gray-500 group-hover:text-teal-600'
            } 
          />
          <span className="font-medium text-sm">{item.label}</span>
        </div>
        {item.badge !== undefined && item.badge > 0 && (
          <span className={`
            px-2 py-0.5 rounded-full text-xs font-semibold
            ${isActive 
              ? 'bg-white text-teal-600' 
              : 'bg-red-500 text-white'
            }
          `}>
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Logo variant="horizontal" className="h-8" />
          </div>
          <div className="flex items-center gap-3">
            {/* Current User Info */}
            {!userLoading && currentUser && (
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-brand-turquoise/10 to-teal-50 rounded-lg border border-brand-turquoise/20 shadow-sm">
                <div className="p-2 bg-brand-turquoise rounded-full">
                  <User className="text-white" size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">
                      {currentUser.full_name || currentUser.email || 'Пользователь'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(currentUser.role)}`}>
                      {getRoleLabel(currentUser.role)}
                    </span>
                  </div>
                  {currentUser.email && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                      <Mail size={12} className="text-gray-400" />
                      <span className="truncate max-w-[200px]">{currentUser.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
          {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] 
          w-64 bg-white border-r border-gray-200 
          transition-transform duration-300 ease-in-out z-30
          overflow-y-auto
        `}>
          <nav className="p-4 space-y-6">
            {filteredNavSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavItemComponent key={item.path} item={item} />
                  ))}
                </div>
              </div>
            ))}

            {/* External Link */}
            <div className="pt-4 border-t border-gray-200">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-teal-600 transition-colors group"
              >
                <Home size={20} className="text-gray-500 group-hover:text-teal-600" />
                <span className="font-medium text-sm">Открыть сайт</span>
                <ChevronRight size={16} className="ml-auto text-gray-400 group-hover:text-teal-600" />
              </a>
            </div>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

          {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Outlet />
          </div>
          </main>
      </div>
    </div>
  );
};

export default AdminLayout;
