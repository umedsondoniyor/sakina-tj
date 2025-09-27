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
  onExport: () => void;
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
  onExport,
  loading = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold">Filters & Search</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            aria-label="Refresh payments data"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={onExport}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            aria-label="Export payments to CSV"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Search payments by customer name, email, phone, or order ID"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Filter by payment status"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Payment Method Filter */}
        <select
          value={paymentMethodFilter}
          onChange={(e) => setPaymentMethodFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Filter by payment method"
        >
          <option value="all">All Methods</option>
          <option value="alif_bank">Alif Bank</option>
          <option value="wallet">Wallet</option>
          <option value="cash">Cash</option>
        </select>

        {/* Date Range Filter */}
        <select
          value={dateRangeFilter}
          onChange={(e) => setDateRangeFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Filter by date range"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {/* Custom Date Range */}
      {dateRangeFilter === 'custom' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={customDateFrom}
              onChange={(e) => setCustomDateFrom(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Start date for custom range"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={customDateTo}
              onChange={(e) => setCustomDateTo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="End date for custom range"
            />
          </div>
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-600">
          Showing {filteredCount} of {totalCount} payments
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Completed: {completedCount} | 
            Pending: {pendingCount} | 
            Failed: {failedCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentFilters;