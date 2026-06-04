import fs from 'fs';
import path from 'path';

const routes = [
  { path: '/', priority: '1.0', freq: 'daily' },
  { path: '/merge-pdf', priority: '0.8', freq: 'monthly' },
  { path: '/split-pdf', priority: '0.8', freq: 'monthly' },
  { path: '/compress-pdf', priority: '0.8', freq: 'monthly' },
  { path: '/rotate-pdf', priority: '0.8', freq: 'monthly' },
  { path: '/organize', priority: '0.8', freq: 'monthly' },
  { path: '/watermark-pdf', priority: '0.8', freq: 'monthly' },
  { path: '/add-page-numbers', priority: '0.8', freq: 'monthly' },
  { path: '/add-blank-page', priority: '0.8', freq: 'monthly' },
  { path: '/protect-pdf', priority: '0.8', freq: 'monthly' },
  { path: '/unlock-pdf', priority: '0.8', freq: 'monthly' },
  { path: '/image-to-pdf', priority: '0.8', freq: 'monthly' },
  { path: '/pdf-to-image', priority: '0.8', freq: 'monthly' },
  { path: '/intelligence', priority: '0.8', freq: 'monthly' },
];

const today = new Date().toISOString().split('T')[0];
const siteUrl = process.env.VITE_SITE_URL || 'https://www.pdfminty.com';

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${routes.map(r => `  <url>
    <loc>${siteUrl}${r.path === '/' ? '' : r.path}</loc>
    <lastmod>${r.path === '/' ? today : '2026-06-04'}</lastmod>
    <changefreq>${r.freq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(process.cwd(), 'public/sitemap.xml'), sitemap);
console.log('✅ public/sitemap.xml successfully generated with actual routes!');
