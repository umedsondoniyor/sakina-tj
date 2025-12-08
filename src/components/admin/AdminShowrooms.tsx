import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, PackageOpen, ChevronUp, ChevronDown, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import ShowroomModal from './ShowroomModal';

export interface Showroom {
  id: string;
  name: string;
  address: string;
  map_link: string;
  phone?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminShowrooms = () => {
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShowroom, setSelectedShowroom] = useState<Showroom | undefined>();

  useEffect(() => {
    fetchShowrooms();
  }, []);

  const fetchShowrooms = async () => {
    try {
      const { data, error } = await supabase
        .from('showrooms')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setShowrooms(data || []);
    } catch (error) {
      console.error('Error fetching showrooms:', error);
      toast.error('Не удалось загрузить шоурумы');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот шоурум?')) return;

    try {
      const { error } = await supabase
        .from('showrooms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setShowrooms(showrooms.filter(showroom => showroom.id !== id));
      toast.success('Шоурум успешно удален');
    } catch (error) {
      console.error('Error deleting showroom:', error);
      toast.error('Не удалось удалить шоурум');
    }
  };

  const toggleActive = async (showroom: Showroom) => {
    try {
      const { error } = await supabase
        .from('showrooms')
        .update({ is_active: !showroom.is_active })
        .eq('id', showroom.id);

      if (error) throw error;
      
      setShowrooms(showrooms.map(s => 
        s.id === showroom.id ? { ...s, is_active: !s.is_active } : s
      ));
      toast.success(`Шоурум ${showroom.is_active ? 'скрыт' : 'показан'} успешно`);
    } catch (error) {
      console.error('Error toggling showroom status:', error);
      toast.error('Не удалось обновить статус шоурума');
    }
  };

  const moveShowroom = async (showroomId: string, direction: 'up' | 'down') => {
    const showroomIndex = showrooms.findIndex(s => s.id === showroomId);
    if (showroomIndex === -1) return;

    const newIndex = direction === 'up' ? showroomIndex - 1 : showroomIndex + 1;
    if (newIndex < 0 || newIndex >= showrooms.length) return;

    try {
      const showroom1 = showrooms[showroomIndex];
      const showroom2 = showrooms[newIndex];

      // Swap order_index values
      await Promise.all([
        supabase
          .from('showrooms')
          .update({ order_index: showroom2.order_index })
          .eq('id', showroom1.id),
        supabase
          .from('showrooms')
          .update({ order_index: showroom1.order_index })
          .eq('id', showroom2.id)
      ]);

      // Update local state
      const newShowrooms = [...showrooms];
      [newShowrooms[showroomIndex], newShowrooms[newIndex]] = [newShowrooms[newIndex], newShowrooms[showroomIndex]];
      setShowrooms(newShowrooms);

      toast.success('Порядок шоурумов обновлен');
    } catch (error) {
      console.error('Error updating showroom order:', error);
      toast.error('Не удалось обновить порядок шоурумов');
    }
  };

  const handleEdit = (showroom: Showroom) => {
    setSelectedShowroom(showroom);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedShowroom(undefined);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление шоурумами</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить шоурум
        </button>
      </div>

      {showrooms.length === 0 ? (
        <div className="text-center py-12">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Шоурумы не найдены</h3>
          <p className="mt-1 text-sm text-gray-500">Начните с добавления нового шоурума.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {showrooms.map((showroom, index) => (
            <div
              key={showroom.id}
              className="bg-white rounded-lg shadow border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    <h3 className="text-lg font-semibold">{showroom.name}</h3>
                    <button
                      onClick={() => toggleActive(showroom)}
                      className={`px-2 py-1 rounded text-xs ${
                        showroom.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {showroom.is_active ? 'Активен' : 'Неактивен'}
                    </button>
                  </div>
                  
                  <div className="ml-8 space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Адрес:</span> {showroom.address}
                    </p>
                    {showroom.phone && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Телефон:</span> {showroom.phone}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Порядок: {showroom.order_index}
                    </p>
                    <a
                      href={showroom.map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-teal-600 hover:text-teal-800 inline-flex items-center gap-1"
                    >
                      <MapPin className="w-4 h-4" />
                      Открыть на карте
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveShowroom(showroom.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      title="Переместить вверх"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveShowroom(showroom.id, 'down')}
                      disabled={index === showrooms.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      title="Переместить вниз"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleEdit(showroom)}
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Редактировать"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(showroom.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ShowroomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showroom={selectedShowroom}
        onSuccess={fetchShowrooms}
      />
    </div>
  );
};

export default AdminShowrooms;

