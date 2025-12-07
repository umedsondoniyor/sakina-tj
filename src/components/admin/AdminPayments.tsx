import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import PaymentStats from './payments/PaymentStats';
import PaymentFilters from './payments/PaymentFilters';
import PaymentsTable from './payments/PaymentsTable';
import PaymentDetailModal from './payments/PaymentDetailModal';

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
  alif_callback_payload?: Record<string, any>;
}

interface PaymentStatsData {
  totalRevenue: number;
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  todayRevenue: number;
}

type SortField = 'created_at' | 'amount' | 'status' | 'customer_name';
type SortDirection = 'asc' | 'desc';

const AdminPayments: React.FC = () => {
  // --- state ---
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState<PaymentStatsData>({
    totalRevenue: 0,
    totalTransactions: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    todayRevenue: 0,
  });

  // --- fetch + realtime ---
  useEffect(() => {
    fetchPayments();

    const subscription = supabase
      .channel('payments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchPayments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayments(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      console.error('Ошибка загрузки платежей:', error);
      toast.error(`Не удалось загрузить платежи: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData: Payment[]) => {
    const today = new Date().toISOString().split('T')[0];

    const newStats: PaymentStatsData = {
      totalRevenue: 0,
      totalTransactions: paymentsData.length,
      completedTransactions: 0,
      pendingTransactions: 0,
      failedTransactions: 0,
      todayRevenue: 0,
    };

    paymentsData.forEach((payment) => {
      const amount = Number(payment.amount) || 0;

      if (payment.status === 'completed') {
        newStats.totalRevenue += amount;
        newStats.completedTransactions++;

        if (payment.created_at.startsWith(today)) {
          newStats.todayRevenue += amount;
        }
      } else if (payment.status === 'confirmed') {
        newStats.pendingTransactions++; // Count confirmed as pending for stats
      } else if (payment.status === 'pending' || payment.status === 'processing') {
        newStats.pendingTransactions++;
      } else if (payment.status === 'failed' || payment.status === 'cancelled') {
        newStats.failedTransactions++;
      }
    });

    setStats(newStats);
  };

  // --- filtering, sorting, pagination ---
  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.customer_name?.toLowerCase().includes(query) ||
          payment.customer_email?.toLowerCase().includes(query) ||
          payment.customer_phone?.includes(query) ||
          payment.alif_order_id.toLowerCase().includes(query) ||
          payment.product_title?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.payment_gateway === paymentMethodFilter);
    }

    if (dateRangeFilter !== 'all') {
      const now = new Date();
      let startDate: Date | undefined;

      switch (dateRangeFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'custom':
          if (customDateFrom) {
            startDate = new Date(customDateFrom);
            const endDate = customDateTo ? new Date(customDateTo) : now;
            filtered = filtered.filter((payment) => {
              const paymentDate = new Date(payment.created_at);
              return paymentDate >= startDate! && paymentDate <= endDate;
            });
          }
          break;
      }

      if (dateRangeFilter !== 'custom' && startDate) {
        filtered = filtered.filter((payment) => new Date(payment.created_at) >= startDate!);
      }
    }

    return filtered;
  }, [payments, searchQuery, statusFilter, paymentMethodFilter, dateRangeFilter, customDateFrom, customDateTo]);

  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'amount') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      return sortDirection === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
  }, [filteredPayments, sortField, sortDirection]);

  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedPayments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedPayments.length / itemsPerPage);

  // --- handlers ---
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDeletePayment = useCallback(
    async (paymentId: string) => {
      if (!confirm('Вы уверены, что хотите удалить этот платёж? Это действие нельзя отменить.')) return;

      const originalPayments = payments;
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      setShowDetailModal(false);
      setSelectedPayment(null);
      toast.success('Платёж успешно удалён');

      try {
        const { error } = await supabase.from('payments').delete().eq('id', paymentId);
        if (error) throw error;
      } catch (error) {
        setPayments(originalPayments);
        console.error('Ошибка удаления платежа:', error);
        toast.error('Не удалось удалить платёж');
      }
    },
    [payments]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Управление платежами</h1>
          <p className="text-gray-600">Просмотр и управление всеми транзакциями</p>
        </div>
      </div>

      {/* Stats */}
      <PaymentStats stats={stats} loading={loading} />

      {/* Filters */}
      <PaymentFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentMethodFilter={paymentMethodFilter}
        setPaymentMethodFilter={setPaymentMethodFilter}
        dateRangeFilter={dateRangeFilter}
        setDateRangeFilter={setDateRangeFilter}
        customDateFrom={customDateFrom}
        setCustomDateFrom={setCustomDateFrom}
        customDateTo={customDateTo}
        setCustomDateTo={setCustomDateTo}
        filteredCount={filteredPayments.length}
        totalCount={payments.length}
        completedCount={stats.completedTransactions}
        pendingCount={stats.pendingTransactions}
        failedCount={stats.failedTransactions}
        onRefresh={fetchPayments}
        loading={loading}
      />

      {/* Table */}
      <PaymentsTable
        payments={paginatedPayments}
        loading={loading}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onViewDetails={(p) => {
          setSelectedPayment(p);
          setShowDetailModal(true);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Modal */}
      {showDetailModal && selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onDelete={handleDeletePayment}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPayment(null);
          }}
          onStatusUpdate={fetchPayments}
          isOpen
        />
      )}
    </div>
  );
};

export default AdminPayments;
