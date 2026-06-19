import { SITE_ROUTES, SITE_URL } from "../src/config/routes";

export const onRequest: PagesFunction = async () => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const entry of SITE_ROUTES) {
    const relativePath = entry.path === "/" ? "" : (entry.path.startsWith("/") ? entry.path : `/${entry.path}`);
    const fullUrl = `${SITE_URL}${relativePath}`;
    
    xml += `  <url>\n`;
    xml += `    <loc>${fullUrl}</loc>\n`;
    if (entry.lastmod) {
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
