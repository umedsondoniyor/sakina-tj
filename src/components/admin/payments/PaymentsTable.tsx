import React from 'react';
import { Eye, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getStatusIcon, getStatusText, getStatusColor, getPaymentMethodIcon } from '../../../lib/paymentUtils';

interface Payment {
  id: string;
  alif_order_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'confirmed' | 'failed' | 'cancelled';
  alif_transaction_id?: string;
  user_id?: string;
  product_title?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  delivery_type?: string;
  delivery_address?: string;
  payment_gateway?: string;
  created_at: string;
  updated_at: string;
  order_summary?: Record<string, any>;
}

type SortField = 'created_at' | 'amount' | 'status' | 'customer_name';
type SortDirection = 'asc' | 'desc';

interface PaymentsTableProps {
  payments: Payment[];
  loading?: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onViewDetails: (payment: Payment) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onJumpToPage?: (page: number) => void;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  loading = false,
  sortField,
  sortDirection,
  onSort,
  onViewDetails,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onJumpToPage
}) => {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="text-gray-400" size={14} />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="text-teal-600" size={14} />
      : <ArrowDown className="text-teal-600" size={14} />;
  };

  // Скелетон при загрузке
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Дата', 'Заказ', 'Клиент', 'Товар', 'Сумма', 'Метод', 'Статус', 'Действия'].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Пустой список
  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Платежи не найдены</h3>
          <p className="mt-1 text-sm text-gray-500">
            Попробуйте изменить фильтры или диапазон дат
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th onClick={() => onSort('created_at')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                <div className="flex items-center space-x-1">
                  <span>Дата</span>
                  {getSortIcon('created_at')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Заказ</th>
              <th onClick={() => onSort('customer_name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                <div className="flex items-center space-x-1">
                  <span>Клиент</span>
                  {getSortIcon('customer_name')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
              <th onClick={() => onSort('amount')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                <div className="flex items-center space-x-1">
                  <span>Сумма</span>
                  {getSortIcon('amount')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Метод</th>
              <th onClick={() => onSort('status')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                <div className="flex items-center space-x-1">
                  <span>Статус</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{new Date(payment.created_at).toLocaleDateString('ru-RU')}</div>
                  <div className="text-xs text-gray-500">{new Date(payment.created_at).toLocaleTimeString('ru-RU')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payment.alif_order_id}</div>
                  {payment.alif_transaction_id && <div className="text-xs text-gray-500">TX: {payment.alif_transaction_id}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payment.customer_name || 'Неизвестно'}</div>
                  <div className="text-xs text-gray-500">{payment.customer_phone}</div>
                  <div className="text-xs text-gray-500">{payment.customer_email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">{payment.product_title || 'Товар не указан'}</div>
                  {payment.delivery_type && (
                    <div className="text-xs text-gray-500">{payment.delivery_type === 'home' ? 'Доставка' : 'Самовывоз'}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{Number(payment.amount).toLocaleString()} {payment.currency}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getPaymentMethodIcon(payment.payment_gateway)}
                    <span className="text-sm text-gray-900 capitalize">{payment.payment_gateway?.replace('_', ' ') || 'Неизвестно'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1">{getStatusText(payment.status)}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => onViewDetails(payment)} className="text-teal-600 hover:text-teal-800 flex items-center">
                    <Eye size={16} className="mr-1" />
                    Просмотр
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-4 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
              Назад
            </button>
            <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="ml-3 px-4 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
              Вперёд
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              Показано <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>–<span className="font-medium">{Math.min(currentPage * itemsPerPage, payments.length)}</span> из <span className="font-medium">{payments.length}</span>
            </p>
            {/* Остальная логика пагинации остаётся */}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTable;
