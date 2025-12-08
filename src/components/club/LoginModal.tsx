import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TAJ_CODE = '992';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const formatDisplay = (digitsOnly: string) => {
    let d = digitsOnly.replace(/\D/g, '');
    if (!d.startsWith(TAJ_CODE)) d = TAJ_CODE + d;
    d = d.slice(0, 12);

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
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const { display, digits: normalized } = formatDisplay(digits);
    setPhoneDisplay(display);
    setPhoneDigits(normalized);
  };

  const e164Phone = phoneDigits.length === 12 ? `+${phoneDigits}` : '';

  const validatePhone = (): string => {
    if (phoneDigits.length !== 12) return 'Номер телефона должен содержать 12 цифр (+992 и 9 цифр).';
    if (!phoneDigits.startsWith(TAJ_CODE)) return 'Номер должен начинаться с +992.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const phoneErr = validatePhone();
    if (phoneErr) return setError(phoneErr);

    setLoading(true);
    try {
      // Find club member by phone
      const { data: member, error: memberError } = await supabase
        .from('club_members')
        .select('*')
        .eq('phone', e164Phone)
        .eq('is_active', true)
        .maybeSingle();

      if (memberError) throw memberError;

      if (!member) {
        setError('Клубный участник с таким номером не найден. Пожалуйста, зарегистрируйтесь.');
        return;
      }

      // If member has user_id, try to sign in
      if (member.user_id) {
        const tempEmail = `phone_${phoneDigits}@sakina.tj`;
        const tempPassword = `Sakina${phoneDigits.slice(-6)}!`;

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: tempEmail,
          password: tempPassword,
        });

        if (signInError) {
          // If sign in fails, member exists but auth account might not
          // Still allow access as club member (phone-based)
          toast.success(`Добро пожаловать, ${member.full_name}!`);
          onSuccess();
          onClose();
          return;
        }
      }

      toast.success(`Добро пожаловать, ${member.full_name}!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Произошла ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="login-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className="w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-lg"
      >
        <div className="relative px-5 pt-4 pb-2 md:px-6 md:pt-5 md:pb-3 border-b">
          <h2 id="login-title" className="text-xl md:text-2xl font-bold">
            Вход в Клуб Sakina
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 p-2 -m-2 text-gray-500 hover:text-gray-700 rounded-lg"
            aria-label="Закрыть"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-5 py-4 md:px-6 md:py-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                id="login-phone"
                ref={firstFieldRef}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phoneDisplay}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+992 90 123-45-67"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-invalid={!!error && !e164Phone}
              />
              <p className="mt-1 text-xs text-gray-500">Формат: +992 XX XXX-XX-XX</p>
            </div>

            <button
              type="submit"
              disabled={loading || !e164Phone}
              aria-busy={loading}
              className="w-full bg-teal-500 text-white py-2.5 rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Вход…' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LoginModal;

