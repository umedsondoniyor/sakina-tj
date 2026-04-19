import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getFooterSiteSettings, FOOTER_SITE_SETTINGS_DEFAULTS } from '../lib/api';
import type { FooterSiteSettings } from '../lib/types';

const SiteContactContext = createContext<FooterSiteSettings>(FOOTER_SITE_SETTINGS_DEFAULTS);

/**
 * Global contact & social defaults from Admin → Подвал (`footer_settings`):
 * phone, email, address, Instagram, etc.
 */
export function SiteContactProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<FooterSiteSettings>(FOOTER_SITE_SETTINGS_DEFAULTS);

  useEffect(() => {
    getFooterSiteSettings().then(setSettings).catch(() => {
      /* keep FOOTER_SITE_SETTINGS_DEFAULTS */
    });
  }, []);

  return <SiteContactContext.Provider value={settings}>{children}</SiteContactContext.Provider>;
}

export function useSiteContact(): FooterSiteSettings {
  return useContext(SiteContactContext);
}
