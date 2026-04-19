import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { toAbsoluteUrl } from '../lib/seo';
import type { SeoExtraMetaTag } from '../lib/types';

interface SEOProps {
  title: string;
  description?: string;
  /** `<meta name="keywords">` when non-empty. */
  keywords?: string;
  canonicalPath?: string;
  robots?: string;
  /** From DB `seo_page_settings.extra_meta` — arbitrary name/property meta tags. */
  extraMeta?: SeoExtraMetaTag[];
}

export default function SEO({ title, description, keywords, canonicalPath, robots, extraMeta }: SEOProps) {
  const location = useLocation();
  const currentPath = canonicalPath || `${location.pathname}${location.search || ''}`;
  const canonicalUrl = toAbsoluteUrl(currentPath);

  return (
    <Helmet>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      {keywords?.trim() ? <meta name="keywords" content={keywords.trim()} /> : null}
      {robots ? <meta name="robots" content={robots} /> : null}
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:url" content={canonicalUrl} />
      {extraMeta?.map((tag, i) => (
        <meta
          key={`extra-${i}-${tag.name ?? ''}-${tag.property ?? ''}-${tag.content.slice(0, 24)}`}
          {...(tag.name ? { name: tag.name } : {})}
          {...(tag.property ? { property: tag.property } : {})}
          content={tag.content}
        />
      ))}
    </Helmet>
  );
}
