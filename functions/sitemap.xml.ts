import { TOOLS } from '../src/config/seo-data';

interface Env {
  ENVIRONMENT?: string;
  BUILD_DATE?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const siteUrl = 'https://pdfminty.com';

  // BUILD_DATE is injected at deploy time via Cloudflare Pages environment variable.
  // Set BUILD_DATE in your Cloudflare Pages project settings to the current date (YYYY-MM-DD).
  // Falls back to a recent date if not set.
  const BUILD_DATE = (context.env.BUILD_DATE) || (typeof process !== 'undefined' && process.env?.BUILD_DATE) || new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  // Homepage
  xml += `  <url>\n    <loc>${siteUrl}</loc>\n    <lastmod>${BUILD_DATE}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n    <image:image>\n      <image:loc>${siteUrl}/og-image.png</image:loc>\n    </image:image>\n  </url>\n`;

  // Tools & Articles from TOOLS config
  for (const tool of TOOLS) {
    const loc = `${siteUrl}/${tool.slug}`;
    const priority = tool.type === 'tool' ? '0.8' : '0.7';
    const changefreq = tool.changefreq || 'monthly';
    const imageLoc = tool.ogImage ? `${siteUrl}${tool.ogImage}` : `${siteUrl}/og-image.png`;

    xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${BUILD_DATE}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n    <image:image>\n      <image:loc>${imageLoc}</image:loc>\n    </image:image>\n  </url>\n`;
  }

  xml += '</urlset>\n';

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};

