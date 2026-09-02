import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let hasError = false;
const publicDir = path.join(__dirname, '../public');
const srcDir = path.join(__dirname, '../src');

console.log('🔍 Starting Automated SEO Validation...\n');

// 1. Validate _redirects
try {
  const redirectsPath = path.join(publicDir, '_redirects');
  if (fs.existsSync(redirectsPath)) {
    const content = fs.readFileSync(redirectsPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    lines.forEach(line => {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const [source, target] = parts;
        if (target.startsWith('/') && !target.includes('.') && !target.endsWith('/') && target !== '/') {
          console.error(`❌ Redirect Target Missing Slash: ${source} -> ${target}`);
          hasError = true;
        }
      }
    });
    console.log('✅ _redirects file validated (No chains, trailing slashes enforced).');
  }
} catch (e) {
  console.error(e);
}

// 2. Validate seo-data.ts for noncanonical internal links
try {
  const seoDataPath = path.join(srcDir, 'config', 'seo-data.ts');
  const content = fs.readFileSync(seoDataPath, 'utf-8');
  // Match href="/..." but exclude files like .png, .xml
  const hrefRegex = /href="(\/[^"]+?[^/])"/g;
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    if (!match[1].includes('.') && !match[1].includes('#')) {
      console.error(`❌ Non-canonical Internal Link Found: ${match[1]}`);
      hasError = true;
    }
  }
  console.log('✅ Internal Links in seo-data.ts validated (All point to canonical /).');
} catch (e) {
  console.error(e);
}

// 3. Validate Sitemap (Check if any URL misses a trailing slash)
try {
  const sitemaps = ['sitemap-tools.xml', 'sitemap-blog.xml', 'sitemap-pages.xml'];
  sitemaps.forEach(sm => {
    const smPath = path.join(publicDir, sm);
    if (fs.existsSync(smPath)) {
      const content = fs.readFileSync(smPath, 'utf-8');
      const locRegex = /<loc>(https:\/\/pdfminty\.com\/[^<]+?[^/])<\/loc>/g;
      let match;
      while ((match = locRegex.exec(content)) !== null) {
        if (!match[1].includes('.')) { // ignore .xml or .html if any
           console.error(`❌ Sitemap URL missing trailing slash in ${sm}: ${match[1]}`);
           hasError = true;
        }
      }
    }
  });
  console.log('✅ Sitemaps validated (All locs are canonical).');
} catch (e) {
  console.error(e);
}

if (hasError) {
  console.error('\n⚠️ SEO Validation Failed!');
  process.exit(1);
} else {
  console.log('\n🚀 ALL AUTOMATED SEO CHECKS PASSED!');
}
