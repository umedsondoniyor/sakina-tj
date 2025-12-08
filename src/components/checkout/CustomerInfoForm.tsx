import React from 'react';
import { User, Phone, Mail, AlertCircle, Award } from 'lucide-react';

interface CustomerInfoFormProps {
  formData: {
    phone: string;
    name: string;
    email: string;
  };
  errors: Record<string, string>;
  onInputChange: (field: string, value: string) => void;
  onPhoneChange: (value: string) => void;
  clubMember?: { discount_percentage: number; member_tier: string; full_name: string } | null;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  formData,
  errors,
  onInputChange,
  onPhoneChange,
  clubMember
}) => {
  return (
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
              onChange={(e) => onPhoneChange(e.target.value)}
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
          {clubMember && clubMember.discount_percentage > 0 && (
            <div className="mt-2 p-2 bg-teal-50 border border-teal-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-teal-700">
                <Award size={16} className="text-teal-600" />
                <span className="font-medium">
                  Скидка {clubMember.discount_percentage}% применена (Клуб Sakina)
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Имя *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
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
            Эл. почта <span className="text-gray-400 text-xs">(необязательно)</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
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
  );
};

export default CustomerInfoForm;