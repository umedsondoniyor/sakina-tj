import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Import subcomponents
import CheckoutSteps from './checkout/CheckoutSteps';
import CustomerInfoForm from './checkout/CustomerInfoForm';
import DeliveryForm from './checkout/DeliveryForm';
import PaymentMethodForm from './checkout/PaymentMethodForm';
import OrderSummary from './checkout/OrderSummary';
import SubmitSection from './checkout/SubmitSection';

interface FormData {
  // Customer Information
  phone: string;
  name: string;
  email: string;
  
  // Delivery Information
  deliveryType: 'home' | 'pickup';
  city: string;
  address: string;
  apartment: string;
  entrance: string;
  floor: string;
  intercom: string;
  
  // Payment Information
  paymentMethod: 'online' | 'cash' | 'installment';
  
  // Card Information
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  
  // Additional
  comments: string;
  sameAsBilling: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    name: '',
    email: '',
    deliveryType: 'home',
    city: 'Москва',
    address: '',
    apartment: '',
    entrance: '',
    floor: '',
    intercom: '',
    paymentMethod: 'online',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    comments: '',
    sameAsBilling: true
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showOrderSummary, setShowOrderSummary] = useState(true);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate('/products');
      toast.error('Корзина пуста');
    }
  }, [items, navigate]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    } else if (!/^\+992\s\d{2}\s\d{3}\s\d{2}\s\d{2}$/.test(formData.phone)) {
      newErrors.phone = 'Неверный формат телефона';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    // Address validation for home delivery
    if (formData.deliveryType === 'home' && !formData.address.trim()) {
      newErrors.address = 'Адрес обязателен для доставки на дом';
    }

    // Card validation for online payment
    if (formData.paymentMethod === 'online') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Номер карты обязателен';
      } else if (formData.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Неверный номер карты';
      }

      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = 'Срок действия обязателен';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Неверный формат (MM/YY)';
      }

      if (!formData.cvv.trim()) {
        newErrors.cvv = 'CVV обязателен';
      } else if (formData.cvv.length < 3) {
        newErrors.cvv = 'CVV должен содержать 3-4 цифры';
      }

      if (!formData.cardholderName.trim()) {
        newErrors.cardholderName = 'Имя владельца карты обязательно';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Start with +992
    let formatted = '+992';
    
    if (digits.length > 3) {
      formatted += ` ${digits.slice(3, 5)}`;
    }
    if (digits.length > 5) {
      formatted += ` ${digits.slice(5, 8)}`;
    }
    if (digits.length > 8) {
      formatted += ` ${digits.slice(8, 10)}`;
    }
    if (digits.length > 10) {
      formatted += ` ${digits.slice(10, 12)}`;
    }
    
    return formatted;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  const calculateDeliveryFee = () => {
    return formData.deliveryType === 'home' ? 1000 : 0;
  };

  const calculateDiscount = () => {
    // Example discount calculation
    return Math.round(total * 0.05); // 5% discount
  };

  const calculateFinalTotal = () => {
    return total + calculateDeliveryFee() - calculateDiscount();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    // For online payment, we'll handle this in PaymentButton
    if (formData.paymentMethod === 'online') {
      // PaymentButton will handle the payment flow
      return;
    }

    // For cash/installment payments, create order directly
    await createOrder();
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      // Create order without payment
      // This would typically save to your orders table
      toast.success('Заказ успешно оформлен!');
      clearCart();
      navigate('/order-confirmation');
    } catch (error) {
      toast.error('Ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    toast.success('Платеж инициирован успешно!');
    // Store payment info for later verification
    sessionStorage.setItem('sakina_payment_id', paymentId);
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Ошибка платежа: ${error}`);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Оформление заказа</h1>
        </div>
      </div>

      {/* Progress Steps */}
      <CheckoutSteps currentStep={currentStep} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Information */}
              <CustomerInfoForm
                formData={{
                  phone: formData.phone,
                  name: formData.name,
                  email: formData.email
                }}
                errors={errors}
                onInputChange={handleInputChange}
                onPhoneChange={handlePhoneChange}
              />

              {/* Delivery Information */}
              <DeliveryForm
                formData={{
                  deliveryType: formData.deliveryType,
                  city: formData.city,
                  address: formData.address,
                  apartment: formData.apartment,
                  entrance: formData.entrance,
                  floor: formData.floor,
                  intercom: formData.intercom
                }}
                errors={errors}
                onInputChange={handleInputChange}
              />

              {/* Payment Method */}
              <PaymentMethodForm
                paymentMethod={formData.paymentMethod}
                onPaymentMethodChange={(method) => handleInputChange('paymentMethod', method)}
                cardDetails={{
                  cardNumber: formData.cardNumber,
                  expiryDate: formData.expiryDate,
                  cvv: formData.cvv,
                  cardholderName: formData.cardholderName
                }}
                onCardDetailsChange={handleInputChange}
                cardErrors={errors}
              />

              {/* Submit Button */}
              <SubmitSection
                paymentMethod={formData.paymentMethod}
                items={items}
                formData={formData}
                calculateFinalTotal={calculateFinalTotal}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                errors={errors}
                loading={loading}
                onSubmit={handleSubmit}
                cardDetails={{
                  cardNumber: formData.cardNumber,
                  expiryDate: formData.expiryDate,
                  cvv: formData.cvv,
                  cardholderName: formData.cardholderName
                }}
              />
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={items}
              total={total}
              showOrderSummary={showOrderSummary}
              onToggleOrderSummary={() => setShowOrderSummary(!showOrderSummary)}
              calculateDeliveryFee={calculateDeliveryFee}
              calculateDiscount={calculateDiscount}
              calculateFinalTotal={calculateFinalTotal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;