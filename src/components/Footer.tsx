// src/components/Footer.tsx
import React from 'react';
import FooterSection from './footer/FooterSection';
import MobileFooterAccordion from './footer/MobileFooterAccordion';
import SocialMediaSection from './footer/SocialMediaSection';

const footerLinks = {
  catalog: {
    title: 'Каталог',
    links: [
      { label: 'Матрасы', href: '/mattresses' },
      { label: 'Подушки', href: '/products?category=podushki' },
      { label: 'Одеяла', href: '/products?category=odeyala' },
      { label: 'Кровати', href: '/products?category=krovati' },
      { label: 'Диваны', href: '/products?category=divany' },
      { label: 'Наматрасники', href: '/products?category=namatrasniki' },
    ],
  },
  company: {
    title: 'О компании',
    links: [
      { label: 'История компании', href: '/about' },
      { label: 'Частые вопросы', href: '/faq' },
    ],
  },
  health: {
    title: 'О здоровом сне',
    links: [
      { label: 'Блог Sleep Club', href: '/blog' },
      { label: 'Из чего состоит здоровье', href: '/blog?tag=health' },
      { label: 'Сколько нужно спать', href: '/blog?tag=sleep' },
      { label: 'Как улучшить свой сон', href: '/blog?tag=better-sleep' },
    ],
  },
  contacts: {
    title: 'Контакты',
    links: [
      { label: 'Контакты подразделений', href: '/contacts' },
    ],
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