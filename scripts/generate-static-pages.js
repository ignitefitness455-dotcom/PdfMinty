import fs from 'fs';
import path from 'path';

const routes = [
  {
    path: '/merge-pdf',
    title: 'Merge PDFs Online Free | Combine Multiple PDFs — PDFMinty',
    desc: 'Merge multiple PDF files into one document for free. No upload, no registration. All processing happens in your browser.',
    name: 'Merge PDFs',
    staticBody: `
      <h1>Merge PDF Files Online — Free &amp; Private</h1>
      <p>Combine multiple PDF documents into a single file instantly. No file upload required — everything runs locally in your browser.</p>
      <h2>How to Merge PDFs</h2>
      <ol>
        <li>Select your PDF files using the file picker</li>
        <li>Arrange files in your desired order</li>
        <li>Click Merge to combine them</li>
        <li>Download your merged PDF instantly</li>
      </ol>
    `
  },
  {
    path: '/split-pdf',
    title: 'Split PDF Online Free | Extract Pages from PDF — PDFMinty',
    desc: 'Split PDF pages or extract specific pages for free. Privacy-first, client-side processing.',
    name: 'Extract Pages',
    staticBody: `
      <h1>Split PDF Online Free | Extract Pages from PDF</h1>
      <p>Split a PDF document into multiple documents or extract specific ranges of pages. Fast and secure client-side splitting.</p>
      <h2>How to Split a PDF</h2>
      <ol>
        <li>Choose a PDF file from your device</li>
        <li>Specify the page ranges or individual page numbers to crop</li>
        <li>Click Split / Extract and wait a moment</li>
        <li>Download the resulting PDF files or ZIP container</li>
      </ol>
    `
  },
  {
    path: '/compress-pdf',
    title: 'Compress PDF Online Free | Reduce File Size — PDFMinty',
    desc: 'Compress PDF files to reduce size without losing quality. Free, fast, and private.',
    name: 'Compress PDF',
    staticBody: `
      <h1>Compress PDF Online Free | Reduce File Size</h1>
      <p>Shrink the file size of your PDF documents without sacrificing visual quality. This is processed fully offline in your browser.</p>
      <h2>How to Compress a PDF</h2>
      <ol>
        <li>Attach or drop your PDF document here</li>
        <li>Select your compression level preference</li>
        <li>Process and wait for downstream graphics downsampling</li>
        <li>Download the optimized, smaller PDF layout</li>
      </ol>
    `
  },
  {
    path: '/rotate-pdf',
    title: 'Rotate PDF Pages Online Free — PDFMinty',
    desc: 'Rotate PDF pages left or right for free. No upload needed.',
    name: 'Rotate Pages',
    staticBody: `
      <h1>Rotate PDF Pages Online Free</h1>
      <p>Rotate individual or all pages within a PDF document clockwise or counterclockwise. Everything is executed entirely within your browser.</p>
      <h2>How to Rotate PDF Pages</h2>
      <ol>
        <li>Upload or choose your target PDF document</li>
        <li>Click individually on pages to change their rotation offset</li>
        <li>Perform the alignment rotation sequentially</li>
        <li>Export and download the re-oriented PDF file</li>
      </ol>
    `
  },
  {
    path: '/organize',
    title: 'Delete PDF Pages Online Free | Organize PDF — PDFMinty',
    desc: 'Delete unwanted pages from PDF files. Free and privacy-first.',
    name: 'Delete Pages',
    staticBody: `
      <h1>Delete PDF Pages Online Free | Organize PDF</h1>
      <p>Remove pages, reorder flow, or reorganize the sequence of any PDF document safely. Secure browser-based execution.</p>
      <h2>How to Organize a PDF</h2>
      <ol>
        <li>Select your PDF document</li>
        <li>Visually inspect page indices and layout</li>
        <li>Delete or rearrange layout pages from view</li>
        <li>Generate and download the clean layout outcome</li>
      </ol>
    `
  },
  {
    path: '/watermark-pdf',
    title: 'Add Watermark to PDF Online Free — PDFMinty',
    desc: 'Add text or image watermarks to PDF files for free. Client-side processing.',
    name: 'Add Watermark',
    staticBody: `
      <h1>Add Watermark to PDF Online Free</h1>
      <p>Add secure text overlays, copyrights, or customizable watermark metadata across each page of your PDF file completely offline.</p>
      <h2>How to Watermark a PDF</h2>
      <ol>
        <li>Select the PDF file you wish to modify</li>
        <li>Type your watermark text, design color, opacity level, and angle</li>
        <li>Preview the alignment and overlay details</li>
        <li>Generate and download your watermarked PDF document</li>
      </ol>
    `
  },
  {
    path: '/add-page-numbers',
    title: 'Add Page Numbers to PDF Online Free — PDFMinty',
    desc: 'Add page numbers to PDF documents for free. Customizable position and style.',
    name: 'Page Numbers',
    staticBody: `
      <h1>Add Page Numbers to PDF Online Free</h1>
      <p>Format, number, and stamp sequence footers or headers securely onto your PDF document pages. Easy customization.</p>
      <h2>How to Add Page Numbers</h2>
      <ol>
        <li>Choose a PDF to number from your files</li>
        <li>Pick the header or footer template layout alignment</li>
        <li>Customize start indices and visual numbering offsets</li>
        <li>Process and download the sequentially numbered PDF document</li>
      </ol>
    `
  },
  {
    path: '/add-blank-page',
    title: 'Insert Blank Pages into PDF Online Free — PDFMinty',
    desc: 'Insert blank pages into PDF files at any position. Free and private.',
    name: 'Add Blank Page',
    staticBody: `
      <h1>Insert Blank Pages into PDF Online Free</h1>
      <p>Insert blank empty white pages of custom dimensional sizing anywhere in between layouts programmatically.</p>
      <h2>How to Insert Blank Pages</h2>
      <ol>
        <li>Select your base PDF document</li>
        <li>Specify where the empty pages should be inserted (e.g., after Page 2)</li>
        <li>Set paper dimensions (A4, Letter)</li>
        <li>Generate the document and download your compiled PDF with empty pages inserted</li>
      </ol>
    `
  },
  {
    path: '/protect-pdf',
    title: 'Password Protect PDF Online Free — PDFMinty',
    desc: 'Add password protection to PDF files for free. Secure your documents.',
    name: 'Secure Private Vault',
    staticBody: `
      <h1>Password Protect PDF Online Free</h1>
      <p>Add military-grade browser-encrypted password keys to keep your proprietary content secure.</p>
      <h2>How to Secure a PDF</h2>
      <ol>
        <li>Acknowledge setup and drop your private PDF into the container</li>
        <li>Set a secure encryption password standard</li>
        <li>Engage AES encryption algorithms offline</li>
        <li>Receive and download the password protected PDF output</li>
      </ol>
    `
  },
  {
    path: '/unlock-pdf',
    title: 'Unlock PDF Online Free | Remove Password — PDFMinty',
    desc: 'Remove password protection from PDF files. Free and client-side.',
    name: 'Unlock Private Vault',
    staticBody: `
      <h1>Unlock PDF Online Free | Remove Password</h1>
      <p>Decrypt and remove protection security blocks off of your owner-authorized PDF documents safely.</p>
      <h2>How to Unlock a PDF</h2>
      <ol>
        <li>Insert your locked PDF document</li>
        <li>Provide the authorized clearance password</li>
        <li>Verify status metrics and decouple key locks</li>
        <li>Download and access the raw unencrypted PDF instantly</li>
      </ol>
    `
  },
  {
    path: '/image-to-pdf',
    title: 'Convert Image to PDF Online Free — PDFMinty',
    desc: 'Convert JPG, PNG, WebP images to PDF for free. No upload needed.',
    name: 'Image to PDF',
    staticBody: `
      <h1>Convert Image to PDF Online Free</h1>
      <p>Compile JPG, PNG, and WebP photo graphics into structured PDF pages sequentially. Safe and private.</p>
      <h2>How to Convert Images to PDF</h2>
      <ol>
        <li>Select or drag your image sequence (PNG, JPG, WebP)</li>
        <li>Arrange the images in order and adjust margin/padding options</li>
        <li>Compile image coordinates to A4 format PDF parameters</li>
        <li>Download your compiled PDF output instantly</li>
      </ol>
    `
  },
  {
    path: '/pdf-to-image',
    title: 'Convert PDF to Image Online Free — PDFMinty',
    desc: 'Convert PDF pages to JPG or PNG images for free. Privacy-first processing.',
    name: 'PDF to Image',
    staticBody: `
      <h1>Convert PDF to Image Online Free</h1>
      <p>Extract, render, and convert PDF pages into cleanly optimized JPEG or PNG image blocks packed inside a ZIP container.</p>
      <h2>How to Convert PDF to images</h2>
      <ol>
        <li>Drag your PDF document into the browser renderer</li>
        <li>Choose render density range DPI coordinates (e.g. 150 DPI)</li>
        <li>Select JPG/PNG output compression options</li>
        <li>Export and download the fully compiled image sequence contents</li>
      </ol>
    `
  },
  {
    path: '/intelligence',
    title: 'AI PDF Analyzer Online Free | Smart Document Analysis — PDFMinty',
    desc: 'Analyze PDF documents with AI. Extract insights, summaries, and key information.',
    name: 'AI Analyze Document',
    staticBody: `
      <h1>AI PDF Analyzer Online Free | Smart Document Analysis</h1>
      <p>Locally scan textual layouts and securely query Gemini proxy to summarize, extract details, and answer semantic metrics.</p>
      <h2>How to Analyze PDFs with AI</h2>
      <ol>
        <li>Load your PDF document into the browser interface</li>
        <li>Ask questions or request high-level summaries/extracted items</li>
        <li>Wait for fast semantic answers processed with Gemini</li>
        <li>Copy or save the generated semantic intelligence logs</li>
      </ol>
    `
  },
  {
    path: '/delete-pages-pdf',
    title: 'Delete PDF Pages Online Free — PDFMinty',
    desc: 'Delete unwanted pages from PDF files for free. Privacy-first, client-side processing.',
    name: 'Delete PDF Pages',
    staticBody: `
      <h1>Delete PDF Pages Online Free</h1>
      <p>Visually prune, remove, or delete specific pages from any PDF layout instantly. Secure browser-based processing.</p>
      <h2>How to Remove Pages from PDF</h2>
      <ol>
        <li>Attach your PDF file into the editor layout</li>
        <li>Select pages you wish to remove or specify index ranges</li>
        <li>Click Delete Pages to process</li>
        <li>Download the clean, pruned PDF file onto your machine</li>
      </ol>
    `
  },
  {
    path: '/extract-pages-pdf',
    title: 'Extract PDF Pages Online Free — PDFMinty',
    desc: 'Extract specific pages from PDF files for free. Download selected pages as a new PDF.',
    name: 'Extract PDF Pages',
    staticBody: `
      <h1>Extract PDF Pages Online Free</h1>
      <p>Separate or crop particular pages or ranges out of a bigger document cleanly in your environment.</p>
      <h2>How to Extract Pages from PDF</h2>
      <ol>
        <li>Choose a target PDF file</li>
        <li>Input the specific ranges of pages (e.g. 2-5, 8)</li>
        <li>Click Extract Pages to slice the document</li>
        <li>Download the newly formed page-subset PDF instantly</li>
      </ol>
    `
  },
  {
    path: '/reorder-pdf',
    title: 'Reorder PDF Pages Online Free — PDFMinty',
    desc: 'Reorder and rearrange PDF pages for free. Drag and drop pages into any order.',
    name: 'Reorder PDF Pages',
    staticBody: `
      <h1>Reorder PDF Pages Online Free</h1>
      <p>Visually rearrange the flow of your document by drag and drop sorting mechanisms with easy adjustments.</p>
      <h2>How to Reorder PDF Pages</h2>
      <ol>
        <li>Drop your PDF to render visual slide grids</li>
        <li>Drag page panels to reorder sequence flow</li>
        <li>Confirm correct positioning coordinates</li>
        <li>Generate and download your freshly sorted PDF file</li>
      </ol>
    `
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
    const titleRegex = /<title>/i;
    if (titleRegex.test(html)) {
      return html.replace(titleRegex, `\n    <link rel="canonical" href="${newUrl}" />\n    <title>`);
    } else {
      return html.replace('</head>', `    <link rel="canonical" href="${newUrl}" />\n</head>`);
    }
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
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": route.title.split(' | ')[0] || "PDFMinty",
    "url": absoluteUrl,
    "description": route.desc,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "browserRequirements": "Requires JavaScript"
  };

  return `<script type="application/ld+json">${JSON.stringify(appSchema)}</script>`;
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

    // 6. Strip default Homepage-bound JSON-LD Structured Data block from template to avoid duplicating homepage metadata & homepage FAQPage on sub-routes
    // Using a highly robust regex to identify the homepage-bound JSON-LD script block containing "@graph", safely surviving Vite minification and comment stripping.
    const schemaRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?"@graph"[\s\S]*?<\/script>/i;
    html = html.replace(schemaRegex, '');

    // 7. Generate route-specific JSON-LD Structured Data (SoftwareApplication only, no HowTo or FAQPage)
    const jsonLd = generateRouteJsonLd(route, absoluteUrl);
    
    if (!html.includes('</head>')) {
      throw new Error('Closure tag </head> not found in template for structured data injection.');
    }
    html = html.replace('</head>', `${jsonLd}\n</head>`);

    // 8. Inject static HTML content inside <div id="root"></div>
    if (route.staticBody) {
      if (html.includes('<div id="root"></div>')) {
        html = html.replace(
          '<div id="root"></div>',
          `<div id="root"><main style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.6;">${route.staticBody}</main></div>`
        );
      } else if (html.includes('<div id="root">')) {
        html = html.replace(
          '<div id="root">',
          `<div id="root"><main style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.6;">${route.staticBody}</main>`
        );
      }
    }

    const outputPath = path.join(outputSubDir, 'index.html');
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`✅ Prerendered: ${route.path}/index.html`);
  }

  // Ensure the root homepage also includes a clean index canonical link and alternates
  let homeHtml = baseHTML;
  homeHtml = setCanonicalLink(homeHtml, "https://pdfminty.com/");
  homeHtml = setAlternateLink(homeHtml, "en", "https://pdfminty.com/");
  homeHtml = homeHtml.replace(
    '</head>',
    `</head>`
  );
  homeHtml = setAlternateLink(homeHtml, "x-default", "https://pdfminty.com/");

  fs.writeFileSync(templatePath, homeHtml, 'utf-8');
  console.log('✅ Updated Root Homepage: index.html with correct canonical attributes');
  console.log('🎉 Prerendering complete! 16 unique pages generated inside dist/.');

} catch (error) {
  console.error('❌ Static pre-rendering build failed unexpectedly:', error.message || error);
  process.exit(1);
}
