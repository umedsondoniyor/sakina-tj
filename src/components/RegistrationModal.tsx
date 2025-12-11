import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TAJ_CODE = '992'; // Tajikistan

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [phoneDisplay, setPhoneDisplay] = useState('');     // formatted +992 xx xxx-xx-xx
  const [phoneDigits, setPhoneDigits]   = useState('');     // digits only, starts with 992...
  const [fullName, setFullName]         = useState('');
  const [dateOfBirth, setDateOfBirth]   = useState('');
  const [referralCode, setReferralCode] = useState('');     // optional referral code
  const [referralCodeValid, setReferralCodeValid] = useState<boolean | null>(null); // null = not checked, true = valid, false = invalid
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [validatingReferral, setValidatingReferral] = useState(false);

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

    // Validate referral code if provided
    if (referralCode.trim() && referralCodeValid !== true) {
      setError('Пожалуйста, дождитесь проверки реферального кода или удалите его.');
      return;
    }

    setLoading(true);
    try {
      // Generate a temporary email from phone number for auth
      const tempEmail = `phone_${phoneDigits}@sakina.tj`;
      // Generate a random password (user won't need to use it for phone-based auth)
      const tempPassword = `Sakina${phoneDigits.slice(-6)}!`;

      // Step 1: Create auth user
      let authData: { user: { id: string } | null } | null = null;
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            phone: e164Phone || phoneDisplay,
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) {
        // If user already exists, try to sign in and get the user ID
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: tempEmail,
            password: tempPassword,
          });

          if (signInError) {
            // If sign in fails, the user exists but password might be different
            // Try to get user by checking if profile exists with this phone
            const { data: existingProfile } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('phone', e164Phone || phoneDisplay)
              .maybeSingle();

            if (existingProfile) {
              throw new Error('Пользователь с таким номером телефона уже зарегистрирован. Пожалуйста, войдите в систему.');
            }
            throw new Error('Ошибка при входе. Попробуйте позже.');
          }
          authData = signInData;
        } else {
          throw signUpError;
        }
      } else {
        authData = signUpData;
      }

      // Ensure we have a user ID
      let userId: string;
      if (authData?.user?.id) {
        userId = authData.user.id;
      } else {
        // Try to get current user as fallback
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) {
          throw new Error('Не удалось создать пользователя. Попробуйте позже.');
        }
        userId = user.id;
      }

      // Step 2: Create or update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          phone: e164Phone || phoneDisplay,  // E.164 format: +992XXXXXXXXX
          full_name: fullName.trim(),
          date_of_birth: dateOfBirth,
          role: 'user',
        }, {
          onConflict: 'id',
        });

      if (profileError) throw profileError;

      // Step 3: Validate referral code if provided
      let referrerId: string | null = null;
      if (referralCode.trim()) {
        const { data: referrer, error: refError } = await supabase
          .from('club_members')
          .select('id')
          .eq('referral_code', referralCode.trim().toUpperCase())
          .eq('is_active', true)
          .maybeSingle();

        if (refError || !referrer) {
          throw new Error('Неверный реферальный код. Проверьте код и попробуйте снова.');
        }

        referrerId = referrer.id;
      }

      // Step 4: Create or update club member
      // Generate referral code for new member (fallback if RPC fails)
      let newMemberReferralCode = `SK${phoneDigits.slice(-6).toUpperCase()}`;
      try {
        const { data: codeData, error: codeError } = await supabase.rpc('generate_referral_code');
        if (!codeError && codeData) {
          newMemberReferralCode = codeData;
        }
      } catch (e) {
        // Use fallback code
        console.warn('Could not generate referral code, using fallback:', e);
      }

      // Initial points: 0, but will add referral bonus if applicable
      let initialPoints = 0;
      if (referrerId) {
        initialPoints = 100; // Welcome bonus for using referral code
      }

      const { data: newMember, error: clubMemberError } = await supabase
        .from('club_members')
        .upsert({
          user_id: userId,
          phone: e164Phone || phoneDisplay,
          full_name: fullName.trim(),
          email: tempEmail,
          date_of_birth: dateOfBirth,
          referral_code: newMemberReferralCode,
          referred_by: referrerId,
          member_tier: 'bronze',
          points: initialPoints,
          total_purchases: 0,
          discount_percentage: 0,
          is_active: true,
        }, {
          onConflict: 'phone',
        })
        .select()
        .single();

      if (clubMemberError) {
        console.error('Club member creation error:', clubMemberError);
        // Don't throw - profile was created successfully
        toast.error('Профиль создан, но возникла ошибка при создании клубного участника');
      } else {
        // Save phone to localStorage for quick access
        localStorage.setItem('club_member_phone', e164Phone || phoneDisplay);

        // Award referral bonus if applicable
        if (referrerId && newMember) {
          try {
            // Award points to the referrer (person who shared the code)
            await supabase.rpc('add_member_points', {
              p_member_id: referrerId,
              p_points: 200, // Reward for successful referral
              p_reason: 'referral_bonus',
              p_order_id: null
            });

            // Record points for new member in history
            if (initialPoints > 0) {
              await supabase
                .from('club_member_points_history')
                .insert({
                  member_id: newMember.id,
                  points_change: initialPoints,
                  reason: 'referral_welcome_bonus',
                  order_id: null
                });
            }
          } catch (refBonusError) {
            console.error('Error awarding referral bonus:', refBonusError);
            // Don't fail registration if bonus fails
          }
        }
      }

      // reset form
      setPhoneDisplay(''); setPhoneDigits('');
      setFullName(''); setDateOfBirth('');
      setReferralCode('');
      setReferralCodeValid(null);
      
      if (referrerId) {
        toast.success('Регистрация успешна! Вы получили 100 баллов за использование реферального кода!');
      } else {
        toast.success('Регистрация успешна! Добро пожаловать в Клуб Sakina!');
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.message || 'Произошла ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Early return after all hooks
  if (!isOpen) return null;

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
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+992 90 123-45-67"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-invalid={!!error && !e164Phone}
              />
              <p className="mt-1 text-xs text-gray-500">Формат: +992 XX XXX-XX-XX</p>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                Имя и фамилия
              </label>
              <input
                id="fullname"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иван Петров"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* DOB */}
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Дата рождения
              </label>
              <input
                id="dob"
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                max={new Date().toISOString().slice(0, 10)} // no future dates
              />
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <label htmlFor="referral-code" className="block text-sm font-medium text-gray-700 mb-1">
                Реферальный код <span className="text-gray-400 font-normal">(необязательно)</span>
              </label>
              <div className="relative">
                <input
                  id="referral-code"
                  type="text"
                  value={referralCode}
                  onChange={async (e) => {
                    const code = e.target.value.toUpperCase().trim();
                    setReferralCode(code);
                    setReferralCodeValid(null);
                    
                    // Validate referral code if provided
                    if (code.length >= 6) {
                      setValidatingReferral(true);
                      try {
                        const { data, error } = await supabase
                          .from('club_members')
                          .select('id, full_name')
                          .eq('referral_code', code)
                          .eq('is_active', true)
                          .maybeSingle();
                        
                        if (!error && data) {
                          setReferralCodeValid(true);
                        } else {
                          setReferralCodeValid(false);
                        }
                      } catch (err) {
                        setReferralCodeValid(false);
                      } finally {
                        setValidatingReferral(false);
                      }
                    } else if (code.length === 0) {
                      setReferralCodeValid(null);
                    } else {
                      setReferralCodeValid(false);
                    }
                  }}
                  placeholder="SK123456"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    referralCodeValid === true
                      ? 'border-green-500 focus:ring-green-500 bg-green-50'
                      : referralCodeValid === false
                      ? 'border-red-500 focus:ring-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-teal-500'
                  }`}
                />
                {validatingReferral && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
                  </div>
                )}
                {referralCodeValid === true && !validatingReferral && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                    ✓
                  </div>
                )}
                {referralCodeValid === false && !validatingReferral && referralCode.length > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                    ✗
                  </div>
                )}
              </div>
              {referralCodeValid === true && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ Код подтвержден! Вы получите 100 баллов при регистрации
                </p>
              )}
              {referralCodeValid === false && referralCode.length > 0 && (
                <p className="mt-1 text-xs text-red-600">
                  ✗ Неверный код. Проверьте код и попробуйте снова
                </p>
              )}
              {referralCode.length === 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Есть реферальный код? Введите его и получите 100 баллов при регистрации!
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !e164Phone || !fullName.trim() || !dateOfBirth}
              aria-busy={loading}
              className="
                w-full bg-brand-turquoise text-white py-2.5 rounded-lg
                hover:bg-brand-turquoise transition-colors
                disabled:bg-gray-300 disabled:cursor-not-allowed
              "
            >
              {loading ? 'Регистрация…' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="mt-4 text-xs text-gray-500 text-center pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            Регистрируясь, вы соглашаетесь с{' '}
            <a href="#" className="text-teal-600 hover:text-teal-700 underline underline-offset-2">
              условиями обработки персональных данных
            </a>.
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RegistrationModal;
