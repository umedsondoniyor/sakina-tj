import React from 'react';
import { Truck, MapPin, ChevronDown, AlertCircle } from 'lucide-react';

interface DeliveryFormProps {
  formData: {
    deliveryType: 'home' | 'pickup';
    city: string;
    address: string;
    apartment: string;
    entrance: string;
    floor: string;
    intercom: string;
  };
  errors: Record<string, string>;
  onInputChange: (field: string, value: string | boolean) => void;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
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
        }`} onClick={() => onInputChange('deliveryType', 'home')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="radio"
                name="deliveryType"
                checked={formData.deliveryType === 'home'}
                onChange={(e) => {
                  if (e.target.checked) {
                    onInputChange('deliveryType', 'home');
                  }
                }}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium">Доставка на дом</h3>
                <p className="text-sm text-gray-600">Сроки доставки уточнит менеджер при обработке заказа, 0 с. в Душанбе</p>
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
        }`} onClick={() => onInputChange('deliveryType', 'pickup')}>
          <div className="flex items-center">
            <input
              type="radio"
              name="deliveryType"
              checked={formData.deliveryType === 'pickup'}
              onChange={(e) => {
                if (e.target.checked) {
                  onInputChange('deliveryType', 'pickup');
                }
              }}
              className="mr-3"
            />
            <div>
              <h3 className="font-medium">Самовывоз со склада или из магазина Sakina</h3>
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
                onChange={(e) => onInputChange('address', e.target.value)}
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
                onChange={(e) => onInputChange('apartment', e.target.value)}
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
                onChange={(e) => onInputChange('entrance', e.target.value)}
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
                onChange={(e) => onInputChange('floor', e.target.value)}
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
                onChange={(e) => onInputChange('intercom', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryForm;