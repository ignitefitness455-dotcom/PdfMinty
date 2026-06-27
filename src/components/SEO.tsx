import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { TOOLS, SITE_URL, SITE_NAME } from '../config/seo-data';

interface SEOProps {
  slug?: string;
  titleOverride?: string;
  descriptionOverride?: string;
}

/**
 * Renders <title>, meta description, canonical, Open Graph, and Twitter card tags.
 *
 * JSON-LD structured data is intentionally NOT emitted here — that is owned by
 * <InternalSEO /> to avoid duplicate/conflicting schema on tool pages. The
 * homepage's WebSite schema is emitted by index.html and not duplicated here.
 */
export const SEO: React.FC<SEOProps> = ({ slug, titleOverride, descriptionOverride }) => {
  const location = useLocation();

  // Find tool or article by slug prop or derive from current pathname.
  let currentSlug = slug;
  if (!currentSlug) {
    const cleanPath = location.pathname.replace(/^\//, '').replace(/\/$/, '');
    currentSlug = cleanPath;
  }

  const item = TOOLS.find((t) => t.slug === currentSlug);

  const currentToolIndex = TOOLS.findIndex((t) => t.slug === currentSlug);
  const prevTool = currentToolIndex > 0 ? TOOLS[currentToolIndex - 1] : null;
  const nextTool = currentToolIndex >= 0 && currentToolIndex < TOOLS.length - 1 ? TOOLS[currentToolIndex + 1] : null;

  // Default values for homepage or custom non-tool pathways.
  const title = titleOverride || item?.metaTitle || 'PDFMinty — Privacy-First Free PDF Toolkit & Editor';
  const description =
    descriptionOverride ||
    item?.metaDescription ||
    'Free, privacy-first offline-capable PDF toolkit. Combine, split, compress, protect, rotate and convert PDFs 100% inside your browser safely with zero server uploads.';
  const canonicalUrl = item ? `${SITE_URL}/${item.slug}` : SITE_URL;
  const ogType = item?.type === 'article' ? 'article' : 'website';

  // Per-tool og:image if declared in seo-data, else generic.
  const ogImage = item?.ogImage ? `${SITE_URL}${item.ogImage}` : `${SITE_URL}/og-image.png`;

  return (
    <Helmet>
      {/* General Title and Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content="PDFMinty" />
      <meta name="publisher" content="PDFMinty" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <link rel="canonical" href={canonicalUrl} />
      {prevTool && <link rel="prev" href={`${SITE_URL}/${prevTool.slug}`} />}
      {nextTool && <link rel="next" href={`${SITE_URL}/${nextTool.slug}`} />}

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

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
