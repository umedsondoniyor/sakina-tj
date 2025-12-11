import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface CarouselSlide {
  id?: string;
  title: string;
  subtitle?: string;
  image_url: string;
  order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide?: CarouselSlide;
  onSuccess: () => void;
}

const CarouselModal: React.FC<CarouselModalProps> = ({ isOpen, onClose, slide, onSuccess }) => {
  const [formData, setFormData] = useState<CarouselSlide>({
    title: '',
    subtitle: '',
    image_url: '',
    order: 0,
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (slide) {
      setFormData({
        id: slide.id,
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        image_url: slide.image_url || '',
        order: slide.order || 0,
        active: slide.active ?? true
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        image_url: '',
        order: 0,
        active: true
      });
    }
    setImageError(false);
    setErrors({});
  }, [slide, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно для заполнения';
    }

    if (!formData.image_url.trim()) {
      newErrors.image_url = 'URL изображения обязателен для заполнения';
    } else if (!isValidUrl(formData.image_url)) {
      newErrors.image_url = 'Введите корректный URL';
    }

    if (formData.order < 0 || isNaN(formData.order)) {
      newErrors.order = 'Порядок должен быть неотрицательным числом';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setLoading(true);

    try {
      // Check authentication status
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Ошибка аутентификации: ${sessionError.message}`);
      }
      
      if (!session) {
        toast.error('Пожалуйста, войдите в систему для продолжения');
        navigate('/admin/login');
        return;
      }

      // Verify admin role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        throw new Error(`Ошибка профиля: ${profileError.message}`);
      }

      if (!profile || profile.role !== 'admin') {
        throw new Error('Недостаточно прав доступа');
      }

      const dataToSend = {
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || null,
        image_url: formData.image_url.trim(),
        order: formData.order,
        active: formData.active,
        updated_at: new Date().toISOString()
      };

      let error;

      if (slide?.id) {
        // Update existing slide
        const { error: updateError } = await supabase
          .from('carousel_slides')
          .update(dataToSend)
          .eq('id', slide.id);
        error = updateError;
      } else {
        // Create new slide
        const { error: insertError } = await supabase
          .from('carousel_slides')
          .insert([{
            ...dataToSend,
            created_at: new Date().toISOString()
          }]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(slide?.id ? 'Слайд успешно обновлен' : 'Слайд успешно создан');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving slide:', error);
      const errorMessage = error instanceof Error ? error.message : 'Не удалось сохранить слайд';
      toast.error(errorMessage);
      
      if (errorMessage.includes('войдите в систему')) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setFormData({ ...formData, order: numValue });
      if (errors.order) {
        setErrors({ ...errors, order: '' });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">
            {slide ? 'Редактировать слайд' : 'Добавить новый слайд'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) {
                    setErrors({ ...errors, title: '' });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.title ? 'border-red-500' : ''
                }`}
                placeholder="Введите название слайда"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Подзаголовок
              </label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Введите подзаголовок (необязательно)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL изображения (1920x400) *
              </label>
              <input
                type="url"
                required
                value={formData.image_url}
                onChange={(e) => {
                  setFormData({ ...formData, image_url: e.target.value });
                  setImageError(false);
                  if (errors.image_url) {
                    setErrors({ ...errors, image_url: '' });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.image_url ? 'border-red-500' : ''
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image_url && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.image_url}
                </p>
              )}
              
              {/* Image Preview */}
              {formData.image_url && !imageError && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Предпросмотр:</p>
                  <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={formData.image_url}
                      alt="Предпросмотр"
                      className="w-full h-full object-contain"
                      onError={() => setImageError(true)}
                    />
                  </div>
                </div>
              )}
              
              {imageError && formData.image_url && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">
                    Не удалось загрузить изображение. Проверьте правильность URL.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Порядок отображения *
              </label>
              <input
                type="number"
                required
                value={formData.order}
                onChange={handleOrderChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.order ? 'border-red-500' : ''
                }`}
                min="0"
                placeholder="0"
              />
              <p className="mt-1 text-xs text-gray-500">
                Слайды сортируются по возрастанию этого значения
              </p>
              {errors.order && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.order}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500 mr-2"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
                Активен
              </label>
              <p className="ml-2 text-xs text-gray-500">
                (Неактивные слайды не отображаются на сайте)
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Сохранение...' : slide ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarouselModal;