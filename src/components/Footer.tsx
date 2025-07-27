import React from 'react';
import { Youtube } from 'lucide-react';

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
        {/* Mobile Footer Links - Accordion style */}
        <div className="md:hidden space-y-4">
          {Object.entries(footerLinks).map(([key, section]) => (
            <details key={key} className="group">
              <summary className="flex items-center justify-between cursor-pointer py-2 font-bold">
                {section.title}
                <span className="transform group-open:rotate-180 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="pl-4 pt-2 pb-4">
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-600 hover:text-teal-600">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>

        {/* Desktop Footer Links */}
        <div className="hidden md:grid md:grid-cols-6 gap-8 mb-12">
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-bold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-600 hover:text-teal-600">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
            <div className="space-y-6 md:space-y-4">
              {/* Social Media */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Следите за новостями</p>
                <div className="flex space-x-3">
                  <a href="#" className="text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm-3.692 16.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm4.95-8.15a1.05 1.05 0 110-2.1 1.05 1.05 0 010 2.1z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.003A13.94 13.94 0 0 1 0 19.539a9.88 9.88 0 0 0 7.287-2.041 4.93 4.93 0 0 1-4.6-3.42 4.916 4.916 0 0 0 2.223-.084A4.926 4.926 0 0 1 .96 9.167v-.062a4.887 4.887 0 0 0 2.235.616A4.928 4.928 0 0 1 1.67 3.148a13.98 13.98 0 0 0 10.15 5.144 4.929 4.929 0 0 1 8.39-4.49 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724A9.828 9.828 0 0 0 24 4.555a10.019 10.019 0 0 1-2.457 2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-gray-600">
                    <Youtube className="h-6 w-6" />
                  </a>
                </div>
              </div>

              {/* App Store Links */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Скачайте приложение</p>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
                  <a href="#" className="block">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                      alt="Download on the App Store"
                      className="h-10"
                    />
                  </a>
                  <a href="#" className="block">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      className="h-10"
                    />
                  </a>
                </div>
              </div>
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