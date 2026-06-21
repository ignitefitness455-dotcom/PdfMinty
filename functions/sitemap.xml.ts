interface Env {
  ENVIRONMENT?: string;
}

export const onRequest: PagesFunction<Env> = async () => {
  const siteUrl = 'https://pdfminty.com';
  const coreRoutes = [
    { path: '', priority: '1.0', freq: 'weekly' },
    { path: '/merge-pdf', priority: '0.9', freq: 'monthly' },
    { path: '/split-pdf', priority: '0.9', freq: 'monthly' },
    { path: '/compress-pdf', priority: '0.9', freq: 'monthly' },
    { path: '/rotate-pdf', priority: '0.8', freq: 'monthly' },
    { path: '/delete-pages-pdf', priority: '0.8', freq: 'monthly' },
    { path: '/extract-pages-pdf', priority: '0.8', freq: 'monthly' },
    { path: '/reorder-pdf', priority: '0.8', freq: 'monthly' },
    { path: '/watermark-pdf', priority: '0.8', freq: 'monthly' },
    { path: '/add-page-numbers', priority: '0.8', freq: 'monthly' },
    { path: '/add-blank-page', priority: '0.8', freq: 'monthly' },
    { path: '/protect-pdf', priority: '0.8', freq: 'monthly' },
    { path: '/unlock-pdf', priority: '0.8', freq: 'monthly' },
    { path: '/image-to-pdf', priority: '0.8', freq: 'monthly' },
    { path: '/pdf-to-image', priority: '0.8', freq: 'monthly' },
    { path: '/intelligence', priority: '0.8', freq: 'monthly' },
    { path: '/is-it-safe-to-upload-pdf-to-online-tools', priority: '0.7', freq: 'monthly' }
  ];

  const buildDate = new Date().toISOString();
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const route of coreRoutes) {
    xml += `  <url>\n    <loc>${siteUrl}${route.path}</loc>\n    <lastmod>${buildDate}</lastmod>\n    <changefreq>${route.freq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>\n`;
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
