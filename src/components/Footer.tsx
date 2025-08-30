import React from 'react';
import FooterSection from './footer/FooterSection';
import MobileFooterAccordion from './footer/MobileFooterAccordion';
import SocialMediaSection from './footer/SocialMediaSection';

const footerLinks = {
  catalog: {
    title: 'Каталог',
    links: [
      'Матрасы',
      'Подушки',
      'Одеяла',
      'Кровати',
      'Диваны',
      'Наматрасники',
    ]
  },
  company: {
    title: 'О компании',
    links: [
      'История компании',
      'Частые вопросы'
    ]
  },
  health: {
    title: 'О здоровом сне',
    links: [
      'Блог Sleep Club',
      'Из чего состоит здоровье',
      'Сколько нужно спать',
      'Как улучшить свой сон',
    ]
  },
  contacts: {
    title: 'Контакты',
    links: [
      'Контакты подразделений',
    ]
  },
};

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-8 md:pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        <MobileFooterAccordion footerLinks={footerLinks} />

        {/* Desktop Footer Links */}
        <div className="hidden md:grid md:grid-cols-6 gap-8 mb-12">
          {Object.entries(footerLinks).map(([key, section]) => (
            <FooterSection
              key={key}
              title={section.title}
              links={section.links}
            />
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
            <div className="space-y-6 md:space-y-4">
              <SocialMediaSection />
            </div>

            {/* Payment Methods and Copyright */}
            <div className="text-center md:text-right">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                alt="Visa"
                className="h-6 inline-block mb-4"
              />
              <div className="text-sm text-gray-500">
                <p>Политика конфиденциальности</p>
                <p>© 2023–2025</p>
                <p>Компания «Sakina»</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;