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
    title: "Free PDF Tools No Upload — Private PDF toolkit | PDFMinty",
    description: "Need the best private pdf tools online free? PDFMinty is a secure, browser based pdf toolkit to merge, compress, and edit files. Try our free online pdf tools that don't upload files for full privacy!",
    ogTitle: "Free PDF Tools No Upload — Private PDF toolkit | PDFMinty",
    ogDescription: "Need the best private pdf tools online free? PDFMinty is a secure, browser based pdf toolkit to merge, compress, and edit files. Try our free online pdf tools that don't upload files for full privacy!",
  },
  "/merge-pdf": {
    title: "Merge PDF Without Uploading — 100% Private & Free | PDFMinty",
    description: "Merge PDF files free online without uploading to any server. Keep your documents private. Combine PDF pages locally in your browser and download instantly.",
    ogTitle: "Merge PDF Without Uploading — 100% Private & Free | PDFMinty",
    ogDescription: "Merge PDF files free online without uploading to any server. Keep your documents private. Combine PDF pages locally in your browser and download instantly.",
  },
  "/split-pdf": {
    title: "Split PDF Without Uploading — 100% Private & Free | PDFMinty",
    description: "Split PDF pages or extract pages free online with no upload. Separate PDF pages in browser privately to protect secure details on your device. Try it today!",
    ogTitle: "Split PDF Without Uploading — 100% Private & Free | PDFMinty",
    ogDescription: "Split PDF pages or extract pages free online with no upload. Separate PDF pages in browser privately to protect secure details on your device. Try it today!",
  },
  "/compress-pdf": {
    title: "Compress PDF in Browser — Free Offline Optimizer | PDFMinty",
    description: "Reduce PDF file size free without uploading sensitive files to cloud servers. Compress PDF in browser privately to optimize attachments. Try it now!",
    ogTitle: "Compress PDF in Browser — Free Offline Optimizer | PDFMinty",
    ogDescription: "Reduce PDF file size free without uploading sensitive files to cloud servers. Compress PDF in browser privately to optimize attachments. Try it now!",
  },
  "/rotate-pdf": {
    title: "Rotate PDF Pages Free Online — 100% Private | PDFMinty",
    description: "Rotate PDF pages free online without uploading sensitive files to cloud servers. Rotate specific pages in PDF permanently inside your browser. Try now!",
    ogTitle: "Rotate PDF Pages Free Online — 100% Private | PDFMinty",
    ogDescription: "Rotate PDF pages free online without uploading sensitive files to cloud servers. Rotate specific pages in PDF permanently inside your browser. Try now!",
  },
  "/organize": {
    title: "Delete PDF Pages Free Online — 100% Private & Local | PDFMinty",
    description: "Delete pages from pdf free online without uploading sensitive files to cloud servers. Remove specific pages from pdf online privately with our secure, in-browser editor. Try now!",
    ogTitle: "Delete PDF Pages Free Online — 100% Private & Local | PDFMinty",
    ogDescription: "Delete pages from pdf free online without uploading sensitive files to cloud servers. Remove specific pages from pdf online privately with our secure, in-browser editor. Try now!",
  },
  "/watermark-pdf": {
    title: "Add Watermark to PDF Free Online - No Upload | PDFMinty",
    description: "Add watermark to PDF free online without uploading sensitive documents to servers. Customize text opacity, size, and layout inside your browser. Try now!",
    ogTitle: "Add Watermark to PDF Free Online - No Upload | PDFMinty",
    ogDescription: "Add watermark to PDF free online without uploading sensitive documents to servers. Customize text opacity, size, and layout inside your browser. Try now!",
  },
  "/add-page-numbers": {
    title: "Add Page Numbers to PDF Free Online - No Upload | PDFMinty",
    description: "Add page numbers to PDF free online without uploading sensitive files to cloud servers. Number PDF pages privately in your browser. Try now!",
    ogTitle: "Add Page Numbers to PDF Free Online - No Upload | PDFMinty",
    ogDescription: "Add page numbers to PDF free online without uploading sensitive files to cloud servers. Number PDF pages privately in your browser. Try now!",
  },
  "/add-blank-page": {
    title: "Add Blank Page to PDF Free — Insert Online | PDFMinty",
    description: "Add blank page to pdf free online without uploading sensitive documents to servers. Insert blank page in pdf online privately inside your browser. Try now!",
    ogTitle: "Add Blank Page to PDF Free — Insert Online | PDFMinty",
    ogDescription: "Add blank page to pdf free online without uploading sensitive documents to servers. Insert blank page in pdf online privately inside your browser. Try now!",
  },
  "/protect-pdf": {
    title: "Password Protect PDF in Browser — 100% Private | PDFMinty",
    description: "Password protect pdf in browser free. Lock PDF files without uploading sensitive data to the cloud. Protect PDF free online no upload. Secure documents now!",
    ogTitle: "Password Protect PDF in Browser — 100% Private | PDFMinty",
    ogDescription: "Password protect pdf in browser free. Lock PDF files without uploading sensitive data to the cloud. Protect PDF free online no upload. Secure documents now!",
  },
  "/unlock-pdf": {
    title: "Unlock PDF Free Online — Remove PDF Password | PDFMinty",
    description: "Unlock PDF free online without uploading sensitive files to cloud servers. Remove PDF password free and clear restrictions in browser securely. Try now!",
    ogTitle: "Unlock PDF Free Online — Remove PDF Password | PDFMinty",
    ogDescription: "Unlock PDF free online without uploading sensitive files to cloud servers. Remove PDF password free and clear restrictions in browser securely. Try now!",
  },
  "/image-to-pdf": {
    title: "JPG to PDF Free Online No Upload — 100% Private | PDFMinty",
    description: "Convert JPG/PNG images to PDF free online with no upload. Merge multiple photos privately in your browser. Download your high-quality PDF instantly now!",
    ogTitle: "JPG to PDF Free Online No Upload — 100% Private | PDFMinty",
    ogDescription: "Convert JPG/PNG images to PDF free online with no upload. Merge multiple photos privately in your browser. Download your high-quality PDF instantly now!",
  },
  "/pdf-to-image": {
    title: "Convert PDF to Image Online Free — 100% Private | PDFMinty",
    description: "Convert PDF to image online free without uploading sensitive files to cloud servers. Extract high-quality JPG or PNG images privately in browser. Try now!",
    ogTitle: "Convert PDF to Image Online Free — 100% Private | PDFMinty",
    ogDescription: "Convert PDF to image online free without uploading sensitive files to cloud servers. Extract high-quality JPG or PNG images privately in browser. Try now!",
  },
  "/intelligence": {
    title: "AI PDF Analyzer Free — Analyze & Summarize Online | PDFMinty",
    description: "Use our secure AI PDF analyzer free online without uploading raw files to cloud servers. Analyze PDF with AI free, get instant summaries, key points, and answers in browser. Try now!",
    ogTitle: "AI PDF Analyzer Free — Analyze & Summarize Online | PDFMinty",
    ogDescription: "Use our secure AI PDF analyzer free online without uploading raw files to cloud servers. Analyze PDF with AI free, get instant summaries, key points, and answers in browser. Try now!",
  },
  "/delete-pages-pdf": {
    title: "Delete PDF Pages Free Online — 100% Private & Local | PDFMinty",
    description: "Delete pages from pdf free online without uploading sensitive files to cloud servers. Remove specific pages from pdf online privately with our secure, in-browser editor. Try now!",
    ogTitle: "Delete PDF Pages Free Online — 100% Private & Local | PDFMinty",
    ogDescription: "Delete pages from pdf free online without uploading sensitive files to cloud servers. Remove specific pages from pdf online privately with our secure, in-browser editor. Try now!",
  },
  "/extract-pages-pdf": {
    title: "Extract PDF Pages Online Free — PDFMinty",
    description: "Extract specific pages from PDF files for free. Download selected pages as a new PDF. Client-side processing.",
    ogTitle: "Extract PDF Pages Online Free — PDFMinty",
    ogDescription: "Extract specific pages from PDF files for free. Client-side processing.",
  },
  "/reorder-pdf": {
    title: "Reorder PDF Pages Online Free — PDFMinty",
    description: "Reorder and rearrange PDF pages for free. Drag and drop pages into any order. Privacy-first tool.",
    ogTitle: "Reorder PDF Pages Online Free — PDFMinty",
    ogDescription: "Reorder and rearrange PDF pages for free. Privacy-first tool.",
  },
  "/is-it-safe-to-upload-pdf-to-online-tools": {
    title: "Is It Safe to Upload Your PDF to Online Tools? Honest Answer | PDFMinty",
    description: "Are online PDF tools safe? Learn the real data security risks of cloud PDF tools, and the safest way to merge, compress, and edit PDF files online without uploading.",
    ogTitle: "Is It Safe to Upload Your PDF to Online Tools? Honest Answer | PDFMinty",
    ogDescription: "Are online PDF tools safe? Learn the real data security risks of cloud PDF tools, and the safest way to merge, compress, and edit PDF files online without uploading.",
  }
};

/**
 * 2. useRouteSEO: A high-performance centralized custom hook to cleanly resolve route metadata for DRY code.
 */
export function useRouteSEO(): Required<Omit<SEOProps, "schemaJson">> & { schemaJson?: Record<string, any> | Record<string, any>[] } {
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
  const canonicalUrl = `https://pdfminty.com${cleanPath || "/"}`;

  // Default image asset
  const ogImage = "https://pdfminty.com/og-image.png";

  let schemaJson: any;

  if (cleanPath === "/") {
    // Return undefined to prevent duplicating index.html pre-baked JSON-LD schemas
    schemaJson = undefined;
  } else {
    schemaJson = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": baseMeta.title.split(" | ")[0] || "PDFMinty",
      "url": canonicalUrl,
      "description": baseMeta.description,
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "browserRequirements": "Requires JavaScript"
    };
  }

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
  const schemaJson = props.schemaJson !== undefined ? props.schemaJson : routeSEO.schemaJson;

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
