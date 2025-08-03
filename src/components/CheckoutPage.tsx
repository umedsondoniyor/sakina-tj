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
import PaymentButton from './PaymentButton';

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
    city: 'Душанбе',
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

  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      // Validate customer info
      if (!formData.phone.trim()) {
        newErrors.phone = 'Телефон обязателен';
      } else if (!/^\+992\s\d{2}\s\d{3}\s\d{2}\s\d{2}$/.test(formData.phone)) {
        newErrors.phone = 'Неверный формат телефона';
      }

      if (!formData.name.trim()) {
        newErrors.name = 'Имя обязательно';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Имя должно содержать минимум 2 символа';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email обязателен';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Неверный формат email';
      }
    }

    if (currentStep === 2) {
      // Validate delivery info
      if (formData.deliveryType === 'home' && !formData.address.trim()) {
        newErrors.address = 'Адрес обязателен для доставки на дом';
      }
    }

    if (currentStep === 3) {
      // Validate payment info
      if (formData.paymentMethod === 'online') {
        if (!formData.cardNumber || !formData.cardNumber.trim()) {
          newErrors.cardNumber = 'Номер карты обязателен';
        } else if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
          newErrors.cardNumber = 'Неверный номер карты';
        }

        if (!formData.expiryDate || !formData.expiryDate.trim()) {
          newErrors.expiryDate = 'Срок действия обязателен';
        } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
          newErrors.expiryDate = 'Неверный формат (MM/YY)';
        }

        if (!formData.cvv || !formData.cvv.trim()) {
          newErrors.cvv = 'CVV обязателен';
        } else if (formData.cvv.length < 3 || formData.cvv.length > 4) {
          newErrors.cvv = 'CVV должен содержать 3-4 цифры';
        }

        if (!formData.cardholderName || !formData.cardholderName.trim()) {
          newErrors.cardholderName = 'Имя владельца карты обязательно';
        }
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

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Пожалуйста, исправьте ошибки в форме');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateDeliveryFee = () => {
    return formData.deliveryType === 'home' ? 1000 : 0;
  };

  const calculateDiscount = () => {
    return Math.round(total * 0.05); // 5% discount
  };

  const calculateFinalTotal = () => {
    return total + calculateDeliveryFee() - calculateDiscount();
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      // Create order without payment for cash/installment
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
    sessionStorage.setItem('sakina_payment_id', paymentId);
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Ошибка платежа: ${error}`);
  };

  if (items.length === 0) {
    return null;
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
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
        );
      case 2:
        return (
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
        );
      case 3:
        return (
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
        );
      case 4:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Подтверждение заказа</h2>
            
            {/* Order Summary */}
            <div className="space-y-4 mb-6">
              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Контактная информация</h3>
                <p className="text-sm text-gray-600">{formData.name}</p>
                <p className="text-sm text-gray-600">{formData.phone}</p>
                <p className="text-sm text-gray-600">{formData.email}</p>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Доставка</h3>
                <p className="text-sm text-gray-600">
                  {formData.deliveryType === 'home' ? 'Доставка на дом' : 'Самовывоз'}
                </p>
                {formData.deliveryType === 'home' && (
                  <p className="text-sm text-gray-600">{formData.address}</p>
                )}
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Способ оплаты</h3>
                <p className="text-sm text-gray-600">
                  {formData.paymentMethod === 'online' ? 'Оплата онлайн' : 
                   formData.paymentMethod === 'cash' ? 'При получении' : 'Оплата частями'}
                </p>
                {formData.paymentMethod === 'online' && formData.cardNumber && (
                  <p className="text-sm text-gray-600">
                    Карта: ****{formData.cardNumber.replace(/\s/g, '').slice(-4)}
                  </p>
                )}
              </div>
            </div>

            {/* Final Payment/Submit */}
            {formData.paymentMethod === 'online' ? (
              <PaymentButton
                amount={calculateFinalTotal()}
                currency="TJS"
                gate="korti_milli"
                orderData={{
                  items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    category: 'general'
                  })),
                  customerInfo: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                  },
                  deliveryInfo: {
                    type: formData.deliveryType,
                    address: formData.deliveryType === 'home' ? formData.address : undefined
                  },
                  cardInfo: {
                    cardNumber: formData.cardNumber.replace(/\s/g, ''),
                    expiryDate: formData.expiryDate,
                    cvv: formData.cvv,
                    cardholderName: formData.cardholderName
                  },
                  invoices: {
                    invoices: items.map(item => ({
                      category: 'products',
                      name: item.name,
                      price: item.price,
                      quantity: item.quantity
                    })),
                    is_hold_required: false,
                    is_outbox_marked: false
                  }
                }}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                disabled={loading}
              >
                Оплатить {calculateFinalTotal().toLocaleString()} TJS
              </PaymentButton>
            ) : (
              <button
                onClick={createOrder}
                disabled={loading}
                className="w-full bg-teal-500 text-white py-4 rounded-lg font-semibold hover:bg-teal-600 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Обработка заказа...' : 'Подтвердить заказ'}
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

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
            <div className="space-y-8">
              {renderCurrentStep()}
              
              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      currentStep === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    Назад
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    {currentStep === 3 ? 'К подтверждению' : 'Далее'}
                  </button>
                </div>
              )}
            </div>
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