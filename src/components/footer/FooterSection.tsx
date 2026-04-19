import React from 'react';
import { useLocation } from 'react-router-dom';
import FooterSmartLink from './FooterSmartLink';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSectionProps {
  title: string;
  links: FooterLink[];
  /** When set and links is empty, the heading is the only link (e.g. «О компании» → /about). */
  titleHref?: string | null;
}

const FooterSection: React.FC<FooterSectionProps> = ({ title, links, titleHref }) => {
  const location = useLocation();
  const current = `${location.pathname}${location.hash || ''}`;

  const href = titleHref?.trim();
  if (href && links.length === 0) {
    const isActive = current === href;
    return (
      <div>
        <FooterSmartLink
          href={href}
          className={`font-bold mb-4 text-white block transition-colors ${
            isActive ? 'text-teal-400' : 'hover:text-teal-400'
          }`}
        >
          {title}
        </FooterSmartLink>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-bold mb-4 text-white">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => {
          const isActive = current === link.href;
          return (
            <li key={`${link.href}-${link.label}`}>
              <FooterSmartLink
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive ? 'text-teal-400 font-medium' : 'text-gray-400 hover:text-teal-400'
                }`}
              >
                {link.label}
              </FooterSmartLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FooterSection;
