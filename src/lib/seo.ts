const DEFAULT_SITE_URL = 'https://sakina.tj';

export function getSiteUrl() {
  return (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
}

export function toAbsoluteUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
