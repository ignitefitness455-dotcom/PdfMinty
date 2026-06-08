import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

/**
 * 1. Strict Type-Safety: TypeScript Interface for SEO Component Props
 */
export interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  schemaJson?: Record<string, any> | string;
}

/**
 * Robust Centralized Route Metadata Configurations
 */
export const SEO_CONFIGS: Record<string, { title: string; description: string; ogTitle: string; ogDescription: string }> = {
  "/": {
    title: "PDFMinty — Free Online PDF Tools | Merge, Compress & Split PDF",
    description: "100% free, privacy-first PDF toolkit. All processing happens locally in your browser. No upload needed.",
    ogTitle: "PDFMinty — Free Online PDF Tools | Merge, Compress & Split PDF",
    ogDescription: "100% free, privacy-first PDF toolkit. All processing happens locally in your browser. No upload needed.",
  },
  "/merge-pdf": {
    title: "Merge PDFs Online Free | Combine Multiple PDFs — PDFMinty",
    description: "Merge multiple PDF files into one document for free. No upload, no registration. All processing happens in your browser.",
    ogTitle: "Merge PDFs Online Free | Combine Multiple PDFs — PDFMinty",
    ogDescription: "Merge multiple PDF files into one document for free. No upload, no registration. All processing happens in your browser.",
  },
  "/split-pdf": {
    title: "Split PDF Online Free | Extract Pages from PDF — PDFMinty",
    description: "Split PDF pages or extract specific pages for free. Privacy-first, client-side processing.",
    ogTitle: "Split PDF Online Free | Extract Pages from PDF — PDFMinty",
    ogDescription: "Split PDF pages or extract specific pages for free. Privacy-first, client-side processing.",
  },
  "/compress-pdf": {
    title: "Compress PDF Online Free | Reduce File Size — PDFMinty",
    description: "Compress PDF files to reduce size without losing quality. Free, fast, and private.",
    ogTitle: "Compress PDF Online Free | Reduce File Size — PDFMinty",
    ogDescription: "Compress PDF files to reduce size without losing quality. Free, fast, and private.",
  },
  "/rotate-pdf": {
    title: "Rotate PDF Pages Online Free — PDFMinty",
    description: "Rotate PDF pages left or right for free. No upload needed.",
    ogTitle: "Rotate PDF Pages Online Free — PDFMinty",
    ogDescription: "Rotate PDF pages left or right for free. No upload needed.",
  },
  "/organize": {
    title: "Delete PDF Pages Online Free | Organize PDF — PDFMinty",
    description: "Delete unwanted pages from PDF files. Free and privacy-first.",
    ogTitle: "Delete PDF Pages Online Free | Organize PDF — PDFMinty",
    ogDescription: "Delete unwanted pages from PDF files. Free and privacy-first.",
  },
  "/watermark-pdf": {
    title: "Add Watermark to PDF Online Free — PDFMinty",
    description: "Add text or image watermarks to PDF files for free. Client-side processing.",
    ogTitle: "Add Watermark to PDF Online Free — PDFMinty",
    ogDescription: "Add text or image watermarks to PDF files for free. Client-side processing.",
  },
  "/add-page-numbers": {
    title: "Add Page Numbers to PDF Online Free — PDFMinty",
    description: "Add page numbers to PDF documents for free. Customizable position and style.",
    ogTitle: "Add Page Numbers to PDF Online Free — PDFMinty",
    ogDescription: "Add page numbers to PDF documents for free. Customizable position and style.",
  },
  "/add-blank-page": {
    title: "Insert Blank Pages into PDF Online Free — PDFMinty",
    description: "Insert blank pages into PDF files at any position. Free and private.",
    ogTitle: "Insert Blank Pages into PDF Online Free — PDFMinty",
    ogDescription: "Insert blank pages into PDF files at any position. Free and private.",
  },
  "/protect-pdf": {
    title: "Password Protect PDF Online Free — PDFMinty",
    description: "Add password protection to PDF files for free. Secure your documents.",
    ogTitle: "Password Protect PDF Online Free — PDFMinty",
    ogDescription: "Add password protection to PDF files for free. Secure your documents.",
  },
  "/unlock-pdf": {
    title: "Unlock PDF Online Free | Remove Password — PDFMinty",
    description: "Remove password protection from PDF files. Free and client-side.",
    ogTitle: "Unlock PDF Online Free | Remove Password — PDFMinty",
    ogDescription: "Remove password protection from PDF files. Free and client-side.",
  },
  "/image-to-pdf": {
    title: "Convert Image to PDF Online Free — PDFMinty",
    description: "Convert JPG, PNG, WebP images to PDF for free. No upload needed.",
    ogTitle: "Convert Image to PDF Online Free — PDFMinty",
    ogDescription: "Convert JPG, PNG, WebP images to PDF for free. No upload needed.",
  },
  "/pdf-to-image": {
    title: "Convert PDF to Image Online Free — PDFMinty",
    description: "Convert PDF pages to JPG or PNG images for free. Privacy-first processing.",
    ogTitle: "Convert PDF to Image Online Free — PDFMinty",
    ogDescription: "Convert PDF pages to JPG or PNG images for free. Privacy-first processing.",
  },
  "/intelligence": {
    title: "AI PDF Analyzer Online Free | Smart Document Analysis — PDFMinty",
    description: "Analyze PDF documents with AI. Extract insights, summaries, and key information.",
    ogTitle: "AI PDF Analyzer Online Free | Smart Document Analysis — PDFMinty",
    ogDescription: "Analyze PDF documents with AI. Extract insights, summaries, and key information.",
  }
};

/**
 * 2. useRouteSEO: A high-performance centralized custom hook to cleanly resolve route metadata for DRY code.
 */
export function useRouteSEO(): Required<Omit<SEOProps, "schemaJson">> & { schemaJson?: Record<string, any> } {
  const location = useLocation();
  const isCapacitor = typeof window !== "undefined" && typeof (window as any).Capacitor !== "undefined";

  let cleanPath = location.pathname;

  // Normalize HashRouter paths if they spill onto hash structures (Web fallback/dev cases only)
  if (!isCapacitor && cleanPath === "/" && window.location.hash) {
    const hashPath = window.location.hash.slice(1);
    if (hashPath.startsWith("/")) {
      cleanPath = hashPath.split("?")[0];
    } else {
      cleanPath = "/" + hashPath.split("?")[0];
    }
  }

  if (cleanPath.endsWith("/") && cleanPath.length > 1) {
    cleanPath = cleanPath.slice(0, -1);
  }

  const baseMeta = SEO_CONFIGS[cleanPath] || SEO_CONFIGS["/"];
  const canonicalUrl = `https://www.pdfminty.com${cleanPath || "/"}`;

  // Default image asset
  const ogImage = "https://www.pdfminty.com/og-image.png";

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": cleanPath === "/" ? "PDFMinty" : (baseMeta.title.split(" | ")[0] || "PDFMinty"),
    "alternateName": "PDF Minty",
    "url": canonicalUrl,
    "description": baseMeta.description,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    ...(cleanPath !== "/" && { "browserRequirements": "Requires JavaScript" })
  };

  return {
    title: baseMeta.title,
    description: baseMeta.description,
    canonicalUrl,
    ogTitle: baseMeta.ogTitle,
    ogDescription: baseMeta.ogDescription,
    ogImage,
    ogType: "website",
    twitterCard: "summary_large_image",
    schemaJson,
  };
}

/**
 * 3. SEO Component: Enterprise-grade SEO Head/Meta-tag controller.
 * Designed properly for dynamic Helmet injection and prerendering engines with zero memory leakage.
 */
export function SEO(props: SEOProps) {
  const routeSEO = useRouteSEO();
  const navigate = useNavigate();
  const isCapacitor = typeof window !== "undefined" && typeof (window as any).Capacitor !== "undefined";

  // Safeguard/Redirect old structure HashRouter URLs to avoid SPA index fragmentation
  useEffect(() => {
    if (!isCapacitor && window.location.hash && window.location.hash.startsWith("#/")) {
      const hashPath = window.location.hash.slice(1);
      const urlParts = hashPath.split("?");
      const targetPath = urlParts[0];
      const targetQuery = urlParts[1] ? "?" + urlParts[1] : "";
      navigate(targetPath + targetQuery, { replace: true });
    }
  }, [isCapacitor, navigate]);

  // Resolve fallbacks
  const title = props.title || routeSEO.title;
  const description = props.description || routeSEO.description;
  const canonicalUrl = props.canonicalUrl || routeSEO.canonicalUrl;
  const ogTitle = props.ogTitle || props.title || routeSEO.ogTitle;
  const ogDescription = props.ogDescription || props.description || routeSEO.ogDescription;
  const ogImage = props.ogImage || routeSEO.ogImage;
  const ogType = props.ogType || routeSEO.ogType;
  const twitterCard = props.twitterCard || routeSEO.twitterCard;
  const schemaJson = props.schemaJson || routeSEO.schemaJson;

  const schemaString = typeof schemaJson === "string" 
    ? schemaJson 
    : schemaJson 
      ? JSON.stringify(schemaJson, null, 2) 
      : null;

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical Tag — hrefLang alternates removed: app is English-only, no alternate language routes exist */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Dynamic JSON-LD Structured Data */}
      {schemaString && (
        <script type="application/ld+json">
          {schemaString}
        </script>
      )}
    </Helmet>
  );
}
