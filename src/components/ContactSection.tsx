import React from 'react';
import { MessageCircle, HelpCircle } from 'lucide-react';

const ContactSection = () => {
  return (
    <div className="bg-teal-500 text-white py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-8 md:mb-12">Всегда на связи</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* Write or Call Us */}
          <div className="flex space-x-4 md:space-x-6">
            <div className="flex-shrink-0">
              <MessageCircle size={36} className="text-white md:w-12 md:h-12" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Напишите или позвоните нам</h3>
              <p className="text-sm md:text-base mb-4">
                Консультанты Sakina готовы ответить на любой ваш вопрос. Тел: +992 90 533 9595
              </p>
              <button className="text-white text-sm md:text-base border border-white px-4 md:px-6 py-2 rounded hover:bg-white hover:text-teal-600 transition-colors">
                Задать вопрос
              </button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="flex space-x-4 md:space-x-6">
            <div className="flex-shrink-0">
              <HelpCircle size={36} className="text-white md:w-12 md:h-12" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Узнайте ответы на частые вопросы</h3>
              <p className="text-sm md:text-base mb-4">
                Мы собрали самые популярные вопросы пользователей в одном удобном разделе.
              </p>
              <button className="text-white text-sm md:text-base border border-white px-4 md:px-6 py-2 rounded hover:bg-white hover:text-teal-600 transition-colors">
                Узнать
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;