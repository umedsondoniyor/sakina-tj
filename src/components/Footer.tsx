import React from 'react';
import FooterSection from './footer/FooterSection';
import MobileFooterAccordion from './footer/MobileFooterAccordion';
import SocialMediaSection from './footer/SocialMediaSection';
import AppStoreLinks from './footer/AppStoreLinks';

const footerLinks = {
  catalog: {
    title: 'Каталог',
    links: [
      'Матрасы',
      'Кровати',
      'Диваны',
      'Наматрасники',
      'Подушки',
      'Одеяла',
      'Постельное белье',
      'Мебель',
      'Фотоальбы'
    ]
  },
  company: {
    title: 'О компании',
    links: [
      'Принципы и миссия',
      'Социальная политика',
      'История компании',
      'Работа в Sakina',
      'Производство',
      'Лаборатория сна',
      'Сертификаты',
      'Видеообзор продукции',
      'Новости',
      'Частые вопросы'
    ]
  },
  customers: {
    title: 'Покупателям',
    links: [
      'Дисконт-центр',
      'Акции и скидки',
      'Доставка и оплата',
      'Подарочные сертификаты',
      'Каталог тканей',
      'Как оформить заказ',
      'Политика конфиденциальности',
      'Услуги',
      'Рассрочка',
      'Обмен и возврат товара',
      'Сроки изготовления',
      'Карта сайта'
    ]
  },
  health: {
    title: 'О здоровом сне',
    links: [
      'Блог Sleep Club',
      'Из чего состоит здоровье',
      'Сколько нужно спать',
      'Как улучшить свой сон',
      'Как обустроить спальню для здорового сна',
      'Безопасность детских товаров'
    ]
  },
  contacts: {
    title: 'Контакты',
    links: [
      'Контакты подразделений',
      'Оптовые продажи'
    ]
  },
  partners: {
    title: 'Партнерам',
    links: [
      'Поставщикам',
      'Франчайзинг',
      'Предложения для отелей',
      'Оптовый каталог',
      'Международная кооперация',
      'Сотрудничество с дизайнерами и архитекторами'
    ]
  }
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

              <AppStoreLinks />
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
                <p>© 1990–2025</p>
                <p>Компания ООО «Sakina»</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;