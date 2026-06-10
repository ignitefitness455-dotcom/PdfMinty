import fs from 'fs/promises';
import path from 'path';

/**
 * Technical Requirements Compliance:
 * 1. Predefined Array of Core Production Routes: Complete list of real application routes.
 * 2. Sitemap Specifications: Prioritized changefreq, custom priorities, accurate trailing/non-trailing options.
 * 3. Robots.txt Specifications: Strict production crawler directives pointing to the canonical sitemap.
 * 4. Asynchronous I/O & Clean Terminal Logging.
 */

const coreRoutes = [
  { path: '/', priority: '1.0', freq: 'weekly' },
  { path: '/merge-pdf', priority: '0.8', freq: 'weekly' },
  { path: '/split-pdf', priority: '0.8', freq: 'weekly' },
  { path: '/compress-pdf', priority: '0.8', freq: 'weekly' },
  { path: '/rotate-pdf', priority: '0.8', freq: 'weekly' },
  { path: '/organize', priority: '0.8', freq: 'weekly' },
  { path: '/watermark-pdf', priority: '0.8', freq: 'weekly' },
  { path: '/add-page-numbers', priority: '0.8', freq: 'weekly' },
  { path: '/add-blank-page', priority: '0.8', freq: 'weekly' },
  { path: '/protect-pdf', priority: '0.8', freq: 'weekly' },
  { path: '/unlock-pdf', priority: '0.8', freq: 'weekly' },
  { path: '/image-to-pdf', priority: '0.8', freq: 'weekly' },
  { path: '/pdf-to-image', priority: '0.8', freq: 'weekly' },
  { path: '/delete-pages-pdf', priority: '0.5', freq: 'weekly' },
  { path: '/reorder-pdf', priority: '0.5', freq: 'weekly' },
  { path: '/intelligence', priority: '0.8', freq: 'weekly' },
  { path: '/is-it-safe-to-upload-pdf-to-online-tools', priority: '0.8', freq: 'weekly' },
];

// ANSI colors for clean, professional console logs
const Colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

async function runGenerator() {
  console.log(`${Colors.blue}[DevOps Build Pipeline] Beginning automated sitemap and robots.txt lifecycle updates...${Colors.reset}`);

  try {
    const siteUrl = process.env.VITE_SITE_URL || 'https://pdfminty.com';
    const lastMod = new Date().toISOString(); // Accurate ISO timestamp of the current build execution

    // 1. Generate XML Sitemap content
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${coreRoutes.map(route => {
  const fullUrl = `${siteUrl}${route.path === '/' ? '/' : route.path}`;
  return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${route.freq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
}).join('\n')}
</urlset>
`;

    // 2. Generate compliant production robots.txt content
    const robotsTxtContent = `User-agent: *
Allow: /

# Block sensitive pathways or temporary deployment artifacts
Disallow: /api/
Disallow: /functions/
Disallow: /assets/*.map$
Disallow: /dev/

# Absolute canonical sitemap location pointer
Sitemap: ${siteUrl}/sitemap.xml
`;

    // Write targets inside both public/ (source) and dist/ (production build output) if present
    const cwd = process.cwd();
    const publicDir = path.join(cwd, 'public');
    const distDir = path.join(cwd, 'dist');

    // Ensure public folder path exists
    try {
      await fs.access(publicDir);
    } catch {
      await fs.mkdir(publicDir, { recursive: true });
    }

    const publicSitemapPath = path.join(publicDir, 'sitemap.xml');
    const publicRobotsPath = path.join(publicDir, 'robots.txt');

    await fs.writeFile(publicSitemapPath, sitemapContent, 'utf-8');
    await fs.writeFile(publicRobotsPath, robotsTxtContent, 'utf-8');

    console.log(`${Colors.green}✔ Successfully generated sitemap.xml in public/sitemap.xml${Colors.reset}`);
    console.log(`${Colors.green}✔ Successfully generated robots.txt in public/robots.txt${Colors.reset}`);

    // If dist folder exists, write to dist as well so Vite build picks up updates directly even if run in-order
    let writtenToDist = false;
    try {
      await fs.access(distDir);
      const distSitemapPath = path.join(distDir, 'sitemap.xml');
      const distRobotsPath = path.join(distDir, 'robots.txt');
      await fs.writeFile(distSitemapPath, sitemapContent, 'utf-8');
      await fs.writeFile(distRobotsPath, robotsTxtContent, 'utf-8');
      writtenToDist = true;
    } catch {
      // dist does not exist yet; perfectly normal if generating pre-build
    }

    if (writtenToDist) {
      console.log(`${Colors.cyan}✔ Copied artifacts directly into active dist/ build subdirectory.${Colors.reset}`);
    }

    console.log(`${Colors.blue}[DevOps Build Pipeline] Setup completed successfully! 🎉${Colors.reset}\n`);

  } catch (err) {
    console.error(`${Colors.red}❌ Error during build-lifecycle SEO page indexing automation:${Colors.reset}`, err);
    process.exit(1);
  }
}

runGenerator();
