import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure favicons, touch-icons, and OG sharing images are generated on every build
async function generateAllAssets(publicDir, distDir) {
  const iconSource = path.join(publicDir, 'logo.svg');
  if (!fs.existsSync(iconSource)) {
    console.warn('Warning: Source logo.svg not found in public directory. Unable to generate assets.');
    return;
  }

  console.log('Generating website logos, favicons, and metadata graphics...');
  try {
    // Ensure both output targets exist
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

    const targets = [publicDir, distDir];

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

    console.log('Successfully completed generateAllAssets procedure.');
  } catch (err) {
    console.error('Error during asset generation pipeline:', err);
  }
}

// Single Source of Truth TypeScript File Loader:
// Compiles/strips TS markers at runtime to load metadata cleanly inside standard Node.js
async function loadSeoData() {
  const seoPath = path.join(__dirname, '../src/config/seo-data.ts');
  const tempJsPath = path.join(__dirname, './seo-static-temp.js');
  
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
  const distDir = path.join(__dirname, "../dist");
  const publicDir = path.join(__dirname, "../public");
  
  // Create logos & icons first on every build dynamically
  await generateAllAssets(publicDir, distDir);

  const seoData = await loadSeoData();
  const { SITE_URL, SITE_NAME, TOOLS } = seoData;
  
  const distIndexHtmlPath = path.join(distDir, "index.html");
  const rootIndexHtmlPath = path.join(__dirname, "../index.html");
  
  let baseHtml = "";
  if (fs.existsSync(distIndexHtmlPath)) {
    baseHtml = fs.readFileSync(distIndexHtmlPath, "utf8");
    console.log("Reading template from compiled dist/index.html");
  } else if (fs.existsSync(rootIndexHtmlPath)) {
    baseHtml = fs.readFileSync(rootIndexHtmlPath, "utf8");
    console.log("Reading template from root index.html");
  } else {
    throw new Error("Unable to locate any base index.html template file for static generation.");
  }
  
  // Clean base HTML to avoid double definitions (purging titles, descriptions, canonicals, OGs, Twitters, and JSON-LD markup)
  function cleanBaseTemplate(html) {
    let clean = html;
    clean = clean.replace(/<title>[^<]*<\/title>/gi, "");
    clean = clean.replace(/<meta\s+name="description"[^>]*>/gi, "");
    clean = clean.replace(/<link\s+rel="canonical"[^>]*>/gi, "");
    clean = clean.replace(/<meta\s+property="og:[^>]*>/gi, ""); // Purge all og: properties
    clean = clean.replace(/<meta\s+name="twitter:[^>]*>/gi, ""); // Purge all twitter: properties
    
    // Purge any homepage-only JSON-LD structured script elements to avoid duplication
    clean = clean.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
    
    return clean;
  }
  
  const optimizedBase = cleanBaseTemplate(baseHtml);
  
  TOOLS.forEach((item) => {
    const pageUrl = `${SITE_URL}/${item.slug}`;
    const targetFolder = path.join(distDir, item.slug);
    
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }
    
    // Construct route-specific JSON-LD blocks
    const schemas = [];
    
    if (item.type === 'tool') {
      // 1. WebApplication Schema
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": `${SITE_NAME} - ${item.name}`,
        "url": pageUrl,
        "description": item.metaDescription,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires HTML5, WebAssembly"
      });
      
      // 2. HowTo Schema
      if (item.howTo) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": item.howTo.name,
          "totalTime": item.howTo.totalTime,
          "step": item.howTo.steps.map((stepText, index) => ({
            "@type": "HowToStep",
            "url": `${pageUrl}#step${index + 1}`,
            "name": stepText,
            "itemListElement": [{ "@type": "HowToDirection", "text": stepText }]
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
    const jsonLdMarkup = schemas
      .map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
      .join('\n  ');
      
    // Set custom page head meta tags
    const headMeta = `
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
  ${jsonLdMarkup}
  `;
  
    // Inject metadata immediately inside the head element
    let preRenderedHtml = optimizedBase.replace("</head>", `${headMeta}\n</head>`);
    
    // Pre-inject longFormBody directly inside the React hydration root element (#root) for raw HTML crawler response!
    const preRenderedContent = `
    <div id="root">
      <article class="prose max-w-4xl mx-auto py-12 px-6 dark:prose-invert font-sans" id="static-pre-render-container">
        ${item.longFormBody}
      </article>
    </div>
    `;
    
    // Replace empty #root mount tag with populated static HTML
    preRenderedHtml = preRenderedHtml.replace(/<div\s+id="root"\s*><\/div>/i, preRenderedContent);
    preRenderedHtml = preRenderedHtml.replace(/<div\s+id="root"\s*>\s*<\/div>/i, preRenderedContent);
    
    fs.writeFileSync(path.join(targetFolder, "index.html"), preRenderedHtml, "utf8");
    console.log(`Pre-rendered static HTML created for ${item.name} at: ${targetFolder}/index.html`);
  });
}

run().catch((err) => {
  console.error("FATAL: Failed to pre-render static HTML pages:", err);
  process.exit(1);
});
