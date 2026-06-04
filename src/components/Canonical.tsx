import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

interface RouteMeta {
  title: string;
  desc: string;
}

const METADATA: Record<string, RouteMeta> = {
  "/": {
    title: "PDFMinty — Free Online PDF Tools | Merge, Compress & Split PDF",
    desc: "100% free, privacy-first PDF toolkit. All processing happens locally in your browser. No upload needed."
  },
  "/merge-pdf": {
    title: "Merge PDFs Online Free | Combine Multiple PDFs — PDFMinty",
    desc: "Merge multiple PDF files into one document for free. No upload, no registration. All processing happens in your browser."
  },
  "/split-pdf": {
    title: "Split PDF Online Free | Extract Pages from PDF — PDFMinty",
    desc: "Split PDF pages or extract specific pages for free. Privacy-first, client-side processing."
  },
  "/compress-pdf": {
    title: "Compress PDF Online Free | Reduce File Size — PDFMinty",
    desc: "Compress PDF files to reduce size without losing quality. Free, fast, and private."
  },
  "/rotate-pdf": {
    title: "Rotate PDF Pages Online Free — PDFMinty",
    desc: "Rotate PDF pages left or right for free. No upload needed."
  },
  "/organize": {
    title: "Delete PDF Pages Online Free | Organize PDF — PDFMinty",
    desc: "Delete unwanted pages from PDF files. Free and privacy-first."
  },
  "/watermark-pdf": {
    title: "Add Watermark to PDF Online Free — PDFMinty",
    desc: "Add text or image watermarks to PDF files for free. Client-side processing."
  },
  "/add-page-numbers": {
    title: "Add Page Numbers to PDF Online Free — PDFMinty",
    desc: "Add page numbers to PDF documents for free. Customizable position and style."
  },
  "/add-blank-page": {
    title: "Insert Blank Pages into PDF Online Free — PDFMinty",
    desc: "Insert blank pages into PDF files at any position. Free and private."
  },
  "/protect-pdf": {
    title: "Password Protect PDF Online Free — PDFMinty",
    desc: "Add password protection to PDF files for free. Secure your documents."
  },
  "/unlock-pdf": {
    title: "Unlock PDF Online Free | Remove Password — PDFMinty",
    desc: "Remove password protection from PDF files. Free and client-side."
  },
  "/image-to-pdf": {
    title: "Convert Image to PDF Online Free — PDFMinty",
    desc: "Convert JPG, PNG, WebP images to PDF for free. No upload needed."
  },
  "/pdf-to-image": {
    title: "Convert PDF to Image Online Free — PDFMinty",
    desc: "Convert PDF pages to JPG or PNG images for free. Privacy-first processing."
  },
  "/intelligence": {
    title: "AI PDF Analyzer Online Free | Smart Document Analysis — PDFMinty",
    desc: "Analyze PDF documents with AI. Extract insights, summaries, and key information."
  }
};

export default function Canonical() {
  const location = useLocation();

  const isCapacitor = typeof window !== "undefined" && typeof (window as any).Capacitor !== "undefined";

  // Real, physical redirect for old HashRouter URLs (Browser only, Capacitor excluded)
  if (!isCapacitor && window.location.hash && window.location.hash.startsWith("#/")) {
    const hashPath = window.location.hash.slice(1); // e.g. "/merge-pdf"
    const urlParts = hashPath.split("?");
    const targetPath = urlParts[0];
    const targetQuery = urlParts[1] ? "?" + urlParts[1] : "";
    window.location.replace(targetPath + targetQuery);
    return null;
  }

  let cleanPath = location.pathname;

  // Normalize HashRouter paths if they spill onto hash structures (Web fallback/dev cases only)
  if (!isCapacitor && cleanPath === "/" && window.location.hash) {
    const hashPath = window.location.hash.slice(1); // strip out '#'
    if (hashPath.startsWith("/")) {
      cleanPath = hashPath.split("?")[0];
    } else {
      cleanPath = "/" + hashPath.split("?")[0];
    }
  }

  if (cleanPath.endsWith("/") && cleanPath.length > 1) {
    cleanPath = cleanPath.slice(0, -1);
  }

  const canonicalUrl = `https://www.pdfminty.com${cleanPath || "/"}`;
  const meta = METADATA[cleanPath] || METADATA["/"];

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.desc} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.desc} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter Cards */}
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.desc} />

      {/* Canonical and hreflang Alternate Tags */}
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="bn" href={`https://www.pdfminty.com/bn${cleanPath === "/" ? "/" : cleanPath}`} />
      <link rel="alternate" hrefLang="hi" href={`https://www.pdfminty.com/hi${cleanPath === "/" ? "/" : cleanPath}`} />
      <link rel="alternate" hrefLang="es" href={`https://www.pdfminty.com/es${cleanPath === "/" ? "/" : cleanPath}`} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
    </Helmet>
  );
}
