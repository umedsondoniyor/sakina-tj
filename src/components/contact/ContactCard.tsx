import React from 'react';
import { Link } from 'react-router-dom';

interface ContactCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
  /** When set, the whole block is a link to this path */
  to?: string;
}

const buttonClassName =
  'text-white text-sm md:text-base border border-white px-4 md:px-6 py-2 rounded hover:bg-white hover:text-teal-600 transition-colors';

const ContactCard: React.FC<ContactCardProps> = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onButtonClick,
  to,
}) => {
  const body = (
    <>
      <div className="flex-shrink-0">
        <Icon size={36} className="text-white md:w-12 md:h-12" />
      </div>
      <div>
        <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">{title}</h3>
        <p className="text-sm md:text-base mb-4">{description}</p>
        {to ? (
          <span className={`inline-block ${buttonClassName}`}>{buttonText}</span>
        ) : (
          <button type="button" onClick={onButtonClick} className={buttonClassName}>
            {buttonText}
          </button>
        )}
      </div>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="flex space-x-4 md:space-x-6 rounded-lg -m-2 p-2 text-left transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-turquoise"
      >
        {body}
      </Link>
    );
  }

  return <div className="flex space-x-4 md:space-x-6">{body}</div>;
};

export default ContactCard;
