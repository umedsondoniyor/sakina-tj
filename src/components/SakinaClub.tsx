import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import RegistrationModal from './RegistrationModal';
import LoginModal from './club/LoginModal';
import ClubBenefits from './club/ClubBenefits';
import { Star, Percent, TrendingUp, LogOut } from 'lucide-react';
import type { ClubMember, ClubHomePromoSettings } from '../lib/types';
import { CLUB_HOME_PROMO_DEFAULT, getClubHomePromoSettings } from '../lib/api';
import toast from 'react-hot-toast';

interface SakinaClubProps {
  /** From `homePageLoader` — guest promo copy, hero, bullets (no flash of wrong text). */
  initialPromo?: ClubHomePromoSettings;
}

const SakinaClub = ({ initialPromo }: SakinaClubProps) => {
  const [promo, setPromo] = useState<ClubHomePromoSettings>(() => initialPromo ?? CLUB_HOME_PROMO_DEFAULT);

  useEffect(() => {
    if (initialPromo !== undefined) {
      setPromo(initialPromo);
      return;
    }
    let cancelled = false;
    getClubHomePromoSettings()
      .then((p) => {
        if (!cancelled) setPromo(p);
      })
      .catch(() => {
        if (!cancelled) setPromo(CLUB_HOME_PROMO_DEFAULT);
      });
    return () => {
      cancelled = true;
    };
  }, [initialPromo]);

  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [member, setMember] = useState<ClubMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMemberStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkMemberStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkMemberStatus = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: memberData, error } = await supabase
          .from('club_members')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (!error && memberData) {
          setMember(memberData as ClubMember);
        }
      } else {
        const savedPhone = localStorage.getItem('club_member_phone');
        if (savedPhone) {
          const { data: memberData, error } = await supabase
            .from('club_members')
            .select('*')
            .eq('phone', savedPhone)
            .eq('is_active', true)
            .maybeSingle();

          if (!error && memberData) {
            setMember(memberData as ClubMember);
          }
        }
      }
    } catch (err) {
      console.error('Error checking member status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    checkMemberStatus();
  };

  const handleRegistrationSuccess = () => {
    checkMemberStatus();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('club_member_phone');
      setMember(null);
      toast.success('Вы вышли из аккаунта');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getTierInfo = (tier: string) => {
    const tierInfo = {
      bronze: { name: 'Бронзовый', color: 'bg-amber-100 text-amber-800', icon: '🥉' },
      silver: { name: 'Серебряный', color: 'bg-gray-100 text-gray-800', icon: '🥈' },
      gold: { name: 'Золотой', color: 'bg-yellow-100 text-yellow-800', icon: '🥇' },
      platinum: { name: 'Платиновый', color: 'bg-purple-100 text-purple-800', icon: '💎' },
    };
    return tierInfo[tier as keyof typeof tierInfo] || tierInfo.bronze;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="bg-gray-50 rounded-2xl">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-2/5 h-80">
            <img
              src={promo.hero_image_url}
              alt=""
              className="w-full h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
            />
          </div>

          <div className="p-6 md:p-8 md:w-3/5">
            {member ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                      Добро пожаловать, {member.full_name}!
                    </h2>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTierInfo(member.member_tier).color}`}
                    >
                      {getTierInfo(member.member_tier).icon} {getTierInfo(member.member_tier).name} участник
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                    aria-label="Выйти"
                  >
                    <LogOut size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm text-gray-600">Баллы</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{member.points}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <Percent className="w-5 h-5 text-teal-500" />
                      <span className="text-sm text-gray-600">Скидка</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{member.discount_percentage}%</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">Покупок</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Intl.NumberFormat('ru-RU').format(member.total_purchases)} TJS
                    </p>
                  </div>
                </div>

                {member.referral_code && (
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg shadow-sm mt-4 border border-teal-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">Ваш реферальный код:</p>
                        <p className="text-xs text-gray-600">
                          Поделитесь кодом с друзьями и получайте 200 баллов за каждого приглашенного!
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <code className="flex-1 px-4 py-3 bg-white rounded-lg font-mono text-xl font-bold text-center border-2 border-teal-300">
                        {member.referral_code}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(member.referral_code!);
                          toast.success('Код скопирован! Поделитесь с друзьями');
                        }}
                        className="px-4 py-3 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy text-sm font-medium transition-colors"
                      >
                        Копировать
                      </button>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-teal-200">
                      <p className="text-xs text-gray-700 mb-1">
                        <span className="font-semibold">Как это работает:</span>
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                        <li>Ваш друг вводит ваш код при регистрации</li>
                        <li>
                          Он получает <span className="font-semibold text-teal-600">100 баллов</span> приветственный бонус
                        </li>
                        <li>
                          Вы получаете <span className="font-semibold text-teal-600">200 баллов</span> за успешное приглашение
                        </li>
                        <li>Баллы можно использовать для получения скидок</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{promo.title}</h2>
                <div className="inline-block bg-[#E8F5E9] px-3 py-1 rounded-full text-sm text-gray-700 mb-4">
                  {promo.badge_text}
                </div>

                <ClubBenefits items={promo.benefits} />

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => setIsRegistrationModalOpen(true)}
                    className="flex-1 bg-brand-turquoise text-white px-6 py-2 rounded-lg hover:bg-brand-navy transition-colors font-semibold"
                  >
                    {promo.cta_register_label}
                  </button>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="flex-1 bg-white border-2 border-teal-600 text-teal-700 px-6 py-2 rounded-lg hover:bg-brand-turquoise hover:text-white transition-colors"
                  >
                    {promo.cta_login_label}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default SakinaClub;
