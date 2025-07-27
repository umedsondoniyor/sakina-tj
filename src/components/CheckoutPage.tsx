import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Home,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
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

  const steps = [
    { id: 1, title: 'Контактные данные', icon: User },
    { id: 2, title: 'Доставка', icon: Truck },
    { id: 3, title: 'Оплата', icon: CreditCard },
    { id: 4, title: 'Подтверждение', icon: CheckCircle }
  ];

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

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-teal-500 border-teal-500 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle size={20} />
                  ) : (
                    <step.icon size={20} />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-teal-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-teal-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <User className="mr-2" size={24} />
                  Покупатель
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="+992 (__) ___-__-__"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Эл. почта *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Truck className="mr-2" size={24} />
                    Тип доставки
                  </h2>
                  <div className="text-sm text-gray-600">
                    Ваш город: <span className="text-teal-600 font-medium">{formData.city}</span>
                    <button className="ml-2 text-teal-600 hover:text-teal-700">Изменить</button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Home Delivery */}
                  <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.deliveryType === 'home' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
                  }`} onClick={() => handleInputChange('deliveryType', 'home')}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.deliveryType === 'home'}
                          onChange={() => handleInputChange('deliveryType', 'home')}
                          className="mr-3"
                        />
                        <div>
                          <h3 className="font-medium">Доставка на дом</h3>
                          <p className="text-sm text-gray-600">Сроки доставки уточнит менеджер при обработке заказа, 1 000 ₽</p>
                        </div>
                      </div>
                      <ChevronDown className={`transform transition-transform ${
                        formData.deliveryType === 'home' ? 'rotate-180' : ''
                      }`} size={20} />
                    </div>
                  </div>

                  {/* Pickup */}
                  <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.deliveryType === 'pickup' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
                  }`} onClick={() => handleInputChange('deliveryType', 'pickup')}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.deliveryType === 'pickup'}
                        onChange={() => handleInputChange('deliveryType', 'pickup')}
                        className="mr-3"
                      />
                      <div>
                        <h3 className="font-medium">Самовывоз со склада или из магазина Аскона</h3>
                        <p className="text-sm text-gray-600">Бесплатно</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Fields for Home Delivery */}
                {formData.deliveryType === 'home' && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Адрес доставки *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          placeholder="Улица, дом"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            errors.address ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle size={16} className="mr-1" />
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Квартира
                        </label>
                        <input
                          type="text"
                          value={formData.apartment}
                          onChange={(e) => handleInputChange('apartment', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Подъезд
                        </label>
                        <input
                          type="text"
                          value={formData.entrance}
                          onChange={(e) => handleInputChange('entrance', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Этаж
                        </label>
                        <input
                          type="text"
                          value={formData.floor}
                          onChange={(e) => handleInputChange('floor', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Домофон
                        </label>
                        <input
                          type="text"
                          value={formData.intercom}
                          onChange={(e) => handleInputChange('intercom', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <CreditCard className="mr-2" size={24} />
                  Способ оплаты
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Online Payment */}
                  <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.paymentMethod === 'online' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
                  }`} onClick={() => handleInputChange('paymentMethod', 'online')}>
                    <div className="text-center">
                      <CreditCard className="mx-auto mb-2 text-teal-600" size={32} />
                      <input
                        type="radio"
                        checked={formData.paymentMethod === 'online'}
                        onChange={() => handleInputChange('paymentMethod', 'online')}
                        className="mb-2"
                      />
                      <h3 className="font-medium">Оплата онлайн</h3>
                      <p className="text-sm text-gray-600">Visa, Mastercard, МИР, СБП и Халва</p>
                    </div>
                  </div>

                  {/* Cash on Delivery */}
                  <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.paymentMethod === 'cash' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
                  }`} onClick={() => handleInputChange('paymentMethod', 'cash')}>
                    <div className="text-center">
                      <Home className="mx-auto mb-2 text-teal-600" size={32} />
                      <input
                        type="radio"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={() => handleInputChange('paymentMethod', 'cash')}
                        className="mb-2"
                      />
                      <h3 className="font-medium">При получении</h3>
                      <p className="text-sm text-gray-600">Наличными или картой курьеру</p>
                    </div>
                  </div>

                  {/* Installment */}
                  <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.paymentMethod === 'installment' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
                  }`} onClick={() => handleInputChange('paymentMethod', 'installment')}>
                    <div className="text-center">
                      <div className="mx-auto mb-2 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">%</span>
                      </div>
                      <input
                        type="radio"
                        checked={formData.paymentMethod === 'installment'}
                        onChange={() => handleInputChange('paymentMethod', 'installment')}
                        className="mb-2"
                      />
                      <h3 className="font-medium">Оплата частями</h3>
                      <p className="text-sm text-gray-600">4 платежа по 2735 ₽ без переплат</p>
                      <Info className="mx-auto mt-1 text-gray-400" size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="bg-white rounded-lg shadow p-6">
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
                      invoices: {
                        is_hold_required: false,
                        is_outbox_marked: false
                      }
                    }}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    disabled={Object.keys(errors).length > 0 || loading}
                  >
                    Оплатить онлайн
                  </PaymentButton>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-500 text-white py-4 rounded-lg font-semibold hover:bg-teal-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Обработка заказа...
                      </>
                    ) : (
                      'Оформить заказ'
                    )}
                  </button>
                )}
                
                <p className="mt-4 text-sm text-gray-600 text-center">
                  При оформлении заказа мы осуществляем обработку ваших персональных данных. 
                  Указывая свой контактный номер телефона, вы подтверждаете ознакомление{' '}
                  <a href="#" className="text-teal-600 hover:text-teal-700">
                    с договором-офертой и условиями обработки персональных данных
                  </a>.
                </p>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Состав заказа ({items.length})</h3>
                <button
                  onClick={() => setShowOrderSummary(!showOrderSummary)}
                  className="lg:hidden"
                >
                  <ChevronDown className={`transform transition-transform ${
                    showOrderSummary ? 'rotate-180' : ''
                  }`} size={20} />
                </button>
              </div>

              <div className={`space-y-4 ${showOrderSummary ? 'block' : 'hidden lg:block'}`}>
                {items.map((item) => (
                  <div key={item.id} className="flex space-x-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      {item.size && (
                        <p className="text-sm text-gray-600">{item.size}</p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-medium">{item.price.toLocaleString()} ₽</span>
                        <span className="text-sm text-gray-600">{item.quantity} шт.</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Товары ({items.length})</span>
                    <span>{total.toLocaleString()} ₽</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Скидка</span>
                    <span className="text-red-600">-{calculateDiscount().toLocaleString()} ₽</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Доставка</span>
                    <span>{calculateDeliveryFee().toLocaleString()} ₽</span>
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Итого</span>
                      <span>{calculateFinalTotal().toLocaleString()} ₽</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;