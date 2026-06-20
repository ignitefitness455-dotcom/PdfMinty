import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { SITE_URL } from "../config/routes";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  schemaMarkup?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage = `${SITE_URL}/og-image.png`,
  schemaMarkup,
}) => {
  const location = useLocation();

  // Normalize path following Canonical.tsx normalization rules
  let path = location.pathname;
  if (path === "/organize") {
    path = "/delete-pages-pdf";
  }

  // Remove trailing slashes (except for home page)
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  const derivedCanonical = `${SITE_URL}${path}`;
  const currentUrl = canonical || derivedCanonical;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
