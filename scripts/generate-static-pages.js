import fs from 'fs';
import path from 'path';

const routes = [
  {
    path: '/merge-pdf',
    title: 'Merge PDFs Online Free | Combine Multiple PDFs — PDFMinty',
    desc: 'Merge multiple PDF files into one document for free. No upload, no registration. All processing happens in your browser.',
    name: 'Merge PDFs'
  },
  {
    path: '/split-pdf',
    title: 'Split PDF Online Free | Extract Pages from PDF — PDFMinty',
    desc: 'Split PDF pages or extract specific pages for free. Privacy-first, client-side processing.',
    name: 'Extract Pages'
  },
  {
    path: '/compress-pdf',
    title: 'Compress PDF Online Free | Reduce File Size — PDFMinty',
    desc: 'Compress PDF files to reduce size without losing quality. Free, fast, and private.',
    name: 'Compress PDF'
  },
  {
    path: '/rotate-pdf',
    title: 'Rotate PDF Pages Online Free — PDFMinty',
    desc: 'Rotate PDF pages left or right for free. No upload needed.',
    name: 'Rotate Pages'
  },
  {
    path: '/organize',
    title: 'Delete PDF Pages Online Free | Organize PDF — PDFMinty',
    desc: 'Delete unwanted pages from PDF files. Free and privacy-first.',
    name: 'Delete Pages'
  },
  {
    path: '/watermark-pdf',
    title: 'Add Watermark to PDF Online Free — PDFMinty',
    desc: 'Add text or image watermarks to PDF files for free. Client-side processing.',
    name: 'Add Watermark'
  },
  {
    path: '/add-page-numbers',
    title: 'Add Page Numbers to PDF Online Free — PDFMinty',
    desc: 'Add page numbers to PDF documents for free. Customizable position and style.',
    name: 'Page Numbers'
  },
  {
    path: '/add-blank-page',
    title: 'Insert Blank Pages into PDF Online Free — PDFMinty',
    desc: 'Insert blank pages into PDF files at any position. Free and private.',
    name: 'Add Blank Page'
  },
  {
    path: '/protect-pdf',
    title: 'Password Protect PDF Online Free — PDFMinty',
    desc: 'Add password protection to PDF files for free. Secure your documents.',
    name: 'Secure Private Vault'
  },
  {
    path: '/unlock-pdf',
    title: 'Unlock PDF Online Free | Remove Password — PDFMinty',
    desc: 'Remove password protection from PDF files. Free and client-side.',
    name: 'Unlock Private Vault'
  },
  {
    path: '/image-to-pdf',
    title: 'Convert Image to PDF Online Free — PDFMinty',
    desc: 'Convert JPG, PNG, WebP images to PDF for free. No upload needed.',
    name: 'Image to PDF'
  },
  {
    path: '/pdf-to-image',
    title: 'Convert PDF to Image Online Free — PDFMinty',
    desc: 'Convert PDF pages to JPG or PNG images for free. Privacy-first processing.',
    name: 'PDF to Image'
  },
  {
    path: '/intelligence',
    title: 'AI PDF Analyzer Online Free | Smart Document Analysis — PDFMinty',
    desc: 'Analyze PDF documents with AI. Extract insights, summaries, and key information.',
    name: 'AI Analyze Document'
  },
  {
    path: '/delete-pages-pdf',
    title: 'Delete PDF Pages Online Free — PDFMinty',
    desc: 'Delete unwanted pages from PDF files for free. Privacy-first, client-side processing.',
    name: 'Delete PDF Pages'
  },
  {
    path: '/extract-pages-pdf',
    title: 'Extract PDF Pages Online Free — PDFMinty',
    desc: 'Extract specific pages from PDF files for free. Download selected pages as a new PDF.',
    name: 'Extract PDF Pages'
  },
  {
    path: '/reorder-pdf',
    title: 'Reorder PDF Pages Online Free — PDFMinty',
    desc: 'Reorder and rearrange PDF pages for free. Drag and drop pages into any order.',
    name: 'Reorder PDF Pages'
  }
];

const distDir = path.join(process.cwd(), 'dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error(`Error: Compiled template "${templatePath}" not found. Please build first.`);
  process.exit(1);
}

const baseHTML = fs.readFileSync(templatePath, 'utf-8');

// Robust helper functions for HTML injection
function setMetaTag(html, nameOrProperty, newContent) {
  const matchRegex = new RegExp(`<meta\\s+[^>]*?(?:name|property)=["']${nameOrProperty}["'][^>]*?>`, 'i');
  if (!matchRegex.test(html)) {
    throw new Error(`Meta tag with identifier "${nameOrProperty}" not found in template.`);
  }
  return html.replace(matchRegex, (match) => {
    const contentRegex = /content=["']([^"']*)["']/i;
    if (!contentRegex.test(match)) {
      throw new Error(`Meta tag with identifier "${nameOrProperty}" is missing the content attribute.`);
    }
    return match.replace(contentRegex, `content="${newContent}"`);
  });
}

function setCanonicalLink(html, newUrl) {
  const matchRegex = /<link\s+[^>]*?rel=["']canonical["'][^>]*?>/i;
  if (!matchRegex.test(html)) {
    throw new Error(`Canonical link tag not found in template.`);
  }
  return html.replace(matchRegex, (match) => {
    const hrefRegex = /href=["']([^"']*)["']/i;
    if (!hrefRegex.test(match)) {
      throw new Error(`Canonical link tag is missing the href attribute.`);
    }
    return match.replace(hrefRegex, `href="${newUrl}"`);
  });
}

function setAlternateLink(html, hreflang, newUrl) {
  const matchRegex = new RegExp(`<link\\s+[^>]*?rel=["']alternate["'][^>]*?hreflang=["']${hreflang}["'][^>]*?>|<link\\s+[^>]*?hreflang=["']${hreflang}["'][^>]*?rel=["']alternate["'][^>]*?>`, 'i');
  if (!matchRegex.test(html)) {
    throw new Error(`Alternate link tag for hreflang="${hreflang}" not found in template.`);
  }
  return html.replace(matchRegex, (match) => {
    const hrefRegex = /href=["']([^"']*)["']/i;
    if (!hrefRegex.test(match)) {
      throw new Error(`Alternate link tag for hreflang="${hreflang}" is missing the href attribute.`);
    }
    return match.replace(hrefRegex, `href="${newUrl}"`);
  });
}

function setTitle(html, newTitle) {
  const matchRegex = /<title>.*?<\/title>/i;
  if (!matchRegex.test(html)) {
    throw new Error(`Title tag not found in template.`);
  }
  return html.replace(matchRegex, `<title>${newTitle}</title>`);
}

function generateRouteJsonLd(route, absoluteUrl) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": route.title.split(' | ')[0],
    "description": route.desc,
    "url": absoluteUrl,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "browserRequirements": "Requires JavaScript"
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

try {
  console.log('Generating static prerendered files for perfect SEO coverage...');

  for (const route of routes) {
    // Determine correct folder structure inside dist/
    const outputSubDir = path.join(distDir, route.path.replace(/^\//, ''));
    fs.mkdirSync(outputSubDir, { recursive: true });

    const absoluteUrl = `https://pdfminty.com${route.path}`;

    let html = baseHTML;

    // 1. replace <title>
    html = setTitle(html, route.title);

    // 2. replace <meta name="description" ... />
    html = setMetaTag(html, "description", route.desc);

    // 3. Open Graph titles & descriptions
    html = setMetaTag(html, "og:title", route.title);
    html = setMetaTag(html, "og:description", route.desc);
    html = setMetaTag(html, "og:url", absoluteUrl);

    // 4. Twitter tags
    html = setMetaTag(html, "twitter:title", route.title);
    html = setMetaTag(html, "twitter:description", route.desc);

    // 5. Canonical link and alternates
    html = setCanonicalLink(html, absoluteUrl);
    html = setAlternateLink(html, "en", absoluteUrl);
    html = setAlternateLink(html, "x-default", absoluteUrl);

    // 6. Generate JSON-LD Structured Data specifically for this utility route
    const jsonLd = generateRouteJsonLd(route, absoluteUrl);
    
    if (!html.includes('</head>')) {
      throw new Error('Closure tag </head> not found in template for structured data injection.');
    }
    html = html.replace('</head>', `${jsonLd}\n</head>`);

    const outputPath = path.join(outputSubDir, 'index.html');
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`✅ Prerendered: ${route.path}/index.html`);
  }

  // Ensure the root homepage also includes a clean index canonical link and alternates
  let homeHtml = baseHTML;
  homeHtml = setCanonicalLink(homeHtml, "https://pdfminty.com/");
  homeHtml = setAlternateLink(homeHtml, "en", "https://pdfminty.com/");
  homeHtml = setAlternateLink(homeHtml, "x-default", "https://pdfminty.com/");

  fs.writeFileSync(templatePath, homeHtml, 'utf-8');
  console.log('✅ Updated Root Homepage: index.html with correct canonical attributes');
  console.log('🎉 Prerendering complete! 16 unique pages generated inside dist/.');

} catch (error) {
  console.error('❌ Static pre-rendering build failed unexpectedly:', error.message || error);
  process.exit(1);
}
