// src/components/CheckoutPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';

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
  paymentMethod: 'online' | 'cash';
  
  // Gateway Information
  selectedGateway: string,
  
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
    deliveryType: 'home', // **FIX**: Changed back to 'home' as default to match UI expectations
    city: 'Душанбе',
    address: '',
    apartment: '',
    entrance: '',
    floor: '',
    intercom: '',
    paymentMethod: 'online',
    selectedGateway: 'korti_milli', // Default to korti_milli (Alif Bank)
    comments: '',
    sameAsBilling: true
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showOrderSummary, setShowOrderSummary] = useState(true);
  const [clubMember, setClubMember] = useState<{ discount_percentage: number; member_tier: string; full_name: string } | null>(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate('/products');
      toast.error('Корзина пуста');
    }
  }, [items, navigate]);

  // Check for club member when phone number is entered
  useEffect(() => {
    const checkClubMember = async () => {
      if (!formData.phone || formData.phone.length < 12) {
        setClubMember(null);
        return;
      }

      // Clean phone number for lookup
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const e164Phone = cleanPhone.length === 12 ? `+${cleanPhone}` : formData.phone;

      try {
        const { data: member, error } = await supabase
          .from('club_members')
          .select('discount_percentage, member_tier, full_name')
          .eq('phone', e164Phone)
          .eq('is_active', true)
          .maybeSingle();

        if (!error && member) {
          setClubMember(member);
          if (member.discount_percentage > 0) {
            toast.success(`Скидка ${member.discount_percentage}% применена!`, { duration: 3000 });
          }
        } else {
          setClubMember(null);
        }
      } catch (err) {
        console.error('Error checking club member:', err);
        setClubMember(null);
      }
    };

    // Debounce the check
    const timeoutId = setTimeout(checkClubMember, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.phone]);

  // Normalize payment method to ensure consistent values
  const normalizePaymentMethod = (method: string): 'online' | 'cash' => {
    if (typeof method !== 'string') return 'online';
    const normalized = method.toLowerCase().trim();
    // Handle both English and Russian values
    if (normalized === 'online' || normalized === 'оплата онлайн' || normalized.includes('онлайн')) {
      return 'online';
    }
    if (normalized === 'cash' || normalized === 'при получении' || normalized.includes('наличн')) {
      return 'cash';
    }
    // Default to online if unclear
    return 'online';
  };

  // Map gateway selection to Alif Bank API gate values
  const mapGatewayToGate = (gateway: string): string => {
    const gatewayMap: Record<string, string> = {
      'alif_bank': 'korti_milli', // Alif Bank uses korti_milli gateway
      'korti_milli': 'korti_milli', // Korti Milli is a valid gate
      'salom': 'salom',
      'vsa': 'vsa',
      'mcr': 'mcr',
      'wallet': 'wallet',
      'tcell': 'tcell',
      'megafon': 'megafon',
      'babilon': 'babilon',
      'zetmobile': 'zetmobile'
    };
    return gatewayMap[gateway] || 'korti_milli'; // Default to 'korti_milli' if unknown
  };

  // Restore saved form
  useEffect(() => {
    const saved = localStorage.getItem('sakina_checkout_form');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Normalize paymentMethod when loading from localStorage
        if (parsed.paymentMethod) {
          parsed.paymentMethod = normalizePaymentMethod(parsed.paymentMethod);
        }
        setFormData(parsed);
      } catch {}
    }
  }, []);

  // Ensure paymentMethod is always normalized in state
  useEffect(() => {
    const normalized = normalizePaymentMethod(formData.paymentMethod);
    if (normalized !== formData.paymentMethod) {
      setFormData(prev => ({ ...prev, paymentMethod: normalized }));
    }
  }, [formData.paymentMethod]);

  // Save form on change
  useEffect(() => {
    // Ensure paymentMethod is normalized before saving
    const normalizedData = {
      ...formData,
      paymentMethod: normalizePaymentMethod(formData.paymentMethod)
    };
    localStorage.setItem('sakina_checkout_form', JSON.stringify(normalizedData));
  }, [formData]);


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

      // Email is optional, but if provided, must be valid format
      if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
      // No validation needed for payment method selection
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    // Normalize paymentMethod if it's being changed
    if (field === 'paymentMethod' && typeof value === 'string') {
      value = normalizePaymentMethod(value) as any;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
      formatted += ` ${workingDigits.slice(3, 5)}`;
    }
    if (workingDigits.length > 5) {
      formatted += ` ${workingDigits.slice(5, 8)}`;
    }
    if (workingDigits.length > 8) {
      formatted += ` ${workingDigits.slice(8, 10)}`;
    }
    if (workingDigits.length > 10) {
      formatted += ` ${workingDigits.slice(10, 12)}`;
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
    return formData.deliveryType === 'home' ? 0 : 0;
  };

  const calculateDiscount = () => {
    if (clubMember && clubMember.discount_percentage > 0) {
      return Math.round(total * (clubMember.discount_percentage / 100));
    }
    return 0; // No discount if not a club member
  };

  const calculateFinalTotal = () => {
    return total + calculateDeliveryFee() - calculateDiscount();
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      // For pickup orders, create order record with cash payment method
      if (formData.deliveryType === 'pickup') {
        // Generate unique order ID for pickup orders
        const orderId = `SAKINA_PICKUP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const { error: orderError } = await supabase
          .from('payments')
          .insert({
            alif_order_id: orderId,
            amount: calculateFinalTotal(),
            currency: 'TJS',
            status: 'pending',
            customer_name: formData.name,
            customer_phone: formData.phone,
            customer_email: formData.email || null,
            delivery_type: 'pickup',
            delivery_address: null,
            payment_gateway: 'cash',
            order_summary: {
              items: items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
              })),
              subtotal: total,
              discount: calculateDiscount(),
              discount_percentage: clubMember?.discount_percentage || 0,
              total_amount: calculateFinalTotal(),
              currency: 'TJS',
              customer_info: {
                name: formData.name,
                phone: formData.phone,
                email: formData.email || null
              },
              delivery_info: {
                delivery_type: 'pickup',
                delivery_address: null
              },
              timestamp: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (orderError) {
          console.error('Error creating pickup order:', orderError);
          toast.error('Ошибка при оформлении заказа');
          return;
        }

        toast.success('Заказ оформлен! Вы можете забрать его в магазине.');
        clearCart();
        localStorage.removeItem('sakina_checkout_form');
        navigate('/order-confirmation');
        return;
      }

      // For home delivery with cash payment, create order record
      // Generate unique order ID for cash payment orders
      const orderId = `SAKINA_CASH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error: orderError } = await supabase
        .from('payments')
        .insert({
          alif_order_id: orderId,
          amount: calculateFinalTotal(),
          currency: 'TJS',
          status: 'pending',
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email || null,
          delivery_type: formData.deliveryType,
          delivery_address: formData.address,
          payment_gateway: 'cash',
          order_summary: {
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity
            })),
            subtotal: total,
            discount: calculateDiscount(),
            discount_percentage: clubMember?.discount_percentage || 0,
            total_amount: calculateFinalTotal(),
            currency: 'TJS',
            customer_info: {
              name: formData.name,
              phone: formData.phone,
              email: formData.email || null
            },
            delivery_info: {
              delivery_type: formData.deliveryType,
              delivery_address: formData.address,
              city: formData.city,
              apartment: formData.apartment,
              entrance: formData.entrance,
              floor: formData.floor,
              intercom: formData.intercom
            },
            timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (orderError) throw orderError;

      toast.success('Заказ успешно оформлен!');
      clearCart();
      localStorage.removeItem('sakina_checkout_form');
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Error creating order:', error);
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
            onInputChange={(field: string, value: string | boolean) => handleInputChange(field as keyof FormData, value)}
            onPhoneChange={handlePhoneChange}
            clubMember={clubMember}
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
            onInputChange={(field: string, value: string | boolean) => handleInputChange(field as keyof FormData, value)}
          />
        );
      case 3:
        return (
          <PaymentMethodForm
            paymentMethod={formData.paymentMethod}
            onPaymentMethodChange={(method) => handleInputChange('paymentMethod', method)}
            selectedGateway={formData.selectedGateway}
            onGatewayChange={(gateway) => handleInputChange('selectedGateway', gateway)}
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
                  {normalizePaymentMethod(formData.paymentMethod) === 'online' ? 'Оплата онлайн' : 
                   'При получении'}
                  {normalizePaymentMethod(formData.paymentMethod) === 'online' && formData.selectedGateway && (
                    <span className="block text-xs text-teal-600">
                      через {formData.selectedGateway === 'korti_milli' ? 'Корти Милли' : 
                            formData.selectedGateway === 'vsa' ? 'Visa' :
                            formData.selectedGateway === 'mcr' ? 'Mastercard' :
                            formData.selectedGateway === 'wallet' ? 'Alif Wallet' :
                            formData.selectedGateway === 'salom' ? 'Alif Salom' :
                            formData.selectedGateway === 'tcell' ? 'Tcell' :
                            formData.selectedGateway === 'megafon' ? 'Megafon' :
                            formData.selectedGateway === 'babilon' ? 'Babilon' :
                            formData.selectedGateway === 'zetmobile' ? 'Zet Mobile' :
                            formData.selectedGateway}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {/* Final Payment/Submit */}
            {normalizePaymentMethod(formData.paymentMethod) === 'online' ? (
              <PaymentButton
                amount={calculateFinalTotal()}
                currency="TJS"
                gate={mapGatewayToGate(formData.selectedGateway)}
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
                    email: formData.email || '', // Always include email, even if empty
                    phone: formData.phone
                  },
                  deliveryInfo: {
                    delivery_type: formData.deliveryType,
                    delivery_address: formData.deliveryType === 'home' ? formData.address : null,
                    city: formData.city,
                    apartment: formData.apartment,
                    entrance: formData.entrance,
                    floor: formData.floor,
                    intercom: formData.intercom
                  },
                  discount: calculateDiscount(),
                  discount_percentage: clubMember?.discount_percentage || 0,
                  club_member_tier: clubMember?.member_tier || null,
                  subtotal: total
                }}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                disabled={loading}
              >
                Оплатить {formatCurrency(calculateFinalTotal())}
              </PaymentButton>
            ) : (
              <button
                onClick={createOrder}
                disabled={loading}
                className="w-full bg-brand-turquoise text-white py-4 rounded-lg hover:bg-brand-navy transition-colors disabled:bg-gray-400"
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
                    className="px-6 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy transition-colors"
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
              clubMember={clubMember}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;