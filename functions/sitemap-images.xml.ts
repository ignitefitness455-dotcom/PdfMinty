import { TOOLS } from '../src/config/seo-data';

export const onRequest: PagesFunction = async () => {
  const SITE_URL = 'https://pdfminty.com';

  const imageEntries = [
    { url: `${SITE_URL}/og-image.png`, title: 'PDFMinty — Free Privacy-First PDF Toolkit', caption: 'Default social share image' },
    { url: `${SITE_URL}/logo-512.png`, title: 'PDFMinty Logo', caption: 'Brand logo' },
    { url: `${SITE_URL}/screenshot-desktop.png`, title: 'PDFMinty Desktop Screenshot', caption: 'Desktop dashboard view' },
    { url: `${SITE_URL}/screenshot-mobile.png`, title: 'PDFMinty Mobile Screenshot', caption: 'Mobile tool list' },
    ...TOOLS.map(tool => ({
      url: tool.ogImage ? `${SITE_URL}${tool.ogImage}` : `${SITE_URL}/og-image.png`,
      title: `PDFMinty — ${tool.name}`,
      caption: tool.shortDescription || `${tool.name} tool`
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries.map(img => `  <url>
    <loc>${SITE_URL}/</loc>
    <image:image>
      <image:loc>${img.url}</image:loc>
      <image:title>${img.title}</image:title>
      <image:caption>${img.caption}</image:caption>
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
