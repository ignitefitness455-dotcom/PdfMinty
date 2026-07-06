import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ROUTES, SITE_URL } from '../src/config/routes';
import { TOOLS } from '../src/config/seo-data';
import { logger } from '../src/utils/logger';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  image: string;
}

/**
 * Automatically discovers the source .tsx file for a given route key and path
 * without hardcoded mappings, ensuring zero manual intervention for future tools.
 */
function findSourceFileForRoute(routeKey: string, routePath: string): string | null {
  const pagesDir = path.resolve(__dirname, '../src/pages');
  const appFile = path.resolve(__dirname, '../src/App.tsx');

  // Special case for HOME
  if (routePath === '/' || routeKey === 'HOME') {
    const homePath = path.join(pagesDir, 'HomePage.tsx');
    if (fs.existsSync(homePath)) return homePath;
  }

  // 1. Scan App.tsx to find component mapping for this route key
  if (fs.existsSync(appFile)) {
    try {
      const appContent = fs.readFileSync(appFile, 'utf-8');
      const routeRegex = new RegExp(`path=\\{ROUTES\\.${routeKey}\\}[\\s\\S]{1,400}?<([A-Z][a-zA-Z0-9_]*)\\b`);
      const routeMatch = appContent.match(routeRegex);
      if (routeMatch && routeMatch[1]) {
        const compName = routeMatch[1];
        const importRegex = new RegExp(`(?:const\\s+${compName}|import\\s+.*?${compName}.*?)\\s*[=:]?\\s*(?:React\\.lazy\\(\\(\\)\\s*=>\\s*import\\(['"]\\.\\/pages\\/([^'"]+)['"]\\)|from\\s+['"]\\.\\/pages\\/([^'"]+)['"])`);
        const importMatch = appContent.match(importRegex);
        if (importMatch) {
          const pageFileName = importMatch[1] || importMatch[2];
          if (pageFileName) {
            const pageFilePath = path.join(pagesDir, `${pageFileName}.tsx`);
            if (fs.existsSync(pageFilePath)) return pageFilePath;
          }
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  // 2. Fallback heuristics scanning pages directory
  if (fs.existsSync(pagesDir)) {
    const files = fs.readdirSync(pagesDir);
    const slugParts = routePath.replace(/^\//, '').split('-');
    const camel1 = slugParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Page.tsx';
    const camel2 = slugParts[0].charAt(0).toUpperCase() + slugParts[0].slice(1) + 'Page.tsx';
    for (const f of files) {
      if (f === camel1 || f === camel2) {
        return path.join(pagesDir, f);
      }
    }
  }

  return null;
}

async function run(): Promise<void> {
  const distDir: string = path.resolve(__dirname, '../dist');
  const publicDir: string = path.resolve(__dirname, '../public');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const urlMap = new Map<string, SitemapUrl>();

  // Scan all routes dynamically defined in src/config/routes.ts
  for (const [routeKey, routePath] of Object.entries(ROUTES)) {
    const cleanPath = routePath === '/' ? '' : (routePath.startsWith('/') ? routePath : `/${routePath}`);
    const loc = `${SITE_URL}${cleanPath}`;

    let lastmod: string = new Date().toISOString().split('T')[0];
    const sourceFile = findSourceFileForRoute(routeKey, routePath);
    if (sourceFile) {
      try {
        const stat = fs.statSync(sourceFile);
        lastmod = stat.mtime.toISOString().split('T')[0];
      } catch {
        // Keep fallback date
      }
    }

    if (routePath === '/') {
      urlMap.set(loc, {
        loc,
        lastmod,
        changefreq: 'weekly',
        priority: '1.0',
        image: `${SITE_URL}/og-image.png`,
      });
    } else {
      const slug = routePath.replace(/^\//, '');
      const tool = TOOLS.find((t) => t.slug === slug || t.id === slug);
      urlMap.set(loc, {
        loc,
        lastmod,
        changefreq: tool?.changefreq || 'monthly',
        priority: tool?.priority !== undefined ? String(tool.priority) : (tool?.type === 'tool' ? '0.8' : '0.7'),
        image: tool?.ogImage ? `${SITE_URL}${tool.ogImage}` : `${SITE_URL}/og-image.png`,
      });
    }
  }

  const urls: SitemapUrl[] = Array.from(urlMap.values());

  urls.sort((a, b) => {
    const diff = parseFloat(b.priority) - parseFloat(a.priority);
    if (diff !== 0) return diff;
    return a.loc.localeCompare(b.loc);
  });

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u: SitemapUrl) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  const sitemapImagesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u: SitemapUrl) => `  <url>
    <loc>${u.loc}</loc>
    <image:image>
      <image:loc>${u.image}</image:loc>
    </image:image>
  </url>`).join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);
  fs.writeFileSync(path.join(distDir, 'sitemap-images.xml'), sitemapImagesXml);
  fs.writeFileSync(path.join(publicDir, 'sitemap-images.xml'), sitemapImagesXml);

  logger.info(`✓ Generated sitemap.xml and sitemap-images.xml with ${urls.length} URLs dynamically from ROUTES`);
}

run().catch((err: unknown) => {
  logger.error('Sitemap generation failed:', err);
  process.exit(1);
});
