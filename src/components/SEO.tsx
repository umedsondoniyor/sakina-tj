import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { toAbsoluteUrl } from '../lib/seo';

interface SEOProps {
  title: string;
  description?: string;
  canonicalPath?: string;
  robots?: string;
}

export default function SEO({ title, description, canonicalPath, robots }: SEOProps) {
  const location = useLocation();
  const currentPath = canonicalPath || `${location.pathname}${location.search || ''}`;
  const canonicalUrl = toAbsoluteUrl(currentPath);

  return (
    <Helmet>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      {robots ? <meta name="robots" content={robots} /> : null}
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:url" content={canonicalUrl} />
    </Helmet>
  );
}
