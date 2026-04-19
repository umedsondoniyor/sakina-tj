import { useEffect, useState, useMemo } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { getFooterColumns } from '../lib/api';
import type { FooterColumn } from '../lib/types';
import FooterSection from './footer/FooterSection';
import MobileFooterAccordion from './footer/MobileFooterAccordion';
import SocialMediaSection from './footer/SocialMediaSection';
import { useSiteContact } from '../contexts/SiteContactContext';

const Footer = () => {
  const settings = useSiteContact();
  const [columns, setColumns] = useState<FooterColumn[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFooterColumns()
      .then((cols) => {
        if (!cancelled) setColumns(cols);
      })
      .catch((err) => {
        console.error('Footer columns load error:', err);
        if (!cancelled) setColumns([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const footerLinks = useMemo(() => {
    if (!columns?.length) return {};
    return columns.reduce(
      (acc, col) => {
        acc[col.slug] = {
          title: col.title,
          links: col.links,
          titleHref: col.titleHref ?? null,
        };
        return acc;
      },
      {} as Record<
        string,
        {
          title: string;
          links: { label: string; href: string }[];
          titleHref?: string | null;
        }
      >,
    );
  }, [columns]);

  const currentYear = new Date().getFullYear();

  const copyrightLine1 =
    settings.copyright_line1?.replace(/\{year\}/g, String(currentYear)) ??
    `© ${currentYear} Компания «Sakina»`;
  const copyrightLine2 = settings.copyright_line2 ?? 'Все права защищены';

  const columnCount = columns?.length ?? 1;

  return (
    <footer className="bg-slate-800 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        {columns && Object.keys(footerLinks).length > 0 ? (
          <>
            <MobileFooterAccordion footerLinks={footerLinks} />

            <div
              className="hidden md:grid gap-8 mb-12"
              style={{
                gridTemplateColumns: `repeat(${Math.min(columnCount, 6)}, minmax(0, 1fr))`,
              }}
            >
              {columns.map((section) => (
                <FooterSection
                  key={section.slug}
                  title={section.title}
                  links={section.links}
                  titleHref={section.titleHref}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="mb-8 text-center text-sm text-gray-500 md:hidden">
            Загрузка подвала…
          </div>
        )}

        {/* Contact Information */}
        <div className="border-t border-slate-700 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start space-x-3">
              <Phone className="text-teal-500 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-white mb-1">Телефон</p>
                <a
                  href={settings.phone_href}
                  className="text-sm hover:text-teal-400 transition-colors"
                >
                  {settings.phone_display}
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="text-teal-500 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-white mb-1">Email</p>
                <a
                  href={settings.email_href}
                  className="text-sm hover:text-teal-400 transition-colors"
                >
                  {settings.email}
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="text-teal-500 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-white mb-1">Адрес</p>
                <p className="text-sm">{settings.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
            <div className="space-y-4">
              <SocialMediaSection
                heading={settings.social_heading}
                instagramUrl={settings.instagram_url}
              />
              <div className="text-sm text-gray-400">
                <p>{copyrightLine1}</p>
                {copyrightLine2 ? <p className="mt-1">{copyrightLine2}</p> : null}
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end space-y-4">
              {settings.show_payment_icons !== false ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">
                    {settings.payment_label ?? 'Принимаем к оплате:'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                      alt="Visa"
                      className="h-6 opacity-80 hover:opacity-100 transition-opacity"
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                      alt="Mastercard"
                      className="h-6 opacity-80 hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              ) : null}
              {settings.legal_text ? (
                <div className="text-xs text-gray-200 text-center md:text-right whitespace-pre-line">
                  {settings.legal_text}
                </div>
              ) : (
                <div className="text-xs text-gray-200 text-center md:text-right">
                  <p>ИП &quot;Sakina&quot;</p>
                  <p>ИНН: указать при наличии</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
