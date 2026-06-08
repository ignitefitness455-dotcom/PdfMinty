interface Env {
  ENVIRONMENT?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);

  // Default production domain setting (strict Non-WWW format)
  const siteUrl = "https://pdfminty.com";

  // Core production sitemap routes
  const coreRoutes = [
    { path: "", priority: "1.0", freq: "weekly" },
    { path: "/merge-pdf", priority: "0.8", freq: "weekly" },
    { path: "/split-pdf", priority: "0.8", freq: "weekly" },
    { path: "/compress-pdf", priority: "0.8", freq: "weekly" },
    { path: "/rotate-pdf", priority: "0.8", freq: "weekly" },
    { path: "/organize", priority: "0.8", freq: "weekly" },
    { path: "/watermark-pdf", priority: "0.8", freq: "weekly" },
    { path: "/add-page-numbers", priority: "0.8", freq: "weekly" },
    { path: "/add-blank-page", priority: "0.8", freq: "weekly" },
    { path: "/protect-pdf", priority: "0.8", freq: "weekly" },
    { path: "/unlock-pdf", priority: "0.8", freq: "weekly" },
    { path: "/image-to-pdf", priority: "0.8", freq: "weekly" },
    { path: "/pdf-to-image", priority: "0.8", freq: "weekly" },
    { path: "/delete-pages-pdf", priority: "0.8", freq: "weekly" },
    { path: "/extract-pages-pdf", priority: "0.8", freq: "weekly" },
    { path: "/reorder-pdf", priority: "0.8", freq: "weekly" },
    { path: "/intelligence", priority: "0.8", freq: "weekly" },
  ];

  // Dynamic ISO date alignment to avoid indexing shifts while maintaining accuracy
  const buildDate = new Date().toISOString();

  // Build compliant, strict sitemap layout
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
  xml += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
  xml += 'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

  for (const route of coreRoutes) {
    xml += "  <url>\n";
    xml += `    <loc>${siteUrl}${route.path}</loc>\n`;
    xml += `    <lastmod>${buildDate}</lastmod>\n`;
    xml += `    <changefreq>${route.freq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += "  </url>\n";
  }

  xml += "</urlset>\n";

  // Standard response with exact mandatory crawlers header configuration
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
