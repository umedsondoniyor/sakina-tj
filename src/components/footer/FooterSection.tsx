// src/components/footer/FooterSection.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSectionProps {
  title: string;
  links: FooterLink[];
}

const FooterSection: React.FC<FooterSectionProps> = ({ title, links }) => {
  const location = useLocation();

  return (
    <div>
      <h3 className="font-bold mb-4">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => {
          const isActive = location.pathname + location.search === link.href;
          return (
            <li key={link.label}>
              <Link
                to={link.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? 'text-teal-600 font-medium'
                    : 'text-gray-600 hover:text-teal-600'
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FooterSection;
