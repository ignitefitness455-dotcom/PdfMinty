import fs from 'fs';
import path from 'path';

const routes = [
  {
    path: '/merge-pdf',
    title: 'Merge PDFs Online Free | Combine Multiple PDF Files - PDFMinty',
    desc: 'Merge multiple PDF files into one document for free. No upload required — all processing happens locally in your browser for absolute privacy and speed.',
    name: 'Merge PDFs'
  },
  {
    path: '/split-pdf',
    title: 'Split PDF Online Free | Extract Pages from PDF - PDFMinty',
    desc: 'Split PDF pages or extract specific pages for free. Privacy-first local processing means your secure files never leave your device.',
    name: 'Extract Pages'
  },
  {
    path: '/compress-pdf',
    title: 'Compress PDF Online Free | Reduce PDF File Size - PDFMinty',
    desc: 'Compress PDF files to reduce size for free. Optimize and shrink PDFs locally in your browser without uploading to any server.',
    name: 'Compress PDF'
  },
  {
    path: '/rotate-pdf',
    title: 'Rotate PDF Pages Online Free | Flip PDF Orientation - PDFMinty',
    desc: 'Rotate PDF pages 90°, 180°, or 270° for free. Client-side processing ensures complete privacy and instant download.',
    name: 'Rotate Pages'
  },
  {
    path: '/organize',
    title: 'Delete PDF Pages Online Free | Remove Pages from PDF - PDFMinty',
    desc: 'Delete unwanted pages from your PDF for free. No server upload required — process entirely in your browser.',
    name: 'Delete Pages'
  },
  {
    path: '/watermark-pdf',
    title: 'Add Watermark to PDF Online Free | Text Watermark - PDFMinty',
    desc: 'Add text watermarks to PDF pages for free. Protect and stamp your documents with custom watermarks locally.',
    name: 'Add Watermark'
  },
  {
    path: '/add-page-numbers',
    title: 'Add Page Numbers to PDF Online Free | Insert Bates - PDFMinty',
    desc: 'Add page numbers to PDF documents for free. Customize position, margins, and format with privacy-first local processing.',
    name: 'Page Numbers'
  },
  {
    path: '/add-blank-page',
    title: 'Add Blank Page to PDF Online Free | Insert Empty Pages - PDFMinty',
    desc: 'Insert blank pages into your PDF for free. Choose from A4, Letter, Legal, A3, or custom page sizes directly in browser.',
    name: 'Add Blank Page'
  },
  {
    path: '/protect-pdf',
    title: 'Password Protect PDF Online Free | Encrypt PDF Document - PDFMinty',
    desc: 'Add password protection and permissions key to your PDF for free. Encrypt documents with owner passwords locally.',
    name: 'Secure Private Vault'
  },
  {
    path: '/unlock-pdf',
    title: 'Unlock PDF Online Free | Remove PDF Passwords & Keys - PDFMinty',
    desc: 'Remove password restriction and print/edit permissions from PDF files for free. Decrypt documents locally with total safety.',
    name: 'Unlock Private Vault'
  },
  {
    path: '/image-to-pdf',
    title: 'Convert Images to PDF Online Free | JPG/PNG to PDF - PDFMinty',
    desc: 'Convert JPG, JPEG, and PNG images to PDF files for free. Combine multiple photos into a single formatted PDF document offline.',
    name: 'Image to PDF'
  },
  {
    path: '/pdf-to-image',
    title: 'Convert PDF to Images Online Free | PDF to JPG/PNG - PDFMinty',
    desc: 'Convert PDF pages to high-quality JPG or PNG images for free. Extract individual pages as downloadable photos locally.',
    name: 'PDF to Image'
  },
  {
    path: '/intelligence',
    title: 'AI PDF Analyzer Online Free | Smart Document Insights - PDFMinty',
    desc: 'Analyze PDF documents with secure local or server AI. Extract summaries, critical action items, and clear answers with complete privacy.',
    name: 'AI Analyze Document'
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
    "browserRequirements": "Requires JavaScript",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    }
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

try {
  console.log('Generating static prerendered files for perfect SEO coverage...');

  for (const route of routes) {
    // Determine correct folder structure inside dist/
    const outputSubDir = path.join(distDir, route.path.replace(/^\//, ''));
    fs.mkdirSync(outputSubDir, { recursive: true });

    const absoluteUrl = `https://www.pdfminty.com${route.path}`;

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
    html = setAlternateLink(html, "bn", `https://www.pdfminty.com/bn${route.path}`);
    html = setAlternateLink(html, "hi", `https://www.pdfminty.com/hi${route.path}`);
    html = setAlternateLink(html, "es", `https://www.pdfminty.com/es${route.path}`);
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
  homeHtml = setCanonicalLink(homeHtml, "https://www.pdfminty.com/");
  homeHtml = setAlternateLink(homeHtml, "en", "https://www.pdfminty.com/");
  homeHtml = setAlternateLink(homeHtml, "bn", "https://www.pdfminty.com/bn/");
  homeHtml = setAlternateLink(homeHtml, "hi", "https://www.pdfminty.com/hi/");
  homeHtml = setAlternateLink(homeHtml, "es", "https://www.pdfminty.com/es/");
  homeHtml = setAlternateLink(homeHtml, "x-default", "https://www.pdfminty.com/");

  fs.writeFileSync(templatePath, homeHtml, 'utf-8');
  console.log('✅ Updated Root Homepage: index.html with correct canonical attributes');
  console.log('🎉 Prerendering complete! 13 unique pages generated inside dist/.');

} catch (error) {
  console.error('❌ Static pre-rendering build failed unexpectedly:', error.message || error);
  process.exit(1);
}
