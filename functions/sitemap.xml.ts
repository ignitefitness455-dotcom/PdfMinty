import { TOOLS } from '../src/config/seo-data';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, I18N_TOOL_SLUGS } from '../src/i18n/config';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const onRequest: PagesFunction = async () => {
  const siteUrl = 'https://pdfminty.com';

  const staticRoutes = [
    { path: '', priority: '1.0', changefreq: 'daily', lastmod: '2026-02-10' },
    { path: '/blog', priority: '0.9', changefreq: 'daily', lastmod: '2026-02-10' },
    { path: '/adobe-acrobat-alternative', priority: '0.8', changefreq: 'weekly', lastmod: '2026-02-05' },
    { path: '/switch-from-adobe-acrobat', priority: '0.8', changefreq: 'weekly', lastmod: '2026-02-05' },
    { path: '/about-us', priority: '0.5', changefreq: 'monthly', lastmod: '2026-01-20' },
    { path: '/contact', priority: '0.5', changefreq: 'monthly', lastmod: '2026-01-20' },
    { path: '/privacy-policy', priority: '0.3', changefreq: 'monthly', lastmod: '2026-02-01' },
    { path: '/terms-of-service', priority: '0.3', changefreq: 'monthly', lastmod: '2026-02-01' },
  ];

  const addedPaths = new Set<string>();
  const entries: Array<{ loc: string; priority: string; changefreq: string; lastmod: string; image: string }> = [];

  for (const route of staticRoutes) {
    if (!addedPaths.has(route.path)) {
      addedPaths.add(route.path);
      const slashedPath = route.path.endsWith('/') ? route.path : `${route.path}/`;
      entries.push({
        loc: `${siteUrl}${slashedPath}`,
        priority: route.priority,
        changefreq: route.changefreq,
        lastmod: route.lastmod,
        image: `${siteUrl}/og-image.png`,
      });
    }
  }

  for (const tool of TOOLS) {
    const rawSlug = tool.slug.startsWith('/') ? tool.slug : `/${tool.slug}`;
    if (!addedPaths.has(rawSlug)) {
      addedPaths.add(rawSlug);
      const slashedSlug = rawSlug.endsWith('/') ? rawSlug : `${rawSlug}/`;
      const isTool = tool.type === 'tool';
      const priority = isTool ? '0.9' : '0.8';
      const changefreq = 'weekly';
      const lastmod = tool.dateModified || tool.datePublished || '2026-02-01';

      entries.push({
        loc: `${siteUrl}${slashedSlug}`,
        priority,
        changefreq,
        lastmod,
        image: tool.ogImage ? `${siteUrl}${tool.ogImage}` : `${siteUrl}/og-image.png`,
      });

      // Add localized versions for tools configured in i18n
      const cleanSlug = tool.slug.replace(/^\//, '').replace(/\/$/, '');
      if ((I18N_TOOL_SLUGS as readonly string[]).includes(cleanSlug)) {
        for (const locLang of SUPPORTED_LOCALES) {
          if (locLang !== DEFAULT_LOCALE) {
            const localizedPath = `/${locLang}/${cleanSlug}`;
            if (!addedPaths.has(localizedPath)) {
              addedPaths.add(localizedPath);
              entries.push({
                loc: `${siteUrl}${localizedPath}/`,
                priority,
                changefreq,
                lastmod,
                image: tool.ogImage ? `${siteUrl}${tool.ogImage}` : `${siteUrl}/og-image.png`,
              });
            }
          }
        }
      }
    }
  }

  entries.sort((a, b) => {
    const diff = parseFloat(b.priority) - parseFloat(a.priority);
    if (diff !== 0) return diff;
    return a.loc.localeCompare(b.loc);
  });

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  for (const entry of entries) {
    xml += `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n    <image:image>\n      <image:loc>${escapeXml(entry.image)}</image:loc>\n    </image:image>\n  </url>\n`;
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


