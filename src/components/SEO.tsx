import React from 'react';
import { Helmet } from 'react-helmet-async';

import { TOOLS, SITE_URL, SITE_NAME } from '../config/seo-data';
import { useHreflang } from '../hooks/useHreflang';

interface SEOProps {
  slug?: string;
  titleOverride?: string;
  descriptionOverride?: string;
}

/**
 * Renders <title>, meta description, canonical, reciprocal hreflangs, Open Graph, and Twitter card tags.
 *
 * JSON-LD structured data is intentionally NOT emitted here — that is owned by
 * <InternalSEO /> to avoid duplicate/conflicting schema on tool pages. The
 * homepage's WebSite schema is emitted by index.html and not duplicated here.
 */
export const SEO: React.FC<SEOProps> = ({ slug, titleOverride, descriptionOverride }) => {
  const { currentLocale, baseSlug, canonicalUrl, hreflangs } = useHreflang(slug, SITE_URL);

  const item = TOOLS.find((t) => t.slug === baseSlug);

  const currentToolIndex = TOOLS.findIndex((t) => t.slug === baseSlug);
  const prevTool = currentToolIndex > 0 ? TOOLS[currentToolIndex - 1] : null;
  const nextTool = currentToolIndex >= 0 && currentToolIndex < TOOLS.length - 1 ? TOOLS[currentToolIndex + 1] : null;

  // Default values for homepage or custom non-tool pathways.
  const title = titleOverride || item?.metaTitle || 'Free Offline PDF Tools & Editor — 100% Private | PDFMinty';
  const description =
    descriptionOverride ||
    item?.metaDescription ||
    'Free, privacy-first offline-capable PDF toolkit. Combine, split, protect, rotate and convert PDFs 100% inside your browser safely with zero server uploads.';

  const ogType = item?.type === 'article' ? 'article' : 'website';

  // Per-tool og:image if declared in seo-data, else generic.
  const ogImage = item?.ogImage ? `${SITE_URL}${item.ogImage}` : `${SITE_URL}/og-image.png`;
  const keywords = item?.name
    ? `${item.name.toLowerCase()}, ${item.slug.replace(/-/g, ' ')}, pdf toolkit, client-side pdf`
    : 'pdf toolkit, merge pdf, split pdf, compress pdf, protect pdf, edit pdf, client-side pdf editor, free pdf tools';

  return (
    <Helmet>
      {/* General Title and Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content="PDFMinty" />
      <meta name="publisher" content="PDFMinty" />
      <meta name="language" content={currentLocale === 'bn' ? 'Bengali' : 'English'} />
      <meta name="revisit-after" content="7 days" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Reciprocal hreflang tags for multi-locale pages */}
      {hreflangs.map((entry) => (
        <link
          key={entry.hreflang}
          rel="alternate"
          hrefLang={entry.hreflang}
          href={entry.href}
        />
      ))}

      {prevTool && <link rel="prev" href={`${SITE_URL}/${prevTool.slug}/`} />}
      {nextTool && <link rel="next" href={`${SITE_URL}/${nextTool.slug}/`} />}

      {/* Open Graph Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={currentLocale === 'bn' ? 'bn_BD' : 'en_US'} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
