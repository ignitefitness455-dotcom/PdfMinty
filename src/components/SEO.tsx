import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { TOOLS, SITE_URL, SITE_NAME } from '../config/seo-data';

interface SEOProps {
  slug?: string;
  titleOverride?: string;
  descriptionOverride?: string;
}

export const SEO: React.FC<SEOProps> = ({ slug, titleOverride, descriptionOverride }) => {
  const location = useLocation();

  // Find tool or article by slug prop or derive from current pathname
  let currentSlug = slug;
  if (!currentSlug) {
    const cleanPath = location.pathname.replace(/^\//, '').replace(/\/$/, '');
    currentSlug = cleanPath;
  }

  const item = TOOLS.find((t) => t.slug === currentSlug);

  // Set default values for homepage or custom non-tool pathways
  let title = titleOverride || 'PDFMinty — Privacy-First Free PDF Toolkit & Editor';
  let description =
    descriptionOverride ||
    'Free, privacy-first offline-capable PDF toolkit. Combine, split, compress, protect, rotate and convert PDFs 100% inside your browser safely with zero server uploads.';
  let h1Text = 'Privacy-First PDF Tools';
  let canonicalUrl = `${SITE_URL}`;
  let jsonLd: Record<string, any> | null = null;
  const ogType = item?.type === 'article' ? 'article' : 'website';

  if (item) {
    title = titleOverride || item.metaTitle;
    description = descriptionOverride || item.metaDescription;
    h1Text = item.h1;
    canonicalUrl = `${SITE_URL}/${item.slug}`;

    if (item.type === 'tool') {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: `${SITE_NAME} - ${item.name}`,
        url: canonicalUrl,
        description: description,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires HTML5, WebAssembly',
      };
    } else if (item.type === 'article') {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: h1Text,
        description: description,
        url: canonicalUrl,
        publisher: {
          '@type': 'Organization',
          name: 'PDFMinty',
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/og-image.png`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      };
    }
  } else if (location.pathname === '/') {
    // Standard homepage schema markup
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: description,
    };
  }

  return (
    <Helmet>
      {/* General Title and Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${SITE_URL}/og-image.png`} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />

      {/* JSON-LD Structured Data Schema */}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
};

export default SEO;
