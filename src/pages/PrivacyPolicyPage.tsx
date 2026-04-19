import { Helmet } from 'react-helmet-async';
import { Link, useLoaderData } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { toAbsoluteUrl } from '../lib/seo';
import type { PrivacyPolicyLoaderData } from '../loaders/publicLoaders';

const canonicalPath = '/privacy';

export default function PrivacyPolicyPage() {
  const { settings } = useLoaderData() as PrivacyPolicyLoaderData;

  const title = settings?.page_title ?? 'Политика конфиденциальности';
  const metaDescription =
    settings?.meta_description ??
    'Как Sakina обрабатывает персональные данные при заказах, доставке и работе сайта sakina.tj.';

  const markdownComponents: Components = {
    h2: ({ children }) => (
      <h2 className="text-lg font-semibold text-brand-navy mb-3 mt-10 first-of-type:mt-0">{children}</h2>
    ),
    p: ({ children }) => (
      <p className="text-gray-700 leading-relaxed text-sm md:text-base mb-4 last:mb-0">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-5 text-gray-700 space-y-2 text-sm md:text-base mb-6">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 text-gray-700 space-y-2 text-sm md:text-base mb-6">{children}</ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
    a: ({ href, children }) => {
      if (href?.startsWith('/')) {
        return (
          <Link to={href} className="text-brand-turquoise hover:text-brand-navy underline">
            {children}
          </Link>
        );
      }
      return (
        <a href={href} className="text-brand-turquoise hover:text-brand-navy underline">
          {children}
        </a>
      );
    },
  };

  return (
    <>
      <Helmet>
        <title>{title} | Sakina.tj</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={toAbsoluteUrl(canonicalPath)} />
      </Helmet>

      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
          {!settings ? (
            <p className="text-gray-600 text-center py-12">
              Не удалось загрузить политику конфиденциальности. Попробуйте обновить страницу позже.
            </p>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-6">{settings.page_title}</h1>
              {settings.intro ? (
                <p className="text-sm text-gray-500 mb-8">{settings.intro}</p>
              ) : null}

              <div className="privacy-markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {settings.body_markdown}
                </ReactMarkdown>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
