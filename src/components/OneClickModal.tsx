import React, { useState } from 'react';
import { X, Phone, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { Product, ProductVariant } from '../lib/types';
import { formatCurrency } from '../lib/utils';

interface OneClickModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedVariant?: ProductVariant | null;
  onSuccess: (orderId: string) => void;
}

const OneClickModal: React.FC<OneClickModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedVariant,
  onSuccess
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Handle different input scenarios
    let formatted = '+992';
    let workingDigits = digits;
    
    // If user starts typing without +992, assume they're entering local number
    if (digits.length > 0 && !digits.startsWith('992')) {
      // For local numbers, prepend 992
      workingDigits = '992' + digits;
    }
    
    // If digits start with 992, use as is
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
    // Remove formatting to get just digits
    const digits = phone.replace(/\D/g, '');
    
    // Should be 12 digits total (992 + 9 digits)
    if (digits.length !== 12) {
      return 'Номер телефона должен содержать 12 цифр';
    }
    
    if (!digits.startsWith('992')) {
      return 'Номер должен начинаться с +992';
    }
    
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const phoneError = validatePhone(phoneNumber);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        product_id: product.id,
        product_name: product.name,
        product_price: selectedVariant ? selectedVariant.price : product.price,
        selected_variant_id: selectedVariant?.id || null,
        selected_size: selectedVariant ? (
          selectedVariant.height_cm 
            ? `${selectedVariant.size_name}, h - ${selectedVariant.height_cm} см`
            : selectedVariant.width_cm && selectedVariant.length_cm
            ? `${selectedVariant.width_cm}×${selectedVariant.length_cm}`
            : selectedVariant.size_name
        ) : null,
        phone_number: phoneNumber,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('one_click_orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Заказ успешно оформлен!');
      onSuccess(data.id);
      onClose();
    } catch (error) {
      console.error('Error creating one-click order:', error);
      setError('Ошибка при оформлении заказа. Попробуйте еще раз.');
      toast.error('Ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Заказать в 1 клик</h2>
            <p className="text-gray-600">
              {product.name}
              {selectedVariant && (
                <span className="block text-sm text-teal-600 mt-1">
                  {selectedVariant.height_cm 
                    ? `${selectedVariant.size_name}, h - ${selectedVariant.height_cm} см`
                    : selectedVariant.width_cm && selectedVariant.length_cm
                    ? `${selectedVariant.width_cm}×${selectedVariant.length_cm}`
                    : selectedVariant.size_name
                  }
                </span>
              )}
            </p>
            <div className="text-2xl font-bold text-teal-600 mt-2">
              {formatCurrency(currentPrice)}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер телефона
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+992 ___ __ ____"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !phoneNumber}
              className="w-full bg-brand-turquoise text-white py-4 rounded-lg hover:bg-brand-navy transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Отправить заказ...' : 'Отправить заказ'}
            </button>
          </form>

          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>
              При оформлении заказа мы осуществляем обработку ваших персональных данных. 
              Указывая свой контактный номер телефона, вы подтверждаете ознакомление{' '}
              <a href="#" className="text-teal-600 hover:text-teal-700">
                с договором-офертой и условиями обработки персональных данных
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneClickModal;