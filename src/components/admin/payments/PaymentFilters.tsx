import React from 'react';
import { Search, RefreshCw, Download } from 'lucide-react';

interface PaymentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  paymentMethodFilter: string;
  setPaymentMethodFilter: (method: string) => void;
  dateRangeFilter: string;
  setDateRangeFilter: (range: string) => void;
  customDateFrom: string;
  setCustomDateFrom: (date: string) => void;
  customDateTo: string;
  setCustomDateTo: (date: string) => void;
  filteredCount: number;
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  onRefresh: () => void;
  loading?: boolean;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
  dateRangeFilter,
  setDateRangeFilter,
  customDateFrom,
  setCustomDateFrom,
  customDateTo,
  setCustomDateTo,
  filteredCount,
  totalCount,
  completedCount,
  pendingCount,
  failedCount,
  onRefresh,
  loading = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Заголовок и действия */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold">Фильтры и поиск</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            aria-label="Обновить список платежей"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Поиск по имени, email, телефону или заказу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Поиск по платежам"
          />
        </div>

        {/* Статус */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Фильтр по статусу"
        >
          <option value="all">Все статусы</option>
          <option value="completed">Завершён</option>
          <option value="confirmed">Подтвержден</option>
          <option value="pending">Ожидает</option>
          <option value="processing">В обработке</option>
          <option value="failed">Ошибка</option>
          <option value="cancelled">Отменён</option>
        </select>

        {/* Метод оплаты */}
        <select
          value={paymentMethodFilter}
          onChange={(e) => setPaymentMethodFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Фильтр по методу оплаты"
        >
          <option value="all">Все методы</option>
          <option value="alif_bank">Alif Bank</option>
          <option value="wallet">Кошелёк</option>
          <option value="cash">Наличные</option>
        </select>

        {/* Диапазон дат */}
        <select
          value={dateRangeFilter}
          onChange={(e) => setDateRangeFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Фильтр по дате"
        >
          <option value="all">За всё время</option>
          <option value="today">Сегодня</option>
          <option value="week">Последние 7 дней</option>
          <option value="month">Этот месяц</option>
          <option value="custom">Выбрать даты</option>
        </select>
      </div>

      {/* Кастомные даты */}
      {dateRangeFilter === 'custom' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">С даты</label>
            <input
              type="date"
              value={customDateFrom}
              onChange={(e) => setCustomDateFrom(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Дата начала"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">По дату</label>
            <input
              type="date"
              value={customDateTo}
              onChange={(e) => setCustomDateTo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Дата окончания"
            />
          </div>
        </div>
      )}

      {/* Сводка */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-600">
          Показано {filteredCount} из {totalCount} платежей
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Завершён: {completedCount} | Ожидает: {pendingCount} | Ошибка: {failedCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentFilters;
