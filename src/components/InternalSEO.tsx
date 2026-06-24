import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { SITE_URL } from '../config/routes';
import { TOOLS } from '../config/seo-data';

import { useLayout } from './Layout';

export const Breadcrumbs: React.FC = () => {
  const { pathname } = useLocation();
  const { toolsList } = useLayout();
  const currentTool = useMemo(() => {
    const segments = pathname.toLowerCase().split('/').filter(Boolean);
    return toolsList.find((t) => segments.includes(t.slug.toLowerCase()));
  }, [toolsList, pathname]);
  return (
    <nav className="flex text-[11px] sm:text-xs text-slate-400/80 mb-6 gap-2 font-bold font-sans tracking-wide">
      <Link to="/" className="hover:text-emerald-600 transition-colors uppercase font-sans">
        Home
      </Link>
      <span>/</span>
      {currentTool ? (
        <>
          <Link to="/" className="hover:text-emerald-600 transition-colors uppercase font-sans">
            Tools
          </Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-400 uppercase font-sans">
            {currentTool.name}
          </span>
        </>
      ) : (
        <span className="text-slate-600 dark:text-slate-400 uppercase font-sans">
          Tools Palette
        </span>
      )}
    </nav>
  );
};

export default function InternalSEO() {
  const location = useLocation();
  const { toolsList } = useLayout();
  const tool = toolsList.find((t) => `/${t.slug}` === location.pathname);
  if (!tool) return null;
  const APP_URL = SITE_URL;
  const structuredData: unknown[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: tool.name,
      description: tool.description,
      url: `${APP_URL}/${tool.slug}`,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${APP_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: tool.name,
          item: `${APP_URL}/${tool.slug}`,
        },
      ],
    },
  ];

  const seoInfo = TOOLS.find((t) => t.slug === tool.slug);
  if (seoInfo && seoInfo.type === 'article') {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: seoInfo.h1,
      description: seoInfo.metaDescription,
      url: `${APP_URL}/${seoInfo.slug}`,
      datePublished: seoInfo.datePublished || '2025-01-01',
      dateModified: seoInfo.dateModified || new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: 'PDFMinty',
        url: APP_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: 'PDFMinty',
        logo: {
          '@type': 'ImageObject',
          url: `${APP_URL}/logo.png`,
        },
      },
      image: {
        '@type': 'ImageObject',
        url: seoInfo.ogImage ? `${APP_URL}${seoInfo.ogImage}` : `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${APP_URL}/${seoInfo.slug}`,
      },
    });
  }

  const nonce = document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content');

  return (
    <script type="application/ld+json" nonce={nonce || undefined}>
      {JSON.stringify(structuredData)}
    </script>
  );
}
