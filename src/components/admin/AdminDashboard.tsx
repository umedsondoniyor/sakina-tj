import React from 'react';
import { BarChart3, Package, Users } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Админ Панель — Обзор</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <BarChart3 className="text-teal-500" size={28} />
          <div>
            <p className="text-gray-500 text-sm">Всего продаж</p>
            <p className="text-xl font-semibold">₸ 24,300</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <Package className="text-blue-500" size={28} />
          <div>
            <p className="text-gray-500 text-sm">Товары</p>
            <p className="text-xl font-semibold">152</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <Users className="text-teal-500" size={28} />
          <div>
            <p className="text-gray-500 text-sm">Пользователи</p>
            <p className="text-xl font-semibold">948</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
