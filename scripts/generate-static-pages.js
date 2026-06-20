import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read routes.ts to get SITE_URL
const routesPath = path.join(__dirname, "../src/config/routes.ts");
let SITE_URL = "https://pdfminty.com";

try {
  const routesContent = fs.readFileSync(routesPath, "utf8");
  const siteUrlMatch = routesContent.match(/SITE_URL\s*=\s*["']([^"']+)["']/);
  SITE_URL = siteUrlMatch ? siteUrlMatch[1] : "https://pdfminty.com";
} catch (error) {
  console.error("Failed to read routes.ts, using fallback SITE_URL:", error);
}

// Defined tools for generating static pages
const tools = [
  {
    id: "merge-pdf",
    title: "Merge PDF",
    description: "Combine multiple PDF files into a single, clean document in any order you choose.",
    category: "page-operations",
    path: "/merge-pdf",
    icon: "Merge",
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    description: "Extract ranges of pages or split custom pages into multi-part individual documents.",
    category: "page-operations",
    path: "/split-pdf",
    icon: "Scissors",
  },
  {
    id: "compress-pdf",
    title: "Compress PDF",
    description: "Reduce file size footprint using professional compression schemes purely in your browser.",
    category: "utilities",
    path: "/compress-pdf",
    icon: "Minimize2",
  },
  {
    id: "rotate-pdf",
    title: "Rotate PDF",
    description: "Rotate single pages or the entire document pages 90, 180, or 270 degrees clockwise.",
    category: "page-operations",
    path: "/rotate-pdf",
    icon: "RotateCw",
  },
  {
    id: "delete-pages-pdf",
    title: "Delete Pages",
    description: "Selectively strip out unwanted, trailing, or confidential pages from your master files.",
    category: "organize",
    path: "/delete-pages-pdf",
    icon: "Trash2",
  },
  {
    id: "watermark-pdf",
    title: "Watermark PDF",
    description: "Superimpose elegant, custom diagonal text stamps with configurable size and transparency.",
    category: "security-edit",
    path: "/watermark-pdf",
    icon: "Bookmark",
  },
  {
    id: "add-page-numbers",
    title: "Page Numbers",
    description: "Stitch standard page indices automatically onto document page footer panels.",
    category: "security-edit",
    path: "/add-page-numbers",
    icon: "Hash",
  },
  {
    id: "add-blank-page",
    title: "Add Blank Page",
    description: "Incorporate empty page spacing into start, middle, or end of your document flows.",
    category: "organize",
    path: "/add-blank-page",
    icon: "FilePlus",
  },
  {
    id: "protect-pdf",
    title: "Protect PDF",
    description: "Encrypt and secure your sensitive PDFs using state-of-the-art browser password standard hashes.",
    category: "security-edit",
    path: "/protect-pdf",
    icon: "Shield",
  },
  {
    id: "unlock-pdf",
    title: "Unlock PDF",
    description: "Strip document lock credentials from your standard user files for clear, unlocked reading.",
    category: "security-edit",
    path: "/unlock-pdf",
    icon: "Lock",
  },
  {
    id: "image-to-pdf",
    title: "Image to PDF",
    description: "Convert multiple PNG or JPG photos into clean formatted PDF pages instantly.",
    category: "convert",
    path: "/image-to-pdf",
    icon: "Image",
  },
  {
    id: "pdf-to-image",
    title: "PDF to Image",
    description: "Convert multiple pages from document directly into portable standard image canvases.",
    category: "convert",
    path: "/pdf-to-image",
    icon: "Eye",
  },
  {
    id: "ai-analyze",
    title: "AI Analyze",
    description: "Summarize, analyze, and inspect your PDF document content using secure offline local text parsing boosted by premium AI assistance.",
    category: "intelligence",
    path: "/intelligence",
    icon: "Sparkles",
  }
];

// Load base index.html template from root
const rootIndexHtmlPath = path.join(__dirname, "../index.html");
let baseHtml = "";
try {
  baseHtml = fs.readFileSync(rootIndexHtmlPath, "utf8");
} catch (e) {
  baseHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDFMinty — Privacy-First PDF Toolkit</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
}

// Helper to inject SEO metadata into base HTML for crawlers
function generateHtmlContent(title, description, toolPath) {
  const canonicalUrl = `${SITE_URL}${toolPath}`;
  
  // Clean preexisting titles/metas if any
  let html = baseHtml;
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${title} — Privacy-First PDF Toolkit | PDFMinty</title>`);
  
  const metaTags = `
  <title>${title} — Privacy-First PDF Toolkit | PDFMinty</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:title" content="${title} | PDFMinty">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="website">
  `;
  
  // Inject tags in head
  html = html.replace("</head>", `${metaTags}\n</head>`);
  return html;
}

// Generate files in static build folder or public folder
const distDir = path.join(__dirname, "../dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

tools.forEach((tool) => {
  const toolDir = path.join(distDir, tool.path);
  if (!fs.existsSync(toolDir)) {
    fs.mkdirSync(toolDir, { recursive: true });
  }
  
  const htmlContent = generateHtmlContent(tool.title, tool.description, tool.path);
  fs.writeFileSync(path.join(toolDir, "index.html"), htmlContent, "utf8");
  console.log(`Generated static SEO page for: ${tool.title} at ${toolDir}/index.html`);
});
