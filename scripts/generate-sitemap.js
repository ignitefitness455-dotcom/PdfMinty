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

const routes = [
  "",
  "/merge-pdf",
  "/split-pdf",
  "/compress-pdf",
  "/rotate-pdf",
  "/delete-pages-pdf",
  "/watermark-pdf",
  "/add-page-numbers",
  "/add-blank-page",
  "/protect-pdf",
  "/unlock-pdf",
  "/image-to-pdf",
  "/pdf-to-image",
  "/intelligence",
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route === "" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

const publicDir = path.join(__dirname, "../public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");
console.log(`Sitemap generated successfully at ${path.join(publicDir, "sitemap.xml")}`);
