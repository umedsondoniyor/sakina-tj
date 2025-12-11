import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Award,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalUsers: number;
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  revenueChange: number; // percentage change from yesterday
  // Club Members stats
  totalClubMembers: number;
  activeClubMembers: number;
  bronzeMembers: number;
  silverMembers: number;
  goldMembers: number;
  platinumMembers: number;
  totalClubPoints: number;
  totalClubPurchases: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    todayRevenue: 0,
    yesterdayRevenue: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalUsers: 0,
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
    revenueChange: 0,
    totalClubMembers: 0,
    activeClubMembers: 0,
    bronzeMembers: 0,
    silverMembers: 0,
    goldMembers: 0,
    platinumMembers: 0,
    totalClubPoints: 0,
    totalClubPurchases: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    
    // Set up real-time subscriptions
    const paymentsSubscription = supabase
      .channel('dashboard_payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchDashboardStats();
      })
      .subscribe();

    const ordersSubscription = supabase
      .channel('dashboard_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'one_click_orders' }, () => {
        fetchDashboardStats();
      })
      .subscribe();

    const clubMembersSubscription = supabase
      .channel('dashboard_club_members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'club_members' }, () => {
        fetchDashboardStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(paymentsSubscription);
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(clubMembersSubscription);
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.toISOString();
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStart = yesterday.toISOString();
      const yesterdayEnd = today.toISOString();

      // Fetch all data in parallel
      const [
        productsResult,
        ordersResult,
        usersResult,
        paymentsResult,
        todayPaymentsResult,
        yesterdayPaymentsResult,
        clubMembersResult,
      ] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('one_click_orders').select('*'),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('*'),
        supabase.from('payments')
          .select('*')
          .gte('created_at', todayStart)
          .eq('status', 'completed'),
        supabase.from('payments')
          .select('*')
          .gte('created_at', yesterdayStart)
          .lt('created_at', yesterdayEnd)
          .eq('status', 'completed'),
        supabase.from('club_members').select('*'),
      ]);

      // Calculate statistics
      const products = productsResult.count || 0;
      const orders = ordersResult.data || [];
      const users = usersResult.count || 0;
      const payments = paymentsResult.data || [];
      const todayPayments = todayPaymentsResult.data || [];
      const yesterdayPayments = yesterdayPaymentsResult.data || [];
      const clubMembers = clubMembersResult.data || [];

      // Calculate revenue
      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const todayRevenue = todayPayments
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const yesterdayRevenue = yesterdayPayments
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      // Calculate revenue change percentage
      const revenueChange = yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : (todayRevenue > 0 ? 100 : 0);

      // Calculate order statistics
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const completedOrders = orders.filter(o => o.status === 'completed').length;

      // Calculate payment statistics
      const completedPayments = payments.filter(p => p.status === 'completed').length;
      const pendingPayments = payments.filter(p => 
        p.status === 'pending' || p.status === 'processing'
      ).length;

      // Calculate club members statistics
      const activeClubMembers = clubMembers.filter(m => m.is_active).length;
      const bronzeMembers = clubMembers.filter(m => m.member_tier === 'bronze').length;
      const silverMembers = clubMembers.filter(m => m.member_tier === 'silver').length;
      const goldMembers = clubMembers.filter(m => m.member_tier === 'gold').length;
      const platinumMembers = clubMembers.filter(m => m.member_tier === 'platinum').length;
      const totalClubPoints = clubMembers.reduce((sum, m) => sum + (m.points || 0), 0);
      const totalClubPurchases = clubMembers.reduce((sum, m) => sum + (Number(m.total_purchases) || 0), 0);

      setStats({
        totalRevenue,
        todayRevenue,
        yesterdayRevenue,
        totalProducts: products,
        totalOrders: orders.length,
        pendingOrders,
        completedOrders,
        totalUsers: users,
        totalPayments: payments.length,
        completedPayments,
        pendingPayments,
        revenueChange,
        totalClubMembers: clubMembers.length,
        activeClubMembers,
        bronzeMembers,
        silverMembers,
        goldMembers,
        platinumMembers,
        totalClubPoints,
        totalClubPurchases,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Не удалось загрузить статистику');
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    iconColor: string;
    trend?: number;
    subtitle?: string;
  }> = ({ title, value, icon: Icon, iconColor, trend, subtitle }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend !== undefined && trend !== 0 && (
              <div className={`flex items-center gap-1 text-xs font-medium ${
                trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend > 0 ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                <span>{Math.abs(trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconColor} bg-opacity-10`}>
          <Icon className={iconColor} size={24} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
          <p className="text-gray-500 mt-1">Обзор статистики и показателей</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy transition-colors text-sm font-medium"
          >
            Обновить
          </button>
        </div>
      </div>

      {/* Revenue Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Финансы</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Общий доход"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            iconColor="text-green-600"
            subtitle="За все время"
          />
          <StatCard
            title="Доход за сегодня"
            value={formatCurrency(stats.todayRevenue)}
            icon={TrendingUp}
            iconColor="text-blue-600"
            trend={stats.revenueChange}
            subtitle={stats.yesterdayRevenue > 0 
              ? `Вчера: ${formatCurrency(stats.yesterdayRevenue)}`
              : 'Первый день продаж'
            }
          />
          <StatCard
            title="Всего платежей"
            value={stats.totalPayments}
            icon={BarChart3}
            iconColor="text-teal-600"
            subtitle={`${stats.completedPayments} успешных`}
          />
          <StatCard
            title="Ожидающие платежи"
            value={stats.pendingPayments}
            icon={Clock}
            iconColor="text-yellow-600"
            subtitle="Требуют внимания"
          />
        </div>
      </div>

      {/* Orders & Products Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Заказы и товары</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Всего заказов"
            value={stats.totalOrders}
            icon={ShoppingCart}
            iconColor="text-teal-600"
            subtitle={`${stats.completedOrders} выполнено`}
          />
          <StatCard
            title="Ожидающие заказы"
            value={stats.pendingOrders}
            icon={AlertCircle}
            iconColor="text-orange-600"
            subtitle="Требуют обработки"
          />
          <StatCard
            title="Выполненные заказы"
            value={stats.completedOrders}
            icon={CheckCircle}
            iconColor="text-green-600"
            subtitle={`${stats.totalOrders > 0 
              ? Math.round((stats.completedOrders / stats.totalOrders) * 100) 
              : 0}% от всех`
            }
          />
          <StatCard
            title="Товары в каталоге"
            value={stats.totalProducts}
            icon={Package}
            iconColor="text-blue-600"
            subtitle="Активных товаров"
          />
        </div>
      </div>

      {/* Users Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Пользователи</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Всего пользователей"
            value={stats.totalUsers}
            icon={Users}
            iconColor="text-indigo-600"
            subtitle="Зарегистрировано"
          />
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Статистика платежей</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  Успешные
                </span>
                <span className="font-semibold text-gray-900">
                  {stats.completedPayments}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="text-yellow-500" size={16} />
                  Ожидающие
                </span>
                <span className="font-semibold text-gray-900">
                  {stats.pendingPayments}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <XCircle className="text-red-500" size={16} />
                  Неудачные
                </span>
                <span className="font-semibold text-gray-900">
                  {stats.totalPayments - stats.completedPayments - stats.pendingPayments}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Статистика заказов</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  Выполнено
                </span>
                <span className="font-semibold text-gray-900">
                  {stats.completedOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="text-yellow-500" size={16} />
                  Ожидающие
                </span>
                <span className="font-semibold text-gray-900">
                  {stats.pendingOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <XCircle className="text-red-500" size={16} />
                  Отменено
                </span>
                <span className="font-semibold text-gray-900">
                  {stats.totalOrders - stats.completedOrders - stats.pendingOrders}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-lg shadow-sm text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-teal-100">Конверсия</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-3xl font-bold">
                  {stats.totalUsers > 0 
                    ? Math.round((stats.completedOrders / stats.totalUsers) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-teal-100 mt-1">
                  Пользователей → Заказов
                </p>
              </div>
              <div className="pt-2 border-t border-teal-400">
                <p className="text-sm text-teal-100">
                  {stats.totalPayments > 0 
                    ? Math.round((stats.completedPayments / stats.totalPayments) * 100) 
                    : 0}% успешных платежей
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Club Members Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Клуб Sakina</h2>
          <button
            onClick={() => navigate('/admin/club-members')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
          >
            Управление участниками
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Всего участников"
            value={stats.totalClubMembers}
            icon={Users}
            iconColor="text-purple-600"
            subtitle={`${stats.activeClubMembers} активных`}
          />
          <StatCard
            title="Всего баллов"
            value={stats.totalClubPoints.toLocaleString()}
            icon={Star}
            iconColor="text-yellow-600"
            subtitle="Накоплено участниками"
          />
          <StatCard
            title="Покупки участников"
            value={formatCurrency(stats.totalClubPurchases)}
            icon={DollarSign}
            iconColor="text-green-600"
            subtitle="Общая сумма"
          />
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Award className="text-purple-500" size={18} />
                Уровни участников
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Бронза
                </span>
                <span className="font-semibold text-gray-900">{stats.bronzeMembers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  Серебро
                </span>
                <span className="font-semibold text-gray-900">{stats.silverMembers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  Золото
                </span>
                <span className="font-semibold text-gray-900">{stats.goldMembers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Платина
                </span>
                <span className="font-semibold text-gray-900">{stats.platinumMembers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
