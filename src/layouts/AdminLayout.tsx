import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import AdminNavigation from '../components/admin/AdminNavigation';

/**
 * AdminLayout
 * Shared layout for all /admin pages.
 * - Responsive sidebar (collapsible on mobile)
 * - Uses Tailwind CSS
 * - Keeps content scrollable independently of sidebar
 */
const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Optional: close sidebar when route changes
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg
        transition-transform duration-300 ease-in-out lg:translate-x-0 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <Link to="/admin" className="text-xl font-semibold text-gray-800">
            Admin Panel
          </Link>
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Your existing AdminNavigation component */}
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          <AdminNavigation />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-white shadow px-4 py-3 lg:hidden">
          <button
            className="text-gray-700 hover:text-gray-900"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>
          <Link to="/admin" className="font-semibold text-gray-800">
            Admin Dashboard
          </Link>
          <div className="w-6" /> {/* placeholder to balance flex */}
        </div>

        {/* Main admin page area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
