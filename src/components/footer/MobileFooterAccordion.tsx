// src/components/footer/MobileFooterAccordion.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface FooterLink {
  label: string;
  href: string;
}

interface MobileFooterAccordionProps {
  footerLinks: Record<string, { title: string; links: FooterLink[] }>;
}

const MobileFooterAccordion: React.FC<MobileFooterAccordionProps> = ({ footerLinks }) => {
  const location = useLocation();

  return (
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
              {section.links.map((link) => {
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
        </details>
      ))}
    </div>
  );
};

export default MobileFooterAccordion;
