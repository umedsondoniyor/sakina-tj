import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Users, Star, Percent, TrendingUp, Search, Filter, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ClubMember } from '../../lib/types';
import Modal from './ui/Modal';

const AdminClubMembers = () => {
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMember, setActiveMember] = useState<ClubMember | null>(null);
  const [formData, setFormData] = useState({
    points: 0,
    total_purchases: 0,
    discount_percentage: 0,
    member_tier: 'bronze' as 'bronze' | 'silver' | 'gold' | 'platinum',
    is_active: true,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('club_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching club members:', error);
      toast.error('Ошибка загрузки участников клуба');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (member: ClubMember) => {
    setActiveMember(member);
    setFormData({
      points: member.points,
      total_purchases: member.total_purchases,
      discount_percentage: member.discount_percentage,
      member_tier: member.member_tier,
      is_active: member.is_active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveMember(null);
  };

  const handleSave = async () => {
    if (!activeMember) return;

    try {
      const { error } = await supabase
        .from('club_members')
        .update({
          points: formData.points,
          total_purchases: formData.total_purchases,
          discount_percentage: formData.discount_percentage,
          member_tier: formData.member_tier,
          is_active: formData.is_active,
        })
        .eq('id', activeMember.id);

      if (error) throw error;

      toast.success('Участник клуба обновлен');
      closeModal();
      fetchMembers();
    } catch (error: any) {
      console.error('Error updating club member:', error);
      toast.error(error?.message || 'Ошибка обновления участника');
    }
  };

  const getTierInfo = (tier: string) => {
    const tierInfo = {
      bronze: { name: 'Бронзовый', color: 'bg-amber-100 text-amber-800' },
      silver: { name: 'Серебряный', color: 'bg-gray-100 text-gray-800' },
      gold: { name: 'Золотой', color: 'bg-yellow-100 text-yellow-800' },
      platinum: { name: 'Платиновый', color: 'bg-purple-100 text-purple-800' },
    };
    return tierInfo[tier as keyof typeof tierInfo] || tierInfo.bronze;
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.referral_code && member.referral_code.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTier = filterTier === 'all' || member.member_tier === filterTier;

    return matchesSearch && matchesTier;
  });

  const stats = {
    total: members.length,
    active: members.filter((m) => m.is_active).length,
    bronze: members.filter((m) => m.member_tier === 'bronze').length,
    silver: members.filter((m) => m.member_tier === 'silver').length,
    gold: members.filter((m) => m.member_tier === 'gold').length,
    platinum: members.filter((m) => m.member_tier === 'platinum').length,
    totalPoints: members.reduce((sum, m) => sum + m.points, 0),
    totalPurchases: members.reduce((sum, m) => sum + Number(m.total_purchases), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Участники Клуба Sakina</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Всего</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Активных</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Бронза</p>
          <p className="text-2xl font-bold">{stats.bronze}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Серебро</p>
          <p className="text-2xl font-bold">{stats.silver}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Золото</p>
          <p className="text-2xl font-bold">{stats.gold}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Платина</p>
          <p className="text-2xl font-bold">{stats.platinum}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Баллов</p>
          <p className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Покупок</p>
          <p className="text-2xl font-bold">{stats.totalPurchases.toLocaleString()} TJS</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Поиск по имени, телефону, email или реферальному коду..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Все уровни</option>
            <option value="bronze">Бронзовый</option>
            <option value="silver">Серебряный</option>
            <option value="gold">Золотой</option>
            <option value="platinum">Платиновый</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Участник
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Уровень
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Баллы
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Скидка
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Покупки
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Реферальный код
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Участники не найдены
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const tierInfo = getTierInfo(member.member_tier);
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                          <div className="text-sm text-gray-500">{member.phone}</div>
                          {member.email && (
                            <div className="text-xs text-gray-400">{member.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${tierInfo.color}`}>
                          {tierInfo.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{member.points}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Percent className="w-4 h-4 text-teal-500" />
                          <span className="text-sm font-medium">{member.discount_percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">
                            {new Intl.NumberFormat('ru-RU').format(member.total_purchases)} TJS
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                          {member.referral_code || '—'}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            member.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {member.is_active ? 'Активен' : 'Неактивен'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(member)}
                          className="text-teal-600 hover:text-teal-900 mr-4"
                        >
                          <Edit2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Редактировать участника клуба">
        {activeMember && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input
                type="text"
                value={activeMember.full_name}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input
                type="text"
                value={activeMember.phone}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Уровень участника</label>
              <select
                value={formData.member_tier}
                onChange={(e) =>
                  setFormData({ ...formData, member_tier: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="bronze">Бронзовый</option>
                <option value="silver">Серебряный</option>
                <option value="gold">Золотой</option>
                <option value="platinum">Платиновый</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Баллы</label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Скидка (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) =>
                  setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Общая сумма покупок (TJS)</label>
              <input
                type="number"
                step="0.01"
                value={formData.total_purchases}
                onChange={(e) =>
                  setFormData({ ...formData, total_purchases: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">Активен</span>
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Сохранить
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminClubMembers;

