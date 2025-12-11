import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

interface ProductFormProps {
  onSuccess: () => void;
  onClose: () => void;
  initialData?: {
    id?: string;
    name: string;
    description: string;
    price: number;
    old_price?: number;
    category: string;
    image_urls: string[];
  };
}

const categories = [
  { value: 'mattresses', label: 'Матрасы' },
  { value: 'beds', label: 'Кровати' },
  { value: 'smartchair', label: 'Массажное кресло' },
  { value: 'map', label: 'Карта' },
  { value: 'pillows', label: 'Подушки' },
  { value: 'blankets', label: 'Одеяла' },
  { value: 'furniture', label: 'Мебель' },
];

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    old_price: initialData?.old_price || 0,
    category: initialData?.category || 'mattresses',
    image_urls: initialData?.image_urls || [''],
    // Mattress characteristics
    mattress_type: initialData?.mattress_type || '',
    hardness: initialData?.hardness || '',
    spring_count: initialData?.spring_count || 0,
    spring_block_type: initialData?.spring_block_type || '',
    cover_material: initialData?.cover_material || '',
    removable_cover: initialData?.removable_cover || false,
    filler_material: initialData?.filler_material || '',
    warranty_years: initialData?.warranty_years || 8,
    recommended_mattress_pad: initialData?.recommended_mattress_pad || '',
    country_of_origin: initialData?.country_of_origin || 'Таджикистан',
    weight_category: initialData?.weight_category || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [checkingVariants, setCheckingVariants] = useState(false);

  // Check if product has variants when editing
  useEffect(() => {
    const checkVariants = async () => {
      if (!initialData?.id) {
        setHasVariants(false);
        return;
      }

      setCheckingVariants(true);
      try {
        const { data, error } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', initialData.id)
          .limit(1);

        if (!error && data && data.length > 0) {
          setHasVariants(true);
        } else {
          setHasVariants(false);
        }
      } catch (error) {
        console.error('Error checking variants:', error);
        setHasVariants(false);
      } finally {
        setCheckingVariants(false);
      }
    };

    checkVariants();
  }, [initialData?.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'old_price' || name === 'spring_count' || name === 'warranty_years' 
        ? parseFloat(value) || 0 
        : name === 'removable_cover' 
        ? value === 'true' 
        : value
    }));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newImageUrls = [...formData.image_urls];
    newImageUrls[index] = value;
    setFormData(prev => ({
      ...prev,
      image_urls: newImageUrls
    }));
  };

  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      image_urls: [...prev.image_urls, '']
    }));
  };

  const removeImageUrl = (index: number) => {
    if (formData.image_urls.length > 1) {
      setFormData(prev => ({
        ...prev,
        image_urls: prev.image_urls.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Filter out empty image URLs
      const filteredImageUrls = formData.image_urls.filter(url => url.trim() !== '');
      
      if (filteredImageUrls.length === 0) {
        setError('Требуется хотя бы одно изображение');
        setSubmitting(false);
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.price || !formData.category) {
        setError('Пожалуйста, заполните все обязательные поля');
        setSubmitting(false);
        return;
      }

      // Validate price format
      if (isNaN(formData.price) || formData.price <= 0) {
        setError('Пожалуйста, введите корректную цену');
        setSubmitting(false);
        return;
      }

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Пожалуйста, войдите в систему для продолжения');
      }

      const productData = {
        ...formData,
        image_urls: filteredImageUrls,
        updated_at: new Date().toISOString()
      };

      // Handle weight_category: must be one of the allowed values or NULL
      // Convert empty string to null to satisfy the check constraint
      if (formData.category !== 'mattresses') {
        productData.weight_category = null;
      } else if (!formData.weight_category || formData.weight_category.trim() === '') {
        // If category is mattresses but weight_category is empty, set to null
        productData.weight_category = null;
      }

      let error;
      
      if (initialData?.id) {
        const { data: updateData, error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', initialData.id);

        error = updateError;
        
        if (updateError) {
          throw new Error('Не удалось обновить товар');
        }
        
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from('products')
          .insert([{ ...productData, created_at: new Date().toISOString() }]);

        error = insertError;
        
        if (error) {
          throw new Error('Не удалось создать товар');
        }
      }

      if (error) throw error;

      toast.success(initialData?.id ? 'Товар успешно обновлен' : 'Товар успешно создан');
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось сохранить товар';
      console.error('Error saving product:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const [error, setError] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Редактировать товар' : 'Добавить новый товар'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название товара *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {hasVariants ? 'Цена по умолчанию' : 'Цена'} *
                  </label>
                  {hasVariants && (
                    <span className="text-xs text-gray-500">(Резервная)</span>
                  )}
                </div>
                {hasVariants && (
                  <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800">
                      У этого товара есть варианты. Цены вариантов имеют приоритет. Эта цена используется как резервная, когда вариант не выбран, или для списков товаров.
                    </p>
                  </div>
                )}
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {!hasVariants && !checkingVariants && (
                  <p className="mt-1 text-xs text-gray-500">
                    Для товаров с несколькими размерами создайте варианты в разделе "Варианты товаров", чтобы установить цены для каждого размера.
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {hasVariants ? 'Старая цена по умолчанию' : 'Старая цена'} (Необязательно)
                  </label>
                </div>
                <input
                  type="number"
                  name="old_price"
                  min="0"
                  step="0.01"
                  value={formData.old_price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Изображения товара
                </label>
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Добавить изображение
                </button>
              </div>
              <div className="space-y-2">
                {formData.image_urls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {formData.image_urls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mattress Characteristics - Only show for mattresses category */}
          {formData.category === 'mattresses' && (
            <div className="border-t pt-6 mt-6 space-y-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Характеристики матраса</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип матраса
                  </label>
                  <input
                    type="text"
                    name="mattress_type"
                    value={formData.mattress_type}
                    onChange={handleInputChange}
                    placeholder="e.g., Ортопедический"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Жесткость
                  </label>
                  <select
                    name="hardness"
                    value={formData.hardness}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Выберите жесткость</option>
                    <option value="Мягкая">Мягкая</option>
                    <option value="Средняя">Средняя</option>
                    <option value="Жесткая">Жесткая</option>
                    <option value="Разная жесткость сторон">Разная жесткость сторон</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Весовая категория
                  </label>
                  <select
                    name="weight_category"
                    value={formData.weight_category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Выберите весовую категорию</option>
                    <option value="50-85 kg (Soft)">50-85 kg (Soft)</option>
                    <option value="85-100 kg (Medium)">85-100 kg (Medium)</option>
                    <option value="100+ kg (Hard)">100+ kg (Hard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Количество пружин
                  </label>
                  <input
                    type="number"
                    name="spring_count"
                    value={formData.spring_count}
                    onChange={handleInputChange}
                    placeholder="e.g., 500"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Пружинный блок
                  </label>
                  <select
                    name="spring_block_type"
                    value={formData.spring_block_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Выберите тип блока</option>
                    <option value="Независимый">Независимый</option>
                    <option value="Зависимый">Зависимый</option>
                    <option value="Блок независимых пружин">Блок независимых пружин</option>
                    <option value="Беспружинный">Беспружинный</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Материал чехла
                  </label>
                  <input
                    type="text"
                    name="cover_material"
                    value={formData.cover_material}
                    onChange={handleInputChange}
                    placeholder="e.g., Трикотаж"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Съемный чехол
                  </label>
                  <select
                    name="removable_cover"
                    value={formData.removable_cover.toString()}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="false">Нет</option>
                    <option value="true">Да</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Наполнитель
                  </label>
                  <input
                    type="text"
                    name="filler_material"
                    value={formData.filler_material}
                    onChange={handleInputChange}
                    placeholder="e.g., Анатомическая пена + кокосовая койра"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Гарантия (лет)
                  </label>
                  <input
                    type="number"
                    name="warranty_years"
                    value={formData.warranty_years}
                    onChange={handleInputChange}
                    placeholder="e.g., 8"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Рекомендуемый наматрасник
                  </label>
                  <input
                    type="text"
                    name="recommended_mattress_pad"
                    value={formData.recommended_mattress_pad}
                    onChange={handleInputChange}
                    placeholder="e.g., 1 слой"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Страна производства
                  </label>
                  <input
                    type="text"
                    name="country_of_origin"
                    value={formData.country_of_origin}
                    onChange={handleInputChange}
                    placeholder="e.g., Таджикистан"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="sticky bottom-0 bg-white pt-6 mt-6 border-t flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-400"
            >
              {submitting ? 'Сохранение...' : initialData ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;