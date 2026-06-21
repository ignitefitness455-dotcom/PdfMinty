import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const seoData = await loadSeoData();
  const { SITE_URL, SITE_NAME, TOOLS } = seoData;
  
  const distDir = path.join(__dirname, "../dist");
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
