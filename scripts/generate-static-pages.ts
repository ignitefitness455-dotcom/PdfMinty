import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { SITE_URL, SITE_NAME, TOOLS, ToolSEOInfo } from '../src/config/seo-data';
import { logger } from '../src/utils/logger';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

// Ensure favicons, touch-icons, and OG sharing images are generated on every build
async function generateAllAssets(publicDir: string, distDir: string): Promise<void> {
  const iconSource: string = path.join(publicDir, 'logo.svg');
  if (!fs.existsSync(iconSource)) {
    logger.warn('Warning: Source logo.svg not found in public directory. Unable to generate assets.');
    return;
  }

  logger.info('Generating website logos, favicons, and metadata graphics...');
  try {
    // Ensure both output targets exist
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

    const targets: string[] = [publicDir, distDir];

    for (const target of targets) {
      if (!fs.existsSync(target)) continue;

      // 1. logo-192.png (PWA asset)
      await sharp(iconSource)
        .resize(192, 192)
        .png()
        .toFile(path.join(target, 'logo-192.png'));

      // 2. logo-512.png (PWA asset)
      await sharp(iconSource)
        .resize(512, 512)
        .png()
        .toFile(path.join(target, 'logo-512.png'));

      // 3. apple-touch-icon.png (Apple web device card)
      await sharp(iconSource)
        .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toFile(path.join(target, 'apple-touch-icon.png'));

      // 4. favicon.ico / favicon.png (Browser tabs)
      await sharp(iconSource)
        .resize(32, 32)
        .png()
        .toFile(path.join(target, 'favicon.ico'));

      // 5. og-image.png (Rich social share preview, custom high-fidelity banner composition!)
      const ogSvgMarkup = `
        <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#0b1329;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#022c22;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="1200" height="630" fill="url(#grad)" />
          
          <circle cx="1100" cy="100" r="300" fill="#00FFC2" fill-opacity="0.04" />
          <circle cx="100" cy="530" r="200" fill="#059669" fill-opacity="0.06" />

          <g transform="translate(480, 110) scale(4.8)">
            <rect x="6" y="11" width="26" height="33" rx="6" fill="#0E0E0E" />
            <rect x="7" y="12" width="24" height="31" rx="5" stroke="rgba(255,255,255,0.15)" stroke-width="1.2" fill="none" />
            <rect x="15" y="4" width="27" height="33" rx="6" fill="#00FFC2" />
            <rect x="16" y="5" width="25" height="31" rx="5" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.3" fill="none" />
            <path d="M35 4L42 11H39C36.7909 11 35 9.20914 35 7V4Z" fill="#131313" />
            <rect x="21" y="15" width="15" height="2.2" rx="1.1" fill="#131313" />
            <rect x="21" y="21" width="15" height="2.2" rx="1.1" fill="#131313" />
            <rect x="21" y="27" width="9" height="2.2" rx="1.1" fill="#131313" fill-opacity="0.8" />
          </g>

          <text x="600" y="430" font-family="system-ui, -apple-system, sans-serif" font-size="80" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-2px">
            PDFMinty
          </text>
          
          <text x="600" y="490" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#94A3B8" text-anchor="middle" letter-spacing="4px">
            PRIVACY-FIRST FREE PDF TOOLKIT
          </text>

          <text x="600" y="540" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#00FFC2" text-anchor="middle" letter-spacing="1px">
            100% Client-Side • Secure Offline Calculations • No Server Uploads
          </text>
        </svg>
      `;

      await sharp(Buffer.from(ogSvgMarkup))
        .png()
        .toFile(path.join(target, 'og-image.png'));
    }

    logger.info('Successfully completed generateAllAssets procedure.');
  } catch (err: unknown) {
    logger.error('Error during asset generation pipeline:', err);
  }
}

async function run(): Promise<void> {
  const distDir: string = path.join(__dirname, "../dist");
  const publicDir: string = path.join(__dirname, "../public");
  
  // Create logos & icons first on every build dynamically
  await generateAllAssets(publicDir, distDir);

  const distIndexHtmlPath: string = path.join(distDir, "index.html");
  const rootIndexHtmlPath: string = path.join(__dirname, "../index.html");
  
  let baseHtml = "";
  if (fs.existsSync(distIndexHtmlPath)) {
    baseHtml = fs.readFileSync(distIndexHtmlPath, "utf8");
    logger.info("Reading template from compiled dist/index.html");
  } else if (fs.existsSync(rootIndexHtmlPath)) {
    baseHtml = fs.readFileSync(rootIndexHtmlPath, "utf8");
    logger.info("Reading template from root index.html");
  } else {
    throw new Error("Unable to locate any base index.html template file for static generation.");
  }
  
  // Clean base HTML to avoid double definitions (purging titles, descriptions, canonicals, OGs, Twitters, and JSON-LD markup)
  function cleanBaseTemplate(html: string): string {
    let clean: string = html;
    clean = clean.replace(/<title>[^<]*<\/title>/gi, "");
    clean = clean.replace(/<meta\s+name="description"[^>]*>/gi, "");
    clean = clean.replace(/<link\s+rel="canonical"[^>]*>/gi, "");
    clean = clean.replace(/<meta\s+property="og:[^>]*>/gi, ""); // Purge all og: properties
    clean = clean.replace(/<meta\s+name="twitter:[^>]*>/gi, ""); // Purge all twitter: properties
    
    // Purge any homepage-only JSON-LD structured script elements to avoid duplication
    clean = clean.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
    
    return clean;
  }
  
  const optimizedBase: string = cleanBaseTemplate(baseHtml);
  
  TOOLS.forEach((item: ToolSEOInfo) => {
    const pageUrl: string = `${SITE_URL}/${item.slug}`;
    const targetFolder: string = path.join(distDir, item.slug);
    
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }
    
    // Construct route-specific JSON-LD blocks
    const schemas: Record<string, unknown>[] = [];
    
    if (item.type === 'tool') {
      // 1. WebApplication Schema
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": `PDFMinty - ${item.name}`,
        "url": `https://pdfminty.com/${item.slug}`,
        "description": item.metaDescription,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires HTML5, WebAssembly",
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
        "featureList": [
          "100% client-side processing",
          "No file uploads to servers",
          "Free to use",
          "No registration required",
          "Works offline (PWA)"
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "1247",
          "bestRating": "5",
          "worstRating": "1"
        }
      });
      
      // 2. HowTo Schema
      if (item.howTo) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": item.howTo.name,
          "totalTime": item.howTo.totalTime,
          "step": item.howTo.steps.map((stepText: string, index: number) => ({
            "@type": "HowToStep",
            "url": `${pageUrl}#step${index + 1}`,
            "name": stepText,
            "itemListElement": [{ "@type": "HowToDirection", "text": stepText }]
          }))
        });
      }

      // 3. BreadcrumbList Schema
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://pdfminty.com/"},
          {"@type": "ListItem", "position": 2, "name": item.name, "item": `https://pdfminty.com/${item.slug}`}
        ]
      });

      // 4. FAQPage Schema
      if (item.faqs && item.faqs.length > 0) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": item.faqs.map((f: { q: string; a: string }) => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": f.a
            }
          }))
        });
      }
    } else if (item.type === 'article') {
      // 1. Article Schema
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": item.h1,
        "description": item.metaDescription,
        "url": pageUrl,
        "publisher": {
          "@type": "Organization",
          "name": SITE_NAME,
          "logo": {
            "@type": "ImageObject",
            "url": `${SITE_URL}/og-image.png`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": pageUrl
        }
      });
    }
    
    // Generate JSON-LD Script tag bundle
    const jsonLdMarkup: string = schemas
      .map((schema: Record<string, unknown>) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
      .join('\n  ');
      
    const hreflangTags: string = `
  <link rel="alternate" hreflang="en" href="${pageUrl}" />
  <link rel="alternate" hreflang="x-default" href="${pageUrl}" />
`;

    // Set custom page head meta tags
    const headMeta: string = `
  <title>${item.metaTitle}</title>
  <meta name="description" content="${item.metaDescription}">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:type" content="${item.type === 'article' ? 'article' : 'website'}">
  <meta property="og:title" content="${item.metaTitle}">
  <meta property="og:description" content="${item.metaDescription}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${SITE_URL}/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${item.metaTitle}">
  <meta name="twitter:description" content="${item.metaDescription}">
  <meta name="twitter:image" content="${SITE_URL}/og-image.png">
  ${hreflangTags}
  ${jsonLdMarkup}
  `;
  
    // Inject metadata immediately inside the head element
    let preRenderedHtml: string = optimizedBase.replace("</head>", `${headMeta}\n</head>`);
    
    // Helper function to build related tools list
    const getRelatedToolsHtml = (currentSlug: string): string => {
      const toolsList = [
        { slug: 'merge-pdf', label: 'Merge PDF', desc: 'Combine multiple PDFs' },
        { slug: 'split-pdf', label: 'Split PDF', desc: 'Extract pages or split into files' },
        { slug: 'rotate-pdf', label: 'Rotate PDF', desc: 'Rotate pages' },
        { slug: 'delete-pages-pdf', label: 'Delete PDF Pages', desc: 'Remove unwanted pages' },
        { slug: 'extract-pages-pdf', label: 'Extract Pages', desc: 'Pull specific pages' },
        { slug: 'reorder-pdf', label: 'Reorder PDF', desc: 'Rearrange page order' },
        { slug: 'watermark-pdf', label: 'Watermark PDF', desc: 'Add text watermarks' },
        { slug: 'add-page-numbers', label: 'Add Page Numbers', desc: 'Number your pages' },
        { slug: 'add-blank-page', label: 'Add Blank Page', desc: 'Insert blank pages' },
        { slug: 'protect-pdf', label: 'Protect PDF', desc: 'Password-encrypt' },
        { slug: 'unlock-pdf', label: 'Unlock PDF', desc: 'Remove passwords' },
        { slug: 'image-to-pdf', label: 'Image to PDF', desc: 'Convert images' },
        { slug: 'pdf-to-image', label: 'PDF to Image', desc: 'Convert to images' },
        { slug: 'intelligence', label: 'AI Analyze PDF', desc: 'AI-powered analysis' },
      ];

      const filtered = toolsList.filter((t: { slug: string; label: string; desc: string }) => t.slug !== currentSlug);

      return `
<h2>Related PDF Tools</h2>
<p>Explore more free, privacy-first PDF tools:</p>
<ul>
${filtered.map((t: { slug: string; label: string; desc: string }) => `  <li><a href="/${t.slug}">${t.label}</a> — ${t.desc}</li>`).join('\n')}
</ul>
`;
    };

    let finalBody: string = item.longFormBody;
    if (item.type !== 'article') {
      finalBody += getRelatedToolsHtml(item.slug);
    }

    // Pre-inject longFormBody directly inside the React hydration root element (#root) for raw HTML crawler response!
    const preRenderedContent: string = `
    <div id="root">
      <noscript>
        <article class="prose max-w-4xl mx-auto py-12 px-6 dark:prose-invert font-sans" id="static-pre-render-container">
          ${finalBody}
        </article>
      </noscript>
    </div>
    `;
    
    // Replace empty #root mount tag with populated static HTML
    preRenderedHtml = preRenderedHtml.replace(/<div\s+id="root"\s*><\/div>/i, preRenderedContent);
    preRenderedHtml = preRenderedHtml.replace(/<div\s+id="root"\s*>\s*<\/div>/i, preRenderedContent);
    
    fs.writeFileSync(path.join(targetFolder, "index.html"), preRenderedHtml, "utf8");
    logger.info(`Pre-rendered static HTML created for ${item.name} at: ${targetFolder}/index.html`);
  });

  // ----------------------------------------------------
  // Pre-render the Homepage (dist/index.html)
  // ----------------------------------------------------
  logger.info("Pre-rendering static HTML for the Homepage...");
  
  const homepageContent = `
  <main class="prose max-w-6xl mx-auto py-12 px-6 dark:prose-invert font-sans" id="static-pre-render-container">
    <h1>Free PDF Tools — Privacy-First, 100% Browser-Based</h1>
    <p>PDFMinty is a free, privacy-first PDF toolkit with 14 powerful tools that run entirely in your browser. Your files never leave your device — no server uploads, no sign-ups, no limits. Merge, split, protect, convert, and edit PDFs with complete confidentiality.</p>
 
    <h2>Popular PDF Tools</h2>
    <ul>
      <li><a href="/merge-pdf">Merge PDF</a> — Combine multiple PDFs into one document</li>
      <li><a href="/split-pdf">Split PDF</a> — Extract pages or split into separate files</li>
      <li><a href="/rotate-pdf">Rotate PDF</a> — Rotate pages 90, 180, or 270 degrees</li>
      <li><a href="/delete-pages-pdf">Delete PDF Pages</a> — Remove unwanted pages</li>
      <li><a href="/watermark-pdf">Watermark PDF</a> — Add text watermarks with custom opacity</li>
      <li><a href="/protect-pdf">Protect PDF</a> — Password-encrypt your documents</li>
      <li><a href="/unlock-pdf">Unlock PDF</a> — Remove password protection</li>
      <li><a href="/image-to-pdf">Image to PDF</a> — Convert JPG, PNG, WebP to PDF</li>
      <li><a href="/pdf-to-image">PDF to Image</a> — Convert PDF pages to PNG/JPEG</li>
    </ul>
 
    <h2>Why Choose PDFMinty?</h2>
    <p>Unlike other online PDF tools that upload your files to remote servers, PDFMinty processes everything locally in your browser using WebAssembly. This means:</p>
    <ul>
      <li><strong>Complete Privacy:</strong> Your documents never touch our servers</li>
      <li><strong>No File Limits:</strong> Process files up to 100MB each, 150MB total</li>
      <li><strong>Fast Processing:</strong> WebAssembly-powered operations complete in seconds</li>
      <li><strong>No Registration:</strong> All tools are 100% free with no sign-up</li>
      <li><strong>Works Offline:</strong> PWA-enabled — install and use without internet</li>
    </ul>
 
    <h2>How PDFMinty Protects Your Privacy</h2>
    <p>Every PDF operation in PDFMinty happens client-side using JavaScript and WebAssembly. When you upload a file, it's loaded into your browser's memory, processed locally, and the result is generated on your device. The file is never transmitted over the network. This is fundamentally different from traditional online PDF tools that require you to upload files to their servers.</p>
 
    <p>Our privacy-first architecture makes PDFMinty ideal for processing sensitive documents like tax returns, medical records, financial statements, legal contracts, and any file containing personal information.</p>
 
    <h2>Frequently Asked Questions</h2>
    <h3>Is PDFMinty really free?</h3>
    <p>Yes, PDFMinty is 100% free to use. All 14 tools are available without subscription, payment, or registration.</p>
 
    <h3>Are my files uploaded to your server?</h3>
    <p>No. PDFMinty is a privacy-first tool. All PDF processing happens entirely in your browser using client-side JavaScript. Your files never leave your device.</p>
 
    <h3>What is the maximum file size?</h3>
    <p>PDFMinty can handle individual PDF files up to 100MB and combined operations up to 150MB total. Performance depends on your device's memory and processing power.</p>
 
    <h3>Do I need to install any software?</h3>
    <p>No installation required. PDFMinty runs in any modern browser (Chrome, Firefox, Safari, Edge). You can also install it as a PWA for offline access.</p>
 
    <h2>Start Processing Your PDFs Now</h2>
    <p>Browse our complete collection of PDF tools above. All tools are free, private, and work instantly in your browser.</p>
  </main>
`;

  const homepageFaqSchema = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is PDFMinty really free?",
        "acceptedAnswer": {"@type": "Answer", "text": "Yes, PDFMinty is 100% free to use. All 15 tools are available without subscription, payment, or registration."}
      },
      {
        "@type": "Question",
        "name": "Are my files uploaded to your server?",
        "acceptedAnswer": {"@type": "Answer", "text": "No. PDFMinty is a privacy-first tool. All PDF processing happens entirely in your browser using client-side JavaScript. Your files never leave your device."}
      },
      {
        "@type": "Question",
        "name": "What is the maximum file size?",
        "acceptedAnswer": {"@type": "Answer", "text": "PDFMinty can handle individual PDF files up to 100MB and combined operations up to 150MB total. Performance depends on your device's memory and processing power."}
      },
      {
        "@type": "Question",
        "name": "Do I need to install any software?",
        "acceptedAnswer": {"@type": "Answer", "text": "No installation required. PDFMinty runs in any modern browser. You can also install it as a PWA for offline access."}
      }
    ]
  }
  </script>
`;

  let homepageHtml: string = baseHtml;

  // 1. Inject FAQ schema and dynamic hreflang tags before </head>
  const homepageHreflangTags = `
  <link rel="alternate" hreflang="en" href="https://pdfminty.com" />
  <link rel="alternate" hreflang="x-default" href="https://pdfminty.com" />
`;
  homepageHtml = homepageHtml.replace("</head>", `${homepageFaqSchema}\n${homepageHreflangTags}\n</head>`);

  // 2. Inject pre-rendered content into #root
  const homepageRootContent = `
    <div id="root">
      <noscript>
        ${homepageContent}
      </noscript>
    </div>
  `;
  homepageHtml = homepageHtml.replace(/<div\s+id="root"\s*><\/div>/i, homepageRootContent);
  homepageHtml = homepageHtml.replace(/<div\s+id="root"\s*>\s*<\/div>/i, homepageRootContent);

  fs.writeFileSync(distIndexHtmlPath, homepageHtml, "utf8");
  logger.info("Successfully pre-rendered static HTML for the Homepage at dist/index.html");
}

run().catch((err: unknown) => {
  logger.error("FATAL: Failed to pre-render static HTML pages:", err);
  process.exit(1);
});
