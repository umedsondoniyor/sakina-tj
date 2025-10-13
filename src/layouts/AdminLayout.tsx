import { Outlet } from 'react-router-dom';
import AdminNavigation from '@/components/admin/AdminNavigation';

export default function AdminLayout() {
  return (
    <div className="flex">
      <AdminNavigation />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
