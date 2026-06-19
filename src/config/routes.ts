export interface RouteEntry {
  path: string;
  priority: number;
  changefreq: string;
  lastmod?: string;
}

export const SITE_ROUTES: RouteEntry[] = [
  { path: "/", priority: 1.0, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/merge-pdf", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/split-pdf", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/compress-pdf", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/rotate-pdf", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/organize", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/delete-pages-pdf", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/extract-pages-pdf", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/reorder-pdf", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/watermark-pdf", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/add-page-numbers", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/add-blank-page", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/protect-pdf", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/unlock-pdf", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/image-to-pdf", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/pdf-to-image", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/intelligence", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" },
  { path: "/is-it-safe-to-upload-pdf-to-online-tools", priority: 0.6, changefreq: "weekly", lastmod: "2026-06-17" }
];

export const SITE_URL = "https://pdfaid.com";
