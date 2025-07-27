import React from 'react';

interface ContactCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
}

const ContactCard: React.FC<ContactCardProps> = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onButtonClick
}) => {
  return (
    <div className="flex space-x-4 md:space-x-6">
      <div className="flex-shrink-0">
        <Icon size={36} className="text-white md:w-12 md:h-12" />
      </div>
      <div>
        <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">{title}</h3>
        <p className="text-sm md:text-base mb-4">
          {description}
        </p>
        <button 
          onClick={onButtonClick}
          className="text-white text-sm md:text-base border border-white px-4 md:px-6 py-2 rounded hover:bg-white hover:text-teal-600 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ContactCard;