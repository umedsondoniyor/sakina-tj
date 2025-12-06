import React, { useState } from 'react';
import { X, Phone, ShoppingBag, CheckCircle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { Product, ProductVariant } from '../../lib/types';
import { formatCurrency, getVariantLabel } from '../../lib/utils';

interface ProductConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: () => void; // Optional - for backward compatibility
  product: Product;
  selectedVariant: ProductVariant;
  category?: string;
}

const ProductConfirmationModal: React.FC<ProductConfirmationModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  product,
  selectedVariant,
  category
}) => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [purchaseMode, setPurchaseMode] = useState<'cart' | 'oneclick'>('oneclick');

  if (!isOpen) return null;

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '+992';
    let workingDigits = digits;
    
    if (digits.length > 0 && !digits.startsWith('992')) {
      workingDigits = '992' + digits;
    }
    
    if (digits.startsWith('992')) {
      workingDigits = digits;
    }
    
    if (workingDigits.length > 3) {
      formatted += ` ${workingDigits.slice(3, 6)}`;
    }
    if (workingDigits.length > 6) {
      formatted += ` ${workingDigits.slice(6, 8)}`;
    }
    if (workingDigits.length > 8) {
      formatted += ` ${workingDigits.slice(8, 12)}`;
    }
    
    return formatted;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
    if (error) setError('');
  };

  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 12) {
      return 'Номер телефона должен содержать 12 цифр';
    }
    if (!digits.startsWith('992')) {
      return 'Номер должен начинаться с +992';
    }
    return '';
  };

  const handleOneClickPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const phoneError = validatePhone(phoneNumber);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setLoading(true);
    setError(''); // Clear any previous errors

    try {
      // Validate product data
      if (!product.id) {
        throw new Error('ID товара не указан');
      }
      
      if (!product.name) {
        throw new Error('Название товара не указано');
      }

      const price = selectedVariant.price;
      if (!price || price <= 0) {
        throw new Error('Цена товара не указана или некорректна');
      }

      const sizeLabel = getVariantLabel(selectedVariant, category);
      
      // Normalize phone number - remove spaces for storage
      const normalizedPhone = phoneNumber.replace(/\s/g, '');
      
      // Prepare order data - ensure all required fields are present
      const orderData: {
        product_id: string;
        product_name: string;
        product_price: number;
        selected_variant_id?: string | null;
        selected_size?: string | null;
        phone_number: string;
        status: string;
      } = {
        product_id: product.id,
        product_name: product.name.trim(),
        product_price: Number(price),
        phone_number: normalizedPhone,
        status: 'pending'
      };
      
      // Validate final data before sending
      if (!orderData.product_id) {
        throw new Error('ID товара отсутствует');
      }
      if (!orderData.product_name) {
        throw new Error('Название товара отсутствует');
      }
      if (!orderData.product_price || orderData.product_price <= 0) {
        throw new Error(`Некорректная цена: ${orderData.product_price}`);
      }
      if (!orderData.phone_number || orderData.phone_number.length < 10) {
        throw new Error('Некорректный номер телефона');
      }

      // Add optional fields only if they exist
      if (selectedVariant.id) {
        orderData.selected_variant_id = selectedVariant.id;
      }
      
      if (sizeLabel) {
        orderData.selected_size = sizeLabel;
      }

      console.log('Creating one-click order with data:', orderData);

      const { data, error: dbError } = await supabase
        .from('one_click_orders')
        .insert([orderData])
        .select()
        .single();

      if (dbError) {
        console.error('Database error details:', {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
          orderData: orderData
        });
        
        // Provide more specific error messages based on error codes
        let userMessage = 'Ошибка при оформлении заказа.';
        
        if (dbError.code === '23503') {
          userMessage = 'Товар не найден в базе данных. Пожалуйста, обновите страницу и попробуйте снова.';
        } else if (dbError.code === '23505') {
          userMessage = 'Такой заказ уже существует. Пожалуйста, проверьте ваши заказы.';
        } else if (dbError.code === '23514') {
          userMessage = 'Некорректные данные заказа. Пожалуйста, проверьте информацию и попробуйте снова.';
        } else if (dbError.code === '42501') {
          userMessage = 'Недостаточно прав для создания заказа. Пожалуйста, обратитесь к администратору или попробуйте позже.';
        } else if (dbError.message) {
          // Try to extract a user-friendly message
          if (dbError.message.includes('foreign key') || dbError.message.includes('product_id')) {
            userMessage = 'Товар не найден. Пожалуйста, обновите страницу.';
          } else if (dbError.message.includes('phone_number')) {
            userMessage = 'Некорректный номер телефона. Пожалуйста, проверьте номер.';
          } else if (dbError.message.includes('price') || dbError.message.includes('product_price')) {
            userMessage = 'Некорректная цена товара. Пожалуйста, обновите страницу.';
          } else {
            userMessage = dbError.message;
          }
        } else {
          userMessage = `Ошибка базы данных (код: ${dbError.code}). Пожалуйста, попробуйте еще раз.`;
        }
        
        throw new Error(userMessage);
      }

      if (!data) {
        throw new Error('Заказ не был создан');
      }

      toast.success('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.');
      onClose();
      // Reset form
      setPhoneNumber('');
      navigate(`/one-click-confirmation/${data.id}`);
    } catch (err: any) {
      console.error('Error creating one-click order:', err);
      const errorMessage = err?.message || err?.error?.message || 'Ошибка при оформлении заказа. Попробуйте еще раз.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart();
    } else {
      // Fallback: navigate to product page or show message
      toast.success('Товар добавлен в корзину');
      onClose();
    }
  };

  const variantLabel = getVariantLabel(selectedVariant, category);
  
  // Improved stock check: consider both in_stock flag and stock_quantity
  const isInStock = selectedVariant.inventory 
    ? (selectedVariant.inventory.in_stock || selectedVariant.inventory.stock_quantity > 0)
    : true; // If no inventory record exists, assume available (for new variants)
  
  const stockQuantity = selectedVariant.inventory?.stock_quantity ?? 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Закрыть"
        >
          <X size={24} />
        </button>

        {/* Header with product info */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Package className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{product.name}</h2>
              <p className="text-teal-100 text-sm mt-1">{variantLabel}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-teal-400">
            <span className="text-sm text-teal-100">Цена:</span>
            <span className="text-2xl font-bold">{formatCurrency(selectedVariant.price)}</span>
          </div>
          {selectedVariant.old_price && (
            <div className="text-right mt-1">
              <span className="text-sm text-teal-200 line-through">
                {formatCurrency(selectedVariant.old_price)}
              </span>
            </div>
          )}
        </div>

        {/* Stock status */}
        <div className="px-6 pt-4">
          {isInStock ? (
            <div className="flex items-center gap-2 text-sm text-teal-600 bg-teal-50 px-3 py-2 rounded-lg">
              <CheckCircle size={16} />
              <span>В наличии {stockQuantity > 0 && `(${stockQuantity} шт.)`}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <X size={16} />
              <span>Нет в наличии</span>
            </div>
          )}
        </div>

        {/* Mode selector */}
        <div className="px-6 pt-4">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setPurchaseMode('oneclick')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                purchaseMode === 'oneclick'
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingBag size={16} className="inline mr-2" />
              Купить в 1 клик
            </button>
            <button
              type="button"
              onClick={() => setPurchaseMode('cart')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                purchaseMode === 'cart'
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              В корзину
            </button>
          </div>
        </div>

        {/* Content based on mode */}
        <div className="p-6">
          {purchaseMode === 'oneclick' ? (
            <form onSubmit={handleOneClickPurchase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер телефона <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+992 ___ __ ____"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                      error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={loading || !isInStock}
                  />
                </div>
                {error && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-start gap-2">
                      <X size={16} className="flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </p>
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Мы свяжемся с вами для подтверждения заказа
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !phoneNumber || !isInStock}
                className="w-full bg-teal-500 text-white py-4 rounded-lg font-semibold hover:bg-teal-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Оформление заказа...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    <span>Заказать в 1 клик</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  Товар будет добавлен в корзину. Вы сможете продолжить покупки или оформить заказ.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Package size={16} />
                  <span>{product.name} • {variantLabel}</span>
                </div>
                <div className="mt-2 text-lg font-bold text-teal-600">
                  {formatCurrency(selectedVariant.price)}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="w-full bg-teal-500 text-white py-4 rounded-lg font-semibold hover:bg-teal-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30"
              >
                <ShoppingBag size={20} />
                <span>Добавить в корзину</span>
              </button>
            </div>
          )}

          {/* Privacy notice */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              При оформлении заказа мы обрабатываем ваши персональные данные.{' '}
              <a href="#" className="text-teal-600 hover:text-teal-700 underline">
                Политика конфиденциальности
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductConfirmationModal;
