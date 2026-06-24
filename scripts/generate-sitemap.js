import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadToolsFromTs() {
  const tsPath = path.resolve(__dirname, '../src/config/seo-data.ts');
  const tsContent = fs.readFileSync(tsPath, 'utf-8');
  let stripped = tsContent.replace(/export\s+interface[\s\S]*?\n\}\s*\n/g, '');
  stripped = stripped.replace(/: ToolSEOInfo\[\]/g, '');
  const tempPath = path.join(os.tmpdir(), `pdfminty-seo-data-${Date.now()}.mjs`);
  fs.writeFileSync(tempPath, stripped);
  const mod = await import(tempPath);
  fs.unlinkSync(tempPath);
  return mod.TOOLS;
}

function slugToPageFile(slug) {
  const map = {
    'merge-pdf': 'MergePage',
    'split-pdf': 'SplitPage',
    'compress-pdf': 'CompressPage',
    'rotate-pdf': 'RotatePage',
    'delete-pages-pdf': 'DeletePagesPage',
    'extract-pages-pdf': 'ExtractPagesPdfPage',
    'reorder-pdf': 'ReorderPdfPage',
    'watermark-pdf': 'WatermarkPage',
    'add-page-numbers': 'PageNumbersPage',
    'add-blank-page': 'AddBlankPage',
    'protect-pdf': 'ProtectPage',
    'unlock-pdf': 'UnlockPage',
    'image-to-pdf': 'ImgToPdfPage',
    'pdf-to-image': 'PdfToImgPage',
    'intelligence': 'AiAnalyzePage',
    'is-it-safe-to-upload-pdf-to-online-tools': 'IsSafePdfArticlePage',
  };
  return map[slug] || slug;
}

(async () => {
  const TOOLS = await loadToolsFromTs();
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const SITE_URL = 'https://pdfminty.com';
  const urls = [];

  for (const tool of TOOLS) {
    const slug = tool.slug;
    const pageSourcePath = path.resolve(__dirname, `../src/pages/${slugToPageFile(slug)}.tsx`);
    let lastmod;
    try {
      const stat = fs.statSync(pageSourcePath);
      lastmod = stat.mtime.toISOString().split('T')[0];
    } catch {
      lastmod = new Date().toISOString().split('T')[0];
    }
    urls.push({
      loc: `${SITE_URL}/${slug}`,
      lastmod,
      changefreq: 'monthly',
      priority: tool.type === 'tool' ? '0.8' : '0.7',
      image: tool.ogImage ? `${SITE_URL}${tool.ogImage}` : `${SITE_URL}/og-image.png`,
    });
  }

  urls.unshift({
    loc: SITE_URL,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '1.0',
    image: `${SITE_URL}/og-image.png`,
  });

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    <image:image>
      <image:loc>${u.image}</image:loc>
    </image:image>
  </url>`).join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);
  console.log(`✓ Generated sitemap.xml with ${urls.length} URLs`);
})();
