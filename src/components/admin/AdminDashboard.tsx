import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Image,
  Star, 
  Package,
  Layers,
  LogOut,
  Home
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import Logo from '../Logo';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo variant="horizontal" />
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut size={20} className="mr-2" />
            Выйти
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <nav className="w-64 bg-white rounded-lg shadow p-4">
            <div className="space-y-2">
              <NavLink
                to="/admin/carousel"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Image size={20} />
                <span>Карусель</span>
              </NavLink>

              <NavLink
                to="/admin/reviews"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Star size={20} />
                <span>Отзывы</span>
              </NavLink>

              <NavLink
                to="/admin/products"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Package size={20} />
                <span>Товары</span>
              </NavLink>

              <NavLink
                to="/admin/variants"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Layers size={20} />
                <span>Размеры товаров</span>
              </NavLink>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Home size={20} />
                <span>Открыть сайт</span>
              </a>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 bg-white rounded-lg shadow p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;