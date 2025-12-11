import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft } from 'lucide-react';
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
  const otpInputRef = useRef<HTMLInputElement>(null);

  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setStep('phone');
      setOtpCode('');
      setOtpSent(false);
      setPhoneDisplay('');
      setPhoneDigits('');
      setError('');
      setCountdown(0);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Focus first input when opened
  useEffect(() => {
    if (isOpen) {
      if (step === 'phone') {
        setTimeout(() => firstFieldRef.current?.focus(), 0);
      } else if (step === 'otp') {
        setTimeout(() => otpInputRef.current?.focus(), 0);
      }
    }
  }, [isOpen, step]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const phoneErr = validatePhone();
    if (phoneErr) return setError(phoneErr);

    setSendingOtp(true);
    try {
      const { data, error: otpError } = await supabase.functions.invoke('send-club-login-otp', {
        body: { phone: e164Phone }
      });

      if (otpError) throw otpError;

      if (!data?.success) {
        throw new Error(data?.error || 'Не удалось отправить код');
      }

      setOtpSent(true);
      setStep('otp');
      setCountdown(60); // 60 seconds before resend allowed
      toast.success('Код отправлен на ваш номер телефона');
    } catch (err: any) {
      console.error('OTP send error:', err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Не удалось отправить код. Попробуйте позже.';
      setError(errorMessage);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpCode.length !== 6) {
      setError('Код должен содержать 6 цифр');
      return;
    }

    setLoading(true);
    try {
      const { data, error: verifyError } = await supabase.functions.invoke('verify-club-login-otp', {
        body: { phone: e164Phone, code: otpCode }
      });

      if (verifyError) {
        const errorData = verifyError as any;
        throw new Error(errorData?.message || errorData?.error || 'Ошибка проверки кода');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Неверный код');
      }

      // Save member phone to localStorage for quick access
      localStorage.setItem('club_member_phone', e164Phone);

      // If member has user_id, try to sign in
      if (data.member?.user_id) {
        const tempEmail = `phone_${phoneDigits}@sakina.tj`;
        const tempPassword = `Sakina${phoneDigits.slice(-6)}!`;

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: tempEmail,
          password: tempPassword,
        });

        // Don't fail if sign-in fails - OTP is verified
        if (signInError) {
          console.warn('Auth sign-in skipped:', signInError);
        }
      }

      toast.success(`Добро пожаловать, ${data.member?.full_name || 'участник'}!`);
      onSuccess();
      onClose();
      
      // Reset form
      setStep('phone');
      setOtpCode('');
      setOtpSent(false);
      setPhoneDisplay('');
      setPhoneDigits('');
    } catch (err: any) {
      console.error('OTP verify error:', err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Неверный код. Попробуйте еще раз.';
      setError(errorMessage);
      setOtpCode(''); // Clear OTP on error
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setSendingOtp(true);
    setError('');
    try {
      const { data, error: otpError } = await supabase.functions.invoke('send-club-login-otp', {
        body: { phone: e164Phone }
      });

      if (otpError) {
        const errorData = otpError as any;
        throw new Error(errorData?.message || errorData?.error || 'Ошибка отправки кода');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Не удалось отправить код');
      }

      setCountdown(60);
      toast.success('Новый код отправлен');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Не удалось отправить код. Попробуйте позже.';
      setError(errorMessage);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtpCode('');
    setOtpSent(false);
    setError('');
    setCountdown(0);
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

          {step === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
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
                disabled={sendingOtp || !e164Phone}
                aria-busy={sendingOtp}
                className="w-full bg-brand-turquoise text-white hover:bg-brand-navy transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {sendingOtp ? 'Отправка кода…' : 'Получить код'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <button
                type="button"
                onClick={handleBackToPhone}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft size={16} />
                Изменить номер
              </button>

              <div>
                <label htmlFor="login-otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Код подтверждения
                </label>
                <input
                  id="login-otp"
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtpCode(value);
                  }}
                  placeholder="000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-center text-2xl tracking-widest font-mono"
                  aria-invalid={!!error && otpCode.length !== 6}
                />
                <p className="mt-1 text-xs text-gray-500 text-center">
                  Введите 6-значный код, отправленный на {phoneDisplay}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Не получили код?
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || sendingOtp}
                  className="text-teal-600 hover:text-teal-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Отправить снова (${countdown}с)` : 'Отправить снова'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                aria-busy={loading}
                className="w-full bg-brand-turquoise text-white hover:bg-brand-navy transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Проверка…' : 'Войти'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LoginModal;

