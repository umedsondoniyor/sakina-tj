import React from 'react';
import { Link } from 'react-router-dom';

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
}

interface FooterSmartLinkProps {
  href: string;
  className: string;
  children: React.ReactNode;
}

const FooterSmartLink: React.FC<FooterSmartLinkProps> = ({ href, className, children }) => {
  if (href.startsWith('mailto:') || href.startsWith('tel:')) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  if (isExternalHref(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
};

export default FooterSmartLink;
