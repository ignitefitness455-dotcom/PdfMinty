import { TOOLS } from '../src/config/seo-data';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const onRequest: PagesFunction = async () => {
  const SITE_URL = 'https://pdfminty.com';

  const staticImageEntries = [
    { pageLoc: SITE_URL, url: `${SITE_URL}/og-image.png`, title: 'PdfMinty — Free Privacy-First PDF Toolkit', caption: 'Default social share image' },
    { pageLoc: SITE_URL, url: `${SITE_URL}/logo-512.png`, title: 'PdfMinty Logo', caption: 'Brand logo' },
    { pageLoc: SITE_URL, url: `${SITE_URL}/screenshot-desktop.png`, title: 'PdfMinty Desktop Screenshot', caption: 'Desktop dashboard view' },
    { pageLoc: SITE_URL, url: `${SITE_URL}/screenshot-mobile.png`, title: 'PdfMinty Mobile Screenshot', caption: 'Mobile tool list' },
  ];

  const toolImageEntries = TOOLS.map(tool => {
    const rawSlug = tool.slug.startsWith('/') ? tool.slug : `/${tool.slug}`;
    return {
      pageLoc: `${SITE_URL}${rawSlug}`,
      url: tool.ogImage ? `${SITE_URL}${tool.ogImage}` : `${SITE_URL}/og-image.png`,
      title: `PdfMinty — ${tool.name}`,
      caption: tool.shortDescription || `${tool.name} tool`
    };
  });

  const imageEntries = [...staticImageEntries, ...toolImageEntries];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries.map(img => `  <url>
    <loc>${escapeXml(img.pageLoc)}</loc>
    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      <image:caption>${escapeXml(img.caption)}</image:caption>
    </image:image>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};

