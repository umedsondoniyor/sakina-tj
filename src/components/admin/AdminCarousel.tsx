import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, PackageOpen, AlertCircle, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import CarouselModal from './CarouselModal';

interface CarouselSlide {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  order: number;
  active: boolean;
}

const AdminCarousel = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<CarouselSlide | undefined>();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast.error('Не удалось загрузить слайды карусели');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;

    try {
      const { error } = await supabase
        .from('carousel_slides')
        .delete()
        .eq('id', deleteConfirmId);

      if (error) throw error;
      
      setSlides(slides.filter(slide => slide.id !== deleteConfirmId));
      toast.success('Слайд успешно удален');
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Не удалось удалить слайд');
      setDeleteConfirmId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  const handleImageError = (slideId: string) => {
    setImageErrors(prev => new Set(prev).add(slideId));
  };

  const toggleActive = async (slide: CarouselSlide) => {
    try {
      const { error } = await supabase
        .from('carousel_slides')
        .update({ active: !slide.active })
        .eq('id', slide.id);

      if (error) throw error;
      
      setSlides(slides.map(s => 
        s.id === slide.id ? { ...s, active: !s.active } : s
      ));
      toast.success(`Слайд успешно ${slide.active ? 'деактивирован' : 'активирован'}`);
    } catch (error) {
      console.error('Error toggling slide status:', error);
      toast.error('Не удалось обновить статус слайда');
    }
  };

  const handleEdit = (slide: CarouselSlide) => {
    setSelectedSlide(slide);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedSlide(undefined);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-gray-600">Загрузка слайдов...</span>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Управление каруселью</h1>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy transition-colors"
            aria-label="Добавить слайд"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить слайд
          </button>
        </div>
        <div className="text-center py-12">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Слайды не найдены</h3>
          <p className="mt-1 text-sm text-gray-500">Начните с создания нового слайда.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление каруселью</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy transition-colors"
          aria-label="Добавить слайд"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить слайд
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative w-full h-48 bg-gray-100">
              {imageErrors.has(slide.id) ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Изображение не загружено</p>
                  </div>
                </div>
              ) : (
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(slide.id)}
                />
              )}
              {!slide.active && (
                <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  Неактивен
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1 line-clamp-2">{slide.title}</h3>
              {slide.subtitle && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{slide.subtitle}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Порядок: {slide.order}</span>
                  <button
                    onClick={() => toggleActive(slide)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      slide.active 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    aria-label={slide.active ? 'Деактивировать слайд' : 'Активировать слайд'}
                  >
                    {slide.active ? 'Активен' : 'Неактивен'}
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(slide)}
                    className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded transition-colors"
                    aria-label="Редактировать слайд"
                    title="Редактировать"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(slide.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    aria-label="Удалить слайд"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Подтвердите удаление
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Вы уверены, что хотите удалить этот слайд? Это действие нельзя отменить.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleDeleteCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CarouselModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slide={selectedSlide}
        onSuccess={fetchSlides}
      />
    </div>
  );
};

export default AdminCarousel;