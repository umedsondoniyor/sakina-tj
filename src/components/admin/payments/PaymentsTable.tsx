import React from 'react';
import { Eye, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getStatusIcon, getStatusText, getStatusColor, getPaymentMethodIcon } from '../../../lib/paymentUtils';

interface Payment {
  id: string;
  alif_order_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Date', 'Order ID', 'Customer', 'Product', 'Amount', 'Method', 'Status', 'Actions'].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No payments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Payments will appear here when customers make purchases
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
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('created_at')}
                aria-label="Sort by date"
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {getSortIcon('created_at')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('customer_name')}
                aria-label="Sort by customer name"
              >
                <div className="flex items-center space-x-1">
                  <span>Customer</span>
                  {getSortIcon('customer_name')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('amount')}
                aria-label="Sort by amount"
              >
                <div className="flex items-center space-x-1">
                  <span>Amount</span>
                  {getSortIcon('amount')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('status')}
                aria-label="Sort by status"
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div>{new Date(payment.created_at).toLocaleDateString('ru-RU')}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(payment.created_at).toLocaleTimeString('ru-RU')}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {payment.alif_order_id}
                  </div>
                  {payment.alif_transaction_id && (
                    <div className="text-xs text-gray-500">
                      TX: {payment.alif_transaction_id}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {payment.customer_name || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-500">{payment.customer_phone}</div>
                  <div className="text-xs text-gray-500">{payment.customer_email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {payment.product_title || 'No product specified'}
                  </div>
                  {payment.delivery_type && (
                    <div className="text-xs text-gray-500">
                      {payment.delivery_type === 'home' ? 'Доставка' : 'Самовывоз'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    {Number(payment.amount).toLocaleString()} {payment.currency}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getPaymentMethodIcon(payment.payment_gateway)}
                    <span className="text-sm text-gray-900 capitalize">
                      {payment.payment_gateway?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1">{getStatusText(payment.status)}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onViewDetails(payment)}
                    className="text-teal-600 hover:text-teal-800 flex items-center"
                    aria-label={`View details for payment ${payment.alif_order_id}`}
                  >
                    <Eye size={16} className="mr-1" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              aria-label="Go to previous page"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              aria-label="Go to next page"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, payments.length)}
                </span>{' '}
                of <span className="font-medium">{payments.length}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Jump to page input for large datasets */}
              {totalPages > 10 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Go to page:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        onJumpToPage?.(page);
                      }
                    }}
                    className="w-16 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-label="Jump to specific page"
                  />
                  <span className="text-sm text-gray-700">of {totalPages}</span>
                </div>
              )}
              
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Go to previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {/* Smart page number display */}
                {(() => {
                  const maxVisible = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                  
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  const pages = [];
                  
                  // Always show first page if not in range
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => onPageChange(1)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        aria-label="Go to page 1"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis1" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      );
                    }
                  }

                  // Show page range
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => onPageChange(i)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i
                            ? 'z-10 bg-teal-50 border-teal-500 text-teal-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                        aria-label={`Go to page ${i}`}
                        aria-current={currentPage === i ? 'page' : undefined}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Always show last page if not in range
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis2" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => onPageChange(totalPages)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        aria-label={`Go to page ${totalPages}`}
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}
                
                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Go to next page"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    );
  };

export default PaymentsTable;