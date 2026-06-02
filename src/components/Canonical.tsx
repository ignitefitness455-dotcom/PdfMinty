import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Canonical() {
  const location = useLocation();

  useEffect(() => {
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
