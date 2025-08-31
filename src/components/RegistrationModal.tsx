import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAJ_CODE = '992'; // Tajikistan
const E164_PREFIX = `+${TAJ_CODE}`;

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [phoneDisplay, setPhoneDisplay] = useState('');     // formatted +992 xx xxx-xx-xx
  const [phoneDigits, setPhoneDigits]   = useState('');     // digits only, starts with 992...
  const [fullName, setFullName]         = useState('');
  const [dateOfBirth, setDateOfBirth]   = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Focus first input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // very light focus trap:
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus(); e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus(); e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Formatting helpers
  const formatDisplay = useCallback((digitsOnly: string) => {
    // ensure starts with 992; if user types local number, prepend 992
    let d = digitsOnly.replace(/\D/g, '');
    if (!d.startsWith(TAJ_CODE)) d = TAJ_CODE + d;

    // Limit to country(3) + 9 = 12 total
    d = d.slice(0, 12);

    // Build formatted string: +992 xx xxx-xx-xx
    const cc = d.slice(0, 3);
    const p1 = d.slice(3, 5);
    const p2 = d.slice(5, 8);
    const p3 = d.slice(8, 10);
    const p4 = d.slice(10, 12);

    let out = `+${cc}`;
    if (p1) out += ` ${p1}`;
    if (p2) out += ` ${p2}`;
    if (p3) out += `-${p3}`;
    if (p4) out += `-${p4}`;
    return { display: out, digits: d };
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    // user might paste '+992...' or local 'xx...'—normalize both
    const digits = value.replace(/\D/g, '');
    const { display, digits: normalized } = formatDisplay(digits);
    setPhoneDisplay(display);
    setPhoneDigits(normalized);
  }, [formatDisplay]);

  const e164Phone = useMemo(() => {
    // expect '992' + 9 digits (total 12)
    return phoneDigits.length === 12 ? `+${phoneDigits}` : '';
  }, [phoneDigits]);

  const validatePhone = useCallback((): string => {
    if (phoneDigits.length !== 12) return 'Номер телефона должен содержать 12 цифр (+992 и 9 цифр).';
    if (!phoneDigits.startsWith(TAJ_CODE)) return 'Номер должен начинаться с +992.';
    return '';
  }, [phoneDigits]);

  const validateDOB = useCallback((): string => {
    if (!dateOfBirth) return 'Дата рождения обязательна.';
    const today = new Date();
    const dob = new Date(dateOfBirth);
    if (dob > today) return 'Дата рождения не может быть в будущем.';
    return '';
  }, [dateOfBirth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const phoneErr = validatePhone();
    if (phoneErr) return setError(phoneErr);

    if (!fullName.trim()) return setError('Имя и фамилия обязательны.');

    const dobErr = validateDOB();
    if (dobErr) return setError(dobErr);

    setLoading(true);
    try {
      // store normalized phone (E.164), plus unformatted label if you want
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          phone: e164Phone || phoneDisplay,  // prefer normalized
          phone_raw: phoneDigits,            // optional raw storage
          full_name: fullName.trim(),
          date_of_birth: dateOfBirth,
          role: 'user',
        }]);

      if (profileError) throw profileError;

      // reset form
      setPhoneDisplay(''); setPhoneDigits('');
      setFullName(''); setDateOfBirth('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Произошла ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Render via portal (safest for stacking + sticky parents)
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4"
      onMouseDown={(e) => {
        // close on backdrop click only (not when clicking inside dialog)
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="registration-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className="
          w-full md:max-w-md
          bg-white
          rounded-t-2xl md:rounded-2xl
          shadow-lg
          pt-[max(1rem,env(safe-area-inset-top))]
        "
      >
        {/* Header */}
        <div className="relative px-5 pt-4 pb-2 md:px-6 md:pt-5 md:pb-3 border-b">
          <h2 id="registration-title" className="text-xl md:text-2xl font-bold">
            Регистрация
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 p-2 -m-2 text-gray-500 hover:text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Закрыть"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 md:px-6 md:py-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                id="phone"
                ref={firstFieldRef}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phoneDisplay}
                onChange={(e) => handlePhoneChange(e.target.val
