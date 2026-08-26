import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_URL, TOOLS, ToolSEOInfo } from '../src/config/seo-data';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  I18N_TOOL_SLUGS,
  isI18nToolSlug,
  getHreflangs,
  HreflangEntry,
} from '../src/i18n/config';
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
  const baseUrl = SITE_URL.replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD at build time
  const staticRoutes: Array<{ path: string; priority: string; changefreq: string; lastmod: string }> = [
    { path: '', priority: '1.0', changefreq: 'daily', lastmod: today },
    { path: '/blog', priority: '0.9', changefreq: 'daily', lastmod: today },
    { path: '/adobe-acrobat-alternative', priority: '0.8', changefreq: 'weekly', lastmod: today },
    { path: '/switch-from-adobe-acrobat', priority: '0.8', changefreq: 'weekly', lastmod: today },
    { path: '/about-us', priority: '0.5', changefreq: 'monthly', lastmod: today },
    { path: '/contact', priority: '0.5', changefreq: 'monthly', lastmod: today },
    { path: '/privacy-policy', priority: '0.3', changefreq: 'monthly', lastmod: today },
    { path: '/terms-of-service', priority: '0.3', changefreq: 'monthly', lastmod: today },
  ];

  const urlEntries: Array<{
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
    imageLoc: string;
    title: string;
    caption: string;
    hreflangs?: HreflangEntry[];
  }> = [];

  const addedPaths = new Set<string>();

  // Add static routes
  for (const route of staticRoutes) {
    if (!addedPaths.has(route.path)) {
      addedPaths.add(route.path);
      const slashedPath = route.path.endsWith('/') ? route.path : `${route.path}/`;
      const loc = `${baseUrl}${slashedPath.startsWith('/') ? slashedPath : `/${slashedPath}`}`;
      urlEntries.push({
        loc,
        lastmod: route.lastmod,
        changefreq: route.changefreq,
        priority: route.priority,
        imageLoc: `${baseUrl}/og-image.png`,
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
      const loc = `${baseUrl}${slashedSlug}`;
      const isTool = item.type === 'tool';
      const priority = isTool ? '0.9' : '0.8';
      const changefreq = 'weekly';
      const lastmod = item.dateModified || item.datePublished || '2026-02-01';
      const ogImage = item.ogImage
        ? (item.ogImage.startsWith('http') ? item.ogImage : `${baseUrl}${item.ogImage.startsWith('/') ? item.ogImage : `/${item.ogImage}`}`)
        : `${baseUrl}/og-image.png`;

      const cleanSlug = item.slug.replace(/^\//, '').replace(/\/$/, '');
      const toolHreflangs = isI18nToolSlug(cleanSlug) ? getHreflangs(cleanSlug, baseUrl) : undefined;

      urlEntries.push({
        loc,
        lastmod,
        changefreq,
        priority,
        imageLoc: ogImage,
        title: item.metaTitle || item.name || item.h1 || 'PdfMinty Tool',
        caption: item.shortDescription || `${item.name} PDF tool`,
        hreflangs: toolHreflangs,
      });

      // Add localized versions for tools configured in i18n
      if ((I18N_TOOL_SLUGS as readonly string[]).includes(cleanSlug)) {
        for (const locLang of SUPPORTED_LOCALES) {
          if (locLang !== DEFAULT_LOCALE) {
            const localizedPath = `/${locLang}/${cleanSlug}`;
            if (!addedPaths.has(localizedPath)) {
              addedPaths.add(localizedPath);
              const localizedLoc = `${baseUrl}${localizedPath}/`;
              urlEntries.push({
                loc: localizedLoc,
                lastmod,
                changefreq,
                priority,
                imageLoc: ogImage,
                title: item.metaTitle || item.name || item.h1 || 'PdfMinty Tool',
                caption: item.shortDescription || `${item.name} PDF tool`,
                hreflangs: toolHreflangs,
              });
            }
          }
        }
      }
    }
  }

  // Construct sitemap.xml with embedded image and xhtml hreflang tags
  const xmlUrls = urlEntries
    .map((entry) => {
      const xhtmlLinks =
        entry.hreflangs && entry.hreflangs.length > 0
          ? entry.hreflangs
              .map(
                (h) =>
                  `    <xhtml:link rel="alternate" hreflang="${escapeXml(h.hreflang)}" href="${escapeXml(h.href)}"/>`
              )
              .join('\n') + '\n'
          : '';

      return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
${xhtmlLinks}    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
    <image:image>
      <image:loc>${escapeXml(entry.imageLoc)}</image:loc>
      <image:title>${escapeXml(entry.title)}</image:title>
      <image:caption>${escapeXml(entry.caption)}</image:caption>
    </image:image>
  </url>`;
    })
    .join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
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

