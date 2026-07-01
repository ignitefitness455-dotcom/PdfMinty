import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOOLS, ToolSEOInfo } from '../src/config/seo-data';
import { logger } from '../src/utils/logger';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

function slugToPageFile(slug: string): string {
  const map: Record<string, string> = {
    'merge-pdf': 'MergePage',
    'split-pdf': 'SplitPage',
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

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  image: string;
}

async function run(): Promise<void> {
  const distDir: string = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const SITE_URL = 'https://pdfminty.com';
  const urls: SitemapUrl[] = [];

  for (const tool of TOOLS) {
    const slug: string = tool.slug;
    const pageSourcePath: string = path.resolve(__dirname, `../src/pages/${slugToPageFile(slug)}.tsx`);
    let lastmod: string;
    try {
      const stat: fs.Stats = fs.statSync(pageSourcePath);
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
${urls.map((u: SitemapUrl) => `  <url>
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
  logger.info(`✓ Generated sitemap.xml with ${urls.length} URLs`);
}

run().catch((err: unknown) => {
  logger.error('Sitemap generation failed:', err);
  process.exit(1);
});
