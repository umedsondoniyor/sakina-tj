import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { ProductVariant, Product } from '../../lib/types';

interface ProductVariantFormProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: ProductVariant;
  products: Product[];
  onSuccess: () => void;
}

const sizeTypes = [
  { value: 'pillow', label: 'Подушка' },
  { value: 'mattress', label: 'Матрас' },
  { value: 'bed', label: 'Кровать' },
  { value: 'sofa', label: 'Диван' },
  { value: 'blanket', label: 'Одеяло' },
  { value: 'furniture', label: 'Мебель' },
  { value: 'map', label: '3D Карта' },
];

const categoryDisplayNames: Record<string, string> = {
  mattresses: 'Матрасы',
  beds: 'Кровати',
  smartchair: 'Массажное кресло',
  map: 'Карта',
  pillows: 'Подушки',
  blankets: 'Одеяла',
  furniture: 'Мебель',
};

const ProductVariantForm: React.FC<ProductVariantFormProps> = ({
  isOpen,
  onClose,
  variant,
  products,
  onSuccess
}) => {
  const [formData, setFormData] = useState<{
    product_id: string;
    size_name: string;
    size_type: 'pillow' | 'mattress' | 'bed' | 'sofa' | 'blanket' | 'furniture' | 'map';
    height_cm: string;
    width_cm: string;
    length_cm: string;
    price: string;
    old_price: string;
    display_order: string;
    stock_quantity: string;
    in_stock: boolean;
  }>({
    product_id: '',
    size_name: '',
    size_type: 'mattress',
    height_cm: '',
    width_cm: '',
    length_cm: '',
    price: '',
    old_price: '',
    display_order: '0',
    stock_quantity: '0',
    in_stock: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (variant) {
      setFormData({
        product_id: variant.product_id,
        size_name: variant.size_name,
        size_type: variant.size_type,
        height_cm: variant.height_cm?.toString() || '',
        width_cm: variant.width_cm?.toString() || '',
        length_cm: variant.length_cm?.toString() || '',
        price: variant.price.toString(),
        old_price: variant.old_price?.toString() || '',
        display_order: variant.display_order.toString(),
        stock_quantity: variant.inventory?.stock_quantity?.toString() || '0',
        in_stock: variant.inventory?.in_stock ?? true
      });
    } else {
      setFormData({
        product_id: '',
        size_name: '',
        size_type: 'mattress',
        height_cm: '',
        width_cm: '',
        length_cm: '',
        price: '',
        old_price: '',
        display_order: '0',
        stock_quantity: '0',
        in_stock: true
      });
    }
    setError('');
    setErrors({});
  }, [variant, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_id) {
      newErrors.product_id = 'Выберите товар';
    }

    if (!formData.size_name.trim()) {
      newErrors.size_name = 'Введите название размера';
    }

    if (!formData.price) {
      newErrors.price = 'Введите цену';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Введите корректную цену (больше 0)';
      }
    }

    // Validate old_price if provided
    if (formData.old_price) {
      const oldPrice = parseFloat(formData.old_price);
      if (isNaN(oldPrice) || oldPrice <= 0) {
        newErrors.old_price = 'Старая цена должна быть больше 0';
      } else if (formData.price) {
        const price = parseFloat(formData.price);
        if (oldPrice <= price) {
          newErrors.old_price = 'Старая цена должна быть больше текущей цены';
        }
      }
    }

    // Validate dimensions based on size type
    if (formData.size_type === 'pillow') {
      if (!formData.height_cm) {
        newErrors.height_cm = 'Высота обязательна для подушек';
      } else {
        const height = parseFloat(formData.height_cm);
        if (isNaN(height) || height <= 0) {
          newErrors.height_cm = 'Введите корректную высоту';
        }
      }
    }

    if (formData.size_type === 'mattress' || formData.size_type === 'bed') {
      if (!formData.width_cm) {
        newErrors.width_cm = 'Ширина обязательна';
      } else {
        const width = parseFloat(formData.width_cm);
        if (isNaN(width) || width <= 0) {
          newErrors.width_cm = 'Введите корректную ширину';
        }
      }

      if (!formData.length_cm) {
        newErrors.length_cm = 'Длина обязательна';
      } else {
        const length = parseFloat(formData.length_cm);
        if (isNaN(length) || length <= 0) {
          newErrors.length_cm = 'Введите корректную длину';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate price
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        setError('Введите корректную цену');
        setLoading(false);
        return;
      }

      // Prepare data for submission
      const variantData = {
        product_id: formData.product_id,
        size_name: formData.size_name,
        size_type: formData.size_type,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        width_cm: formData.width_cm ? parseFloat(formData.width_cm) : null,
        length_cm: formData.length_cm ? parseFloat(formData.length_cm) : null,
        price: price,
        old_price: formData.old_price && parseFloat(formData.old_price) > 0 
          ? parseFloat(formData.old_price) 
          : null,
        display_order: parseInt(formData.display_order) || 0,
        updated_at: new Date().toISOString()
      };

      // Get default location
      const { data: defaultLocation, error: locationError } = await supabase
        .from('locations')
        .select('id')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (locationError || !defaultLocation) {
        throw new Error('Не найдена активная локация');
      }

      let error;
      let variantId = variant?.id;

      if (variant?.id) {
        // Update existing variant
        const { error: updateError } = await supabase
          .from('product_variants')
          .update(variantData)
          .eq('id', variant.id);
        error = updateError;
      } else {
        // Create new variant
        const { data: insertData, error: insertError } = await supabase
          .from('product_variants')
          .insert([{
            ...variantData,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();
        error = insertError;
        variantId = insertData?.id;
      }

      if (error) throw error;

      // Update or create inventory record
      const { error: inventoryError } = await supabase
        .from('inventory')
        .upsert({
          location_id: defaultLocation.id,
          product_variant_id: variantId,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          in_stock: formData.in_stock,
          updated_at: new Date().toISOString()
        });

      if (inventoryError) throw inventoryError;

      toast.success(variant?.id ? 'Вариант товара успешно обновлен' : 'Вариант товара успешно создан');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving variant:', error);
      const errorMessage = error instanceof Error ? error.message : 'Не удалось сохранить вариант товара';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">
            {variant ? 'Редактировать вариант товара' : 'Добавить новый вариант товара'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Товар *
              </label>
              <select
                value={formData.product_id}
                onChange={(e) => {
                  setFormData({ ...formData, product_id: e.target.value });
                  if (errors.product_id) {
                    setErrors({ ...errors, product_id: '' });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.product_id ? 'border-red-500' : ''
                }`}
                required
              >
                <option value="">Выберите товар</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({categoryDisplayNames[product.category] || product.category})
                  </option>
                ))}
              </select>
              {errors.product_id && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.product_id}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Size Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название размера *
                </label>
                <input
                  type="text"
                  value={formData.size_name}
                  onChange={(e) => {
                    setFormData({ ...formData, size_name: e.target.value });
                    if (errors.size_name) {
                      setErrors({ ...errors, size_name: '' });
                    }
                  }}
                  placeholder="например: XS, 140×200, King"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.size_name ? 'border-red-500' : ''
                  }`}
                  required
                />
                {errors.size_name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.size_name}
                  </p>
                )}
              </div>

              {/* Size Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип размера *
                </label>
                <select
                  value={formData.size_type}
                  onChange={(e) => setFormData({ ...formData, size_type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  {sizeTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-4">
              {/* Height (mainly for pillows) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Высота (см) {formData.size_type === 'pillow' && '*'}
                </label>
                <input
                  type="number"
                  value={formData.height_cm}
                  onChange={(e) => {
                    setFormData({ ...formData, height_cm: e.target.value });
                    if (errors.height_cm) {
                      setErrors({ ...errors, height_cm: '' });
                    }
                  }}
                  placeholder="например: 14"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.height_cm ? 'border-red-500' : ''
                  }`}
                  min="0"
                  step="0.1"
                  required={formData.size_type === 'pillow'}
                />
                {errors.height_cm && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.height_cm}
                  </p>
                )}
              </div>

              {/* Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ширина (см) {(formData.size_type === 'mattress' || formData.size_type === 'bed') && '*'}
                </label>
                <input
                  type="number"
                  value={formData.width_cm}
                  onChange={(e) => {
                    setFormData({ ...formData, width_cm: e.target.value });
                    if (errors.width_cm) {
                      setErrors({ ...errors, width_cm: '' });
                    }
                  }}
                  placeholder="например: 140"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.width_cm ? 'border-red-500' : ''
                  }`}
                  min="0"
                  step="0.1"
                  required={formData.size_type === 'mattress' || formData.size_type === 'bed'}
                />
                {errors.width_cm && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.width_cm}
                  </p>
                )}
              </div>

              {/* Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Длина (см) {(formData.size_type === 'mattress' || formData.size_type === 'bed') && '*'}
                </label>
                <input
                  type="number"
                  value={formData.length_cm}
                  onChange={(e) => {
                    setFormData({ ...formData, length_cm: e.target.value });
                    if (errors.length_cm) {
                      setErrors({ ...errors, length_cm: '' });
                    }
                  }}
                  placeholder="например: 200"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.length_cm ? 'border-red-500' : ''
                  }`}
                  min="0"
                  step="0.1"
                  required={formData.size_type === 'mattress' || formData.size_type === 'bed'}
                />
                {errors.length_cm && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.length_cm}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData({ ...formData, price: e.target.value });
                    if (errors.price) {
                      setErrors({ ...errors, price: '' });
                    }
                  }}
                  placeholder="например: 5999"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.price ? 'border-red-500' : ''
                  }`}
                  min="0"
                  step="0.01"
                  required
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.price}
                  </p>
                )}
              </div>

              {/* Old Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Старая цена (Необязательно)
                </label>
                <input
                  type="number"
                  value={formData.old_price}
                  onChange={(e) => {
                    setFormData({ ...formData, old_price: e.target.value });
                    if (errors.old_price) {
                      setErrors({ ...errors, old_price: '' });
                    }
                  }}
                  placeholder="например: 7999"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.old_price ? 'border-red-500' : ''
                  }`}
                  min="0"
                  step="0.01"
                />
                {errors.old_price && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.old_price}
                  </p>
                )}
                {!errors.old_price && formData.old_price && (
                  <p className="mt-1 text-xs text-gray-500">
                    Старая цена должна быть больше текущей цены для отображения скидки
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Порядок отображения
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Варианты сортируются по возрастанию этого значения
                </p>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Количество на складе
                </label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Количество единиц товара на складе
                </p>
              </div>
            </div>

            <div className="flex items-center">
              {/* In Stock */}
              <input
                type="checkbox"
                id="in_stock"
                checked={formData.in_stock}
                onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500 mr-2"
              />
              <label htmlFor="in_stock" className="text-sm font-medium text-gray-700 cursor-pointer">
                В наличии
              </label>
              <p className="ml-2 text-xs text-gray-500">
                (Неактивные варианты не отображаются на сайте)
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
              className="px-4 py-2 bg-brand-turquoise text-white hover:bg-brand-navy disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Сохранение...' : variant ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductVariantForm;