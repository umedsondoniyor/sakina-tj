import React from 'react';
import { MessageCircle, HelpCircle } from 'lucide-react';
import ContactCard from './contact/ContactCard';

const ContactSection = () => {
  return (
    <div className="bg-teal-500 text-white py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-8 md:mb-12">Всегда на связи</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <ContactCard
            icon={MessageCircle}
            title="Напишите или позвоните нам"
            description="Консультанты Sakina готовы ответить на любой ваш вопрос. Тел: +992 90 533 9595"
            buttonText="Задать вопрос"
          />

          <ContactCard
            icon={HelpCircle}
            title="Узнайте ответы на частые вопросы"
            description="Мы собрали самые популярные вопросы пользователей в одном удобном разделе."
            buttonText="Узнать"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactSection;