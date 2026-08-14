import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_URL, TOOLS, ToolSEOInfo } from '../src/config/seo-data';
import { logger } from '../src/utils/logger';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSitemapXml(): { sitemapXml: string } {
  // Static canonical routes with substantive content update dates
  const staticRoutes: Array<{ path: string; priority: string; changefreq: string; lastmod: string }> = [
    { path: '', priority: '1.0', changefreq: 'daily', lastmod: '2026-02-10' },
    { path: '/blog', priority: '0.9', changefreq: 'daily', lastmod: '2026-02-10' },
    { path: '/adobe-acrobat-alternative', priority: '0.8', changefreq: 'weekly', lastmod: '2026-02-05' },
    { path: '/switch-from-adobe-acrobat', priority: '0.8', changefreq: 'weekly', lastmod: '2026-02-05' },
    { path: '/about-us', priority: '0.5', changefreq: 'monthly', lastmod: '2026-01-20' },
    { path: '/contact', priority: '0.5', changefreq: 'monthly', lastmod: '2026-01-20' },
    { path: '/privacy-policy', priority: '0.3', changefreq: 'monthly', lastmod: '2026-02-01' },
    { path: '/terms-of-service', priority: '0.3', changefreq: 'monthly', lastmod: '2026-02-01' },
  ];

  const urlEntries: Array<{
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
    imageLoc: string;
    title: string;
    caption: string;
  }> = [];

  const addedPaths = new Set<string>();

  // Add static routes
  for (const route of staticRoutes) {
    if (!addedPaths.has(route.path)) {
      addedPaths.add(route.path);
      const slashedPath = route.path.endsWith('/') ? route.path : `${route.path}/`;
      const loc = `${SITE_URL}${slashedPath}`;
      urlEntries.push({
        loc,
        lastmod: route.lastmod,
        changefreq: route.changefreq,
        priority: route.priority,
        imageLoc: `${SITE_URL}/og-image.png`,
        title: 'PdfMinty — Free Privacy-First PDF Toolkit',
        caption: 'Free in-browser PDF utilities with zero server uploads',
      });
    }
  }

  // Add all tools and articles from canonical seo-data registry
  for (const item of TOOLS as ToolSEOInfo[]) {
    const rawSlug = item.slug.startsWith('/') ? item.slug : `/${item.slug}`;
    if (!addedPaths.has(rawSlug)) {
      addedPaths.add(rawSlug);
      const slashedSlug = rawSlug.endsWith('/') ? rawSlug : `${rawSlug}/`;
      const loc = `${SITE_URL}${slashedSlug}`;
      const isTool = item.type === 'tool';
      const priority = isTool ? '0.9' : '0.8';
      const changefreq = 'weekly';
      const lastmod = item.dateModified || item.datePublished || '2026-02-01';
      const ogImage = item.ogImage
        ? `${SITE_URL}${item.ogImage}`
        : `${SITE_URL}/og-image.png`;

      urlEntries.push({
        loc,
        lastmod,
        changefreq,
        priority,
        imageLoc: ogImage,
        title: item.metaTitle || item.name || item.h1 || 'PdfMinty Tool',
        caption: item.shortDescription || `${item.name} PDF tool`,
      });
    }
  }

  // Construct sitemap.xml with embedded image tags
  const xmlUrls = urlEntries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
    <image:image>
      <image:loc>${escapeXml(entry.imageLoc)}</image:loc>
      <image:title>${escapeXml(entry.title)}</image:title>
      <image:caption>${escapeXml(entry.caption)}</image:caption>
    </image:image>
  </url>`
    )
    .join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlUrls}
</urlset>`;

  return { sitemapXml };
}

async function run(): Promise<void> {
  const publicDir = path.join(__dirname, '../public');
  const distDir = path.join(__dirname, '../dist');

  const { sitemapXml } = generateSitemapXml();

  const targets = [publicDir, distDir];

  for (const dir of targets) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemapXml, 'utf8');
    logger.info(`Generated sitemap.xml in ${dir}`);
  }
}

if (process.argv[1] && process.argv[1].endsWith('generate-sitemap.ts')) {
  run().catch((err) => {
    logger.error('Failed to generate sitemaps:', err);
    process.exit(1);
  });
}

