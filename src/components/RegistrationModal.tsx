import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
    setPhone(formatted);
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
    
    // Validate phone number
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    
    // Validate name
    if (!fullName.trim()) {
      setError('Имя и фамилия обязательны');
      return;
    }
    
    // Validate date of birth
    if (!dateOfBirth) {
      setError('Дата рождения обязательна');
      return;
    }
    
    setLoading(true);

    try {
      // Create user profile without authentication
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            phone,
            full_name: fullName,
            date_of_birth: dateOfBirth,
            role: 'user'
          }
        ]);

      if (profileError) throw profileError;

      setError('');
      setPhone('');
      setFullName('');
      setDateOfBirth('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Регистрация</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+992 (__) ___-__-__"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя и фамилия
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата рождения
              </label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !phone || !fullName || !dateOfBirth}
              className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>
              Регистрируясь, вы соглашаетесь с{' '}
              <a href="#" className="text-teal-600 hover:text-teal-700">
                условиями обработки персональных данных
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;