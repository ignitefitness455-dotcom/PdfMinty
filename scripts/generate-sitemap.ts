import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_URL, TOOLS, ToolSEOInfo } from '../src/config/seo-data';
import { logger } from '../src/utils/logger';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

export function generateSitemapXml(): { sitemapXml: string; imageSitemapXml: string } {
  const currentDate = new Date().toISOString().split('T')[0];

  // Map of static additional routes not in TOOLS array directly
  const staticRoutes: Array<{ path: string; priority: string; changefreq: string }> = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/blog', priority: '0.9', changefreq: 'daily' },
    { path: '/adobe-acrobat-alternative', priority: '0.8', changefreq: 'weekly' },
    { path: '/switch-from-adobe-acrobat', priority: '0.8', changefreq: 'weekly' },
    { path: '/about-us', priority: '0.5', changefreq: 'monthly' },
    { path: '/contact', priority: '0.5', changefreq: 'monthly' },
    { path: '/privacy-policy', priority: '0.3', changefreq: 'monthly' },
    { path: '/terms-of-service', priority: '0.3', changefreq: 'monthly' },
  ];

  const urlEntries: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];
  const imageEntries: Array<{ loc: string; imageLoc: string; title: string }> = [];

  const addedPaths = new Set<string>();

  // Add static routes
  for (const route of staticRoutes) {
    if (!addedPaths.has(route.path)) {
      addedPaths.add(route.path);
      const loc = route.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${route.path}/`;
      urlEntries.push({
        loc,
        lastmod: currentDate,
        changefreq: route.changefreq,
        priority: route.priority,
      });

      imageEntries.push({
        loc,
        imageLoc: `${SITE_URL}/og-image.png`,
        title: 'PDFMinty — Free Privacy-First PDF Toolkit',
      });
    }
  }

  // Add all tools and articles from seo-data.ts
  for (const item of TOOLS as ToolSEOInfo[]) {
    const rawSlug = item.slug.startsWith('/') ? item.slug : `/${item.slug}`;
    if (!addedPaths.has(rawSlug)) {
      addedPaths.add(rawSlug);
      const loc = `${SITE_URL}${rawSlug}/`;
      const isTool = item.type === 'tool';
      const priority = isTool ? '0.9' : '0.8';
      const changefreq = isTool ? 'weekly' : 'weekly';

      urlEntries.push({
        loc,
        lastmod: currentDate,
        changefreq,
        priority,
      });

      const ogImage = item.slug.startsWith('blog/')
        ? `${SITE_URL}/og-image.png`
        : `${SITE_URL}/og-${item.id}.png`;

      imageEntries.push({
        loc,
        imageLoc: ogImage,
        title: item.metaTitle || item.name || item.h1 || 'PDFMinty Tool',
      });
    }
  }

  // Construct sitemap.xml
  const xmlUrls = urlEntries
    .map(
      (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

  // Construct sitemap-images.xml
  const xmlImageUrls = imageEntries
    .map(
      (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <image:image>
      <image:loc>${entry.imageLoc}</image:loc>
      <image:title>${entry.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:title>
    </image:image>
  </url>`
    )
    .join('\n');

  const imageSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlImageUrls}
</urlset>`;

  return { sitemapXml, imageSitemapXml };
}

async function run(): Promise<void> {
  const publicDir = path.join(__dirname, '../public');
  const distDir = path.join(__dirname, '../dist');

  const { sitemapXml, imageSitemapXml } = generateSitemapXml();

  const targets = [publicDir, distDir];

  for (const dir of targets) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemapXml, 'utf8');
    fs.writeFileSync(path.join(dir, 'sitemap-images.xml'), imageSitemapXml, 'utf8');
    logger.info(`Generated sitemap.xml & sitemap-images.xml in ${dir}`);
  }
}

if (process.argv[1] && process.argv[1].endsWith('generate-sitemap.ts')) {
  run().catch((err) => {
    logger.error('Failed to generate sitemaps:', err);
    process.exit(1);
  });
}
