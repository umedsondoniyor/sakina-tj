import React from 'react';
import { DollarSign, TrendingUp, Users, CircleCheck as CheckCircle } from 'lucide-react';

interface PaymentStatsData {
  totalRevenue: number;
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  todayRevenue: number;
}

interface PaymentStatsProps {
  stats: PaymentStatsData;
  loading?: boolean;
}

const PaymentStats: React.FC<PaymentStatsProps> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const successRate = stats.totalTransactions > 0 
    ? Math.round((stats.completedTransactions / stats.totalTransactions) * 100)
    : 0;

  // Динамический цвет для Success Rate
  const successColor =
    successRate >= 80 ? "text-teal-600" :
    successRate >= 50 ? "text-yellow-600" :
    "text-red-600";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Всего доход</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalRevenue.toLocaleString('ru-RU')} TJS
            </p>
          </div>
          <DollarSign className="text-green-600" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Доход за сегодня</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.todayRevenue.toLocaleString('ru-RU')} TJS
            </p>
          </div>
          <TrendingUp className="text-blue-600" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Всего транзакций</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
          </div>
          <Users className="text-gray-600" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Успешные платежи</p>
            <p className={`text-2xl font-bold ${successColor}`}>{successRate}%</p>
          </div>
          <CheckCircle className={successColor} size={24} />
        </div>
      </div>
    </div>
  );
};

export default PaymentStats;
