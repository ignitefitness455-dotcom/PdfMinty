import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface RouteMeta {
  title: string;
  desc: string;
}

const METADATA: Record<string, RouteMeta> = {
  "/": {
    title: "PDFMinty - Free Online PDF Tools | No Upload Needed",
    desc: "Merge, split, compress, and edit PDFs directly in your browser. 100% free with no uploads—your files never leave your device. Try our private PDF toolkit!"
  },
  "/merge-pdf": {
    title: "Merge PDFs Online Free | Combine Multiple PDF Files - PDFMinty",
    desc: "Merge multiple PDF files into one document for free. No upload required — all processing happens locally in your browser for absolute privacy and speed."
  },
  "/split-pdf": {
    title: "Split PDF Online Free | Extract Pages from PDF - PDFMinty",
    desc: "Split PDF pages or extract specific pages for free. Privacy-first local processing means your secure files never leave your device."
  },
  "/compress-pdf": {
    title: "Compress PDF Online Free | Reduce PDF File Size - PDFMinty",
    desc: "Compress PDF files to reduce size for free. Optimize and shrink PDFs locally in your browser without uploading to any server."
  },
  "/rotate-pdf": {
    title: "Rotate PDF Pages Online Free | Flip PDF Orientation - PDFMinty",
    desc: "Rotate PDF pages 90°, 180°, or 270° for free. Client-side processing ensures complete privacy and instant download."
  },
  "/organize": {
    title: "Delete PDF Pages Online Free | Remove Pages from PDF - PDFMinty",
    desc: "Delete unwanted pages from your PDF for free. No server upload required — process entirely in your browser."
  },
  "/watermark-pdf": {
    title: "Add Watermark to PDF Online Free | Text Watermark - PDFMinty",
    desc: "Add text watermarks to PDF pages for free. Protect and stamp your documents with custom watermarks locally."
  },
  "/add-page-numbers": {
    title: "Add Page Numbers to PDF Online Free | Insert Bates - PDFMinty",
    desc: "Add page numbers to PDF documents for free. Customize position, margins, and format with privacy-first local processing."
  },
  "/add-blank-page": {
    title: "Add Blank Page to PDF Online Free | Insert Empty Pages - PDFMinty",
    desc: "Insert blank pages into your PDF for free. Choose from A4, Letter, Legal, A3, or custom page sizes directly in browser."
  },
  "/protect-pdf": {
    title: "Password Protect PDF Online Free | Encrypt PDF Document - PDFMinty",
    desc: "Add password protection and permissions key to your PDF for free. Encrypt documents with owner passwords locally."
  },
  "/unlock-pdf": {
    title: "Unlock PDF Online Free | Remove PDF Passwords & Keys - PDFMinty",
    desc: "Remove password restriction and print/edit permissions from PDF files for free. Decrypt documents locally with total safety."
  },
  "/image-to-pdf": {
    title: "Convert Images to PDF Online Free | JPG/PNG to PDF - PDFMinty",
    desc: "Convert JPG, JPEG, and PNG images to PDF files for free. Combine multiple photos into a single formatted PDF document offline."
  },
  "/pdf-to-image": {
    title: "Convert PDF to Images Online Free | PDF to JPG/PNG - PDFMinty",
    desc: "Convert PDF pages to high-quality JPG or PNG images for free. Extract individual pages as downloadable photos locally."
  },
  "/intelligence": {
    title: "AI PDF Analyzer Online Free | Smart Document Insights - PDFMinty",
    desc: "Analyze PDF documents with secure local or server AI. Extract summaries, critical action items, and clear answers with complete privacy."
  }
};

export default function Canonical() {
  const location = useLocation();

  useEffect(() => {
    // Real, physical redirect for old HashRouter URLs
    if (window.location.hash && window.location.hash.startsWith("#/")) {
      const hashPath = window.location.hash.slice(1); // e.g. "/merge-pdf"
      const urlParts = hashPath.split("?");
      const targetPath = urlParts[0];
      const targetQuery = urlParts[1] ? "?" + urlParts[1] : "";
      window.location.replace(targetPath + targetQuery);
      return;
    }

    let cleanPath = location.pathname;

    // Normalize HashRouter paths if they spill onto hash structures
    if (cleanPath === "/" && window.location.hash) {
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

    // Update <title> tag
    document.title = meta.title;

    // Update <meta name="description">
    let descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!descMeta) {
      descMeta = document.createElement("meta");
      descMeta.name = "description";
      document.head.appendChild(descMeta);
    }
    descMeta.content = meta.desc;

    // Update <meta property="og:title">
    let ogTitleMeta = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (!ogTitleMeta) {
      ogTitleMeta = document.createElement("meta");
      ogTitleMeta.setAttribute("property", "og:title");
      document.head.appendChild(ogTitleMeta);
    }
    ogTitleMeta.content = meta.title;

    // Update <meta property="og:description">
    let ogDescMeta = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
    if (!ogDescMeta) {
      ogDescMeta = document.createElement("meta");
      ogDescMeta.setAttribute("property", "og:description");
      document.head.appendChild(ogDescMeta);
    }
    ogDescMeta.content = meta.desc;

    // Update <meta property="og:url">
    let ogUrlMeta = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    if (!ogUrlMeta) {
      ogUrlMeta = document.createElement("meta");
      ogUrlMeta.setAttribute("property", "og:url");
      document.head.appendChild(ogUrlMeta);
    }
    ogUrlMeta.content = canonicalUrl;

    // Update <meta name="twitter:title">
    let twitterTitleMeta = document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement;
    if (!twitterTitleMeta) {
      twitterTitleMeta = document.createElement("meta");
      twitterTitleMeta.name = "twitter:title";
      document.head.appendChild(twitterTitleMeta);
    }
    twitterTitleMeta.content = meta.title;

    // Update <meta name="twitter:description">
    let twitterDescMeta = document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement;
    if (!twitterDescMeta) {
      twitterDescMeta = document.createElement("meta");
      twitterDescMeta.name = "twitter:description";
      document.head.appendChild(twitterDescMeta);
    }
    twitterDescMeta.content = meta.desc;

    // Update <link rel="canonical">
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;

    // Update <link rel="alternate" hreflang="en">
    let altEn = document.querySelector('link[hreflang="en"]') as HTMLLinkElement;
    if (!altEn) {
      altEn = document.createElement("link");
      altEn.rel = "alternate";
      altEn.hreflang = "en";
      document.head.appendChild(altEn);
    }
    altEn.href = canonicalUrl;

    // Update <link rel="alternate" hreflang="bn">
    let altBn = document.querySelector('link[hreflang="bn"]') as HTMLLinkElement;
    if (!altBn) {
      altBn = document.createElement("link");
      altBn.rel = "alternate";
      altBn.hreflang = "bn";
      document.head.appendChild(altBn);
    }
    altBn.href = `https://www.pdfminty.com/bn${cleanPath === "/" ? "/" : cleanPath}`;

    // Update <link rel="alternate" hreflang="hi">
    let altHi = document.querySelector('link[hreflang="hi"]') as HTMLLinkElement;
    if (!altHi) {
      altHi = document.createElement("link");
      altHi.rel = "alternate";
      altHi.hreflang = "hi";
      document.head.appendChild(altHi);
    }
    altHi.href = `https://www.pdfminty.com/hi${cleanPath === "/" ? "/" : cleanPath}`;

    // Update <link rel="alternate" hreflang="es">
    let altEs = document.querySelector('link[hreflang="es"]') as HTMLLinkElement;
    if (!altEs) {
      altEs = document.createElement("link");
      altEs.rel = "alternate";
      altEs.hreflang = "es";
      document.head.appendChild(altEs);
    }
    altEs.href = `https://www.pdfminty.com/es${cleanPath === "/" ? "/" : cleanPath}`;

    // Update <link rel="alternate" hreflang="x-default">
    let altDef = document.querySelector('link[hreflang="x-default"]') as HTMLLinkElement;
    if (!altDef) {
      altDef = document.createElement("link");
      altDef.rel = "alternate";
      altDef.hreflang = "x-default";
      document.head.appendChild(altDef);
    }
    altDef.href = canonicalUrl;
  }, [location]);

  return null;
}
