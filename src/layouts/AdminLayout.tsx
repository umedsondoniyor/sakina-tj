import { Outlet } from 'react-router-dom';
import AdminNavigation from '@/components/admin/AdminNavigation';

const AdminLayout: React.FC = () => {
  return (
    <>
      {/* Optional: skip link for accessibility */}
    <div className="flex">
      <AdminNavigation />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </div>
    </>
  );
};

export default PublicLayout;
