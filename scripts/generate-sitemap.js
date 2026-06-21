import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Single Source of Truth Loader:
// Reads the plain TypeScript 'seo-data.ts' file, strips TS type definitions dynamically,
// writes it to a temporary module, imports it, and cleans up immediately.
// This is the simplest, most lightweight way to share typed data with Node scripts
// in a standard ES module environment without needing heavy compilation tools.
async function loadSeoData() {
  const seoPath = path.join(__dirname, '../src/config/seo-data.ts');
  const tempJsPath = path.join(__dirname, './seo-data-temp.js');
  
  try {
    let content = fs.readFileSync(seoPath, 'utf8');
    
    // Crop out the interface declaration cleanly by finding position markers
    const interfaceStart = content.indexOf('export interface');
    const toolsStart = content.indexOf('export const TOOLS');
    
    if (interfaceStart !== -1 && toolsStart !== -1) {
      content = content.substring(0, interfaceStart) + content.substring(toolsStart);
    }
    
    // Remove individual type bindings
    content = content.replace(': ToolSEOInfo[]', '');
    
    fs.writeFileSync(tempJsPath, content, 'utf8');
    
    // Native ESM import requires complete absolute file URL structure
    const moduleUrl = pathToFileURL(tempJsPath).href;
    const data = await import(moduleUrl);
    
    return data;
  } finally {
    if (fs.existsSync(tempJsPath)) {
      fs.unlinkSync(tempJsPath);
    }
  }
}

async function run() {
  const seoData = await loadSeoData();
  const { SITE_URL, TOOLS } = seoData;
  
  console.log(`Generating sitemap for ${SITE_URL} with ${TOOLS.length} items...`);
  
  // Format the lastmod dates to standard YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  
  // Standard homepage url block
  let sitemapLines = [
    '  <url>',
    `    <loc>${SITE_URL}/</loc>`,
    `    <lastmod>${today}</lastmod>`,
    '    <changefreq>daily</changefreq>',
    '    <priority>1.0</priority>',
    '  </url>'
  ];
  
  // Append XML entries for each tool and article
  TOOLS.forEach((item) => {
    sitemapLines.push(
      '  <url>',
      `    <loc>${SITE_URL}/${item.slug}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${item.changefreq || 'monthly'}</changefreq>`,
      `    <priority>${item.priority.toFixed(2)}</priority>`,
      '  </url>'
    );
  });
  
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapLines.join('\n')}
</urlset>`;

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

  // Write content to /public and /dist (if it exists) to guarantee reliability regardless of build ordering
  const pathsToWrite = [
    path.join(__dirname, '../public'),
    path.join(__dirname, '../dist')
  ];
  
  pathsToWrite.forEach((dir) => {
    if (fs.existsSync(dir)) {
      fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemapXml, 'utf8');
      fs.writeFileSync(path.join(dir, 'robots.txt'), robotsTxt, 'utf8');
      console.log(`Successfully generated sitemap and robots.txt in: ${dir}`);
    } else {
      // Create if it's public/ folder which must exist
      if (dir.endsWith('public')) {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemapXml, 'utf8');
        fs.writeFileSync(path.join(dir, 'robots.txt'), robotsTxt, 'utf8');
        console.log(`Successfully created public folder and wrote sitemap/robots.txt`);
      }
    }
  });
}

run().catch((err) => {
  console.error("FATAL: Failed to generate sitemap:", err);
  process.exit(1);
});
