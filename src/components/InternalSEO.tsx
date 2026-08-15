import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { ROUTES } from '../config/routes';
import { SITE_URL, SITE_NAME, TOOLS, FAQS } from '../config/seo-data';

export const Breadcrumbs: React.FC = () => {
  const { pathname = '/' } = useLocation() || {};
  
  const cleanSlug = useMemo(() => {
    if (!pathname || pathname === '/') return '';
    return pathname.toLowerCase().replace(/^\//, '').replace(/\/$/, '');
  }, [pathname]);

  if (!cleanSlug) {
    return null;
  }

  const currentItem = TOOLS.find((t) => t && t.slug && t.slug.toLowerCase() === cleanSlug);

  if (cleanSlug === 'blog') {
    return (
      <nav aria-label="Breadcrumb" className="flex text-[11px] sm:text-xs text-slate-400/80 mb-6 gap-2 font-bold font-sans tracking-wide">
        <Link to="/" className="hover:text-emerald-600 transition-colors uppercase font-sans">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-400 uppercase font-sans">
          Knowledge Hub
        </span>
      </nav>
    );
  }

  if (cleanSlug === 'about-us' || cleanSlug === 'contact' || cleanSlug === 'privacy-policy' || cleanSlug === 'terms-of-service') {
    const title = currentItem?.name || (cleanSlug === 'about-us' ? 'About Us' : cleanSlug === 'contact' ? 'Contact Us' : cleanSlug === 'privacy-policy' ? 'Privacy Policy' : 'Terms of Service');
    return (
      <nav aria-label="Breadcrumb" className="flex text-[11px] sm:text-xs text-slate-400/80 mb-6 gap-2 font-bold font-sans tracking-wide">
        <Link to="/" className="hover:text-emerald-600 transition-colors uppercase font-sans">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-400 uppercase font-sans">
          {title}
        </span>
      </nav>
    );
  }

  if (!currentItem) {
    return null;
  }

  const isArticle = currentItem.type === 'article';

  return (
    <nav aria-label="Breadcrumb" className="flex text-[11px] sm:text-xs text-slate-400/80 mb-6 gap-2 font-bold font-sans tracking-wide">
      <Link to="/" className="hover:text-emerald-600 transition-colors uppercase font-sans">
        Home
      </Link>
      <span>/</span>
      {isArticle ? (
        <>
          <Link to={ROUTES.BLOG} className="hover:text-emerald-600 transition-colors uppercase font-sans">
            Knowledge Hub
          </Link>
          <span>/</span>
        </>
      ) : (
        <>
          <Link to="/" className="hover:text-emerald-600 transition-colors uppercase font-sans">
            Tools
          </Link>
          <span>/</span>
        </>
      )}
      <span className="text-slate-600 dark:text-slate-400 uppercase font-sans truncate max-w-[200px] sm:max-w-xs">
        {currentItem.name}
      </span>
    </nav>
  );
};

export default function InternalSEO() {
  const location = useLocation();

  const nonce = React.useMemo(() => {
    if (typeof document === 'undefined') return undefined;
    const scriptWithNonce = document.querySelector('script[nonce]') as HTMLScriptElement | null;
    if (scriptWithNonce) {
      return scriptWithNonce.nonce || scriptWithNonce.getAttribute('nonce') || undefined;
    }
    return undefined;
  }, []);

  const cleanSlug = (location?.pathname || '').replace(/^\//, '').replace(/\/$/, '');
  const structuredData: Record<string, unknown>[] = [];

  // 1. Homepage (`/`)
  if (!cleanSlug) {
    structuredData.push(
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        description: 'Free, privacy-first offline-capable PDF toolkit. Combine, split, protect, rotate and convert PDFs 100% inside your browser safely with zero server uploads.',
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: `${SITE_URL}/logo-192.png`,
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/logo-192.png`,
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'pdfminty@gmail.com',
          contactType: 'customer support',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      }
    );
  } else if (cleanSlug === 'blog') {
    // 2. Blog Index (`/blog/`)
    structuredData.push(
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'PdfMinty Knowledge Hub',
        url: `${SITE_URL}/blog/`,
        description: 'Explore expert guides, security tips, and privacy-first PDF tutorials in the PdfMinty Knowledge Hub.',
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: `${SITE_URL}/logo-192.png`,
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Knowledge Hub',
            item: `${SITE_URL}/blog/`,
          },
        ],
      }
    );
  } else {
    // 3. Tool, Article, or Static Page
    const seoInfo = TOOLS.find((t) => t && t.slug === cleanSlug);
    if (!seoInfo) return null;

    if (seoInfo.type === 'tool') {
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: `PdfMinty - ${seoInfo.name}`,
        description: seoInfo.shortDescription || seoInfo.metaDescription,
        url: `${SITE_URL}/${seoInfo.slug}/`,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires HTML5, WebAssembly',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        featureList: [
          '100% client-side processing for standard tools',
          'Zero file uploads for our standard PDF tools',
          'The AI Analyze tool only sends extracted text to Google Gemini after you explicitly check a consent box',
          'Free to use',
          'No registration required',
        ],
      });

      if (seoInfo.howTo) {
        structuredData.push({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: seoInfo.howTo.name,
          totalTime: seoInfo.howTo.totalTime,
          step: seoInfo.howTo.steps.map((stepText, index) => ({
            '@type': 'HowToStep',
            url: `${SITE_URL}/${seoInfo.slug}/#step${index + 1}`,
            name: stepText,
            itemListElement: [{ '@type': 'HowToDirection', text: stepText }],
          })),
        });
      }

      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: seoInfo.name,
            item: `${SITE_URL}/${seoInfo.slug}/`,
          },
        ],
      });

      if (seoInfo.faqs && seoInfo.faqs.length > 0) {
        structuredData.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: seoInfo.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a,
            },
          })),
        });
      }
    } else if (cleanSlug === 'about-us') {
      structuredData.push(
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: seoInfo.metaTitle,
          description: seoInfo.metaDescription,
          url: `${SITE_URL}/about-us/`,
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: `${SITE_URL}/`,
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${SITE_URL}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'About Us',
              item: `${SITE_URL}/about-us/`,
            },
          ],
        }
      );
    } else if (cleanSlug === 'contact') {
      structuredData.push(
        {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: seoInfo.metaTitle,
          description: seoInfo.metaDescription,
          url: `${SITE_URL}/contact/`,
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: `${SITE_URL}/`,
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${SITE_URL}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Contact Us',
              item: `${SITE_URL}/contact/`,
            },
          ],
        }
      );
    } else if (cleanSlug === 'privacy-policy' || cleanSlug === 'terms-of-service') {
      structuredData.push(
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: seoInfo.metaTitle,
          description: seoInfo.metaDescription,
          url: `${SITE_URL}/${cleanSlug}/`,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${SITE_URL}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: seoInfo.name,
              item: `${SITE_URL}/${cleanSlug}/`,
            },
          ],
        }
      );
    } else if (seoInfo.type === 'article') {
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: seoInfo.h1 || seoInfo.name,
        description: seoInfo.metaDescription,
        url: `${SITE_URL}/${seoInfo.slug}/`,
        datePublished: seoInfo.datePublished || '2026-07-16',
        dateModified: seoInfo.dateModified || seoInfo.datePublished || '2026-08-08',
        author: {
          '@type': 'Organization',
          name: 'PdfMinty Editorial Team',
          url: `${SITE_URL}/`,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/logo-192.png`,
          },
        },
        image: {
          '@type': 'ImageObject',
          url: seoInfo.ogImage ? `${SITE_URL}${seoInfo.ogImage}` : `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITE_URL}/${seoInfo.slug}/`,
        },
      });

      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Knowledge Hub',
            item: `${SITE_URL}/blog/`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: seoInfo.name,
            item: `${SITE_URL}/${seoInfo.slug}/`,
          },
        ],
      });

      if (seoInfo.faqs && seoInfo.faqs.length > 0) {
        structuredData.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: seoInfo.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a,
            },
          })),
        });
      }
    }
  }

  if (structuredData.length === 0) return null;

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
