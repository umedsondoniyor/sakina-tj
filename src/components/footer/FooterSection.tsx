import React from 'react';

interface FooterSectionProps {
  title: string;
  links: string[];
}

const FooterSection: React.FC<FooterSectionProps> = ({ title, links }) => {
  return (
    <div>
      <h3 className="font-bold mb-4">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="text-sm text-gray-600 hover:text-teal-600">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterSection;