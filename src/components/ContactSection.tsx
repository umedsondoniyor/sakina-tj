import React from 'react';
import { MessageCircle, HelpCircle } from 'lucide-react';
import ContactCard from './contact/ContactCard';
import { useSiteContact } from '../contexts/SiteContactContext';

const ContactSection = () => {
  const { phone_display } = useSiteContact();

  return (
    <div className="bg-brand-turquoise text-white py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-8 md:mb-12">Всегда на связи</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <ContactCard
            icon={MessageCircle}
            title="Напишите или позвоните нам"
            description={`Консультанты Sakina готовы ответить на любой ваш вопрос. Тел: ${phone_display}`}
            buttonText="Задать вопрос"
          />

          <ContactCard
            icon={HelpCircle}
            title="Узнайте ответы на частые вопросы"
            description="Мы собрали самые популярные вопросы пользователей в одном удобном разделе."
            buttonText="Узнать"
            to="/faq"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactSection;