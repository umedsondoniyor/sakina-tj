import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { supabase } from "../lib/supabaseClient";
import Logo from "../components/Logo";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
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
        console.error('Error fetching pending counts:', error);
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

  const navSections: NavSection[] = [
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
      ],
    },
    {
      title: 'Заказы и платежи',
      items: [
        { 
          path: '/admin/one-click-orders', 
          label: 'Заказы в 1 клик', 
          icon: MousePointer,
          badge: pendingOrders 
        },
        { 
          path: '/admin/payments', 
          label: 'Платежи', 
          icon: CreditCard,
          badge: pendingPayments 
        },
      ],
    },
    {
      title: 'Пользователи',
      items: [
        { path: '/admin/users', label: 'Пользователи', icon: Users },
      ],
    },
    {
      title: 'Настройки',
      items: [
        { path: '/admin/quiz', label: 'Опросник', icon: HelpCircle },
        { path: '/admin/sms-templates', label: 'SMS Шаблоны', icon: MessageSquare },
      ],
    },
  ];

  const NavItemComponent: React.FC<{ item: NavItem }> = ({ item }) => {
    const isActive = location.pathname === item.path || 
      (item.path !== '/admin' && location.pathname.startsWith(item.path));
    
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-teal-500 text-white shadow-md'
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
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Выйти</span>
          </button>
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
            {navSections.map((section, sectionIndex) => (
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
