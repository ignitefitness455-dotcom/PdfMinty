import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper because of ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_DIR = path.resolve(__dirname, "..");
const ROUTES_CONFIG_PATH = path.join(APP_DIR, "src/config/routes.ts");
const SITEMAP_PATH = path.join(APP_DIR, "public/sitemap.xml");
const DIST_SITEMAP_PATH = path.join(APP_DIR, "dist/sitemap.xml");

function generateSitemap() {
  try {
    if (!fs.existsSync(ROUTES_CONFIG_PATH)) {
      throw new Error(`Routes config file not found at ${ROUTES_CONFIG_PATH}`);
    }

    const content = fs.readFileSync(ROUTES_CONFIG_PATH, "utf-8");

    // Extract SITE_URL
    const siteUrlMatch = content.match(/export const SITE_URL = ["']([^"']+)["']/);
    const SITE_URL = siteUrlMatch ? siteUrlMatch[1] : "https://pdfaid.com";

    // Extract route entries
    // e.g., { path: "/merge-pdf", priority: 0.8, changefreq: "weekly", lastmod: "2026-06-17" }
    const routeRegex = /\{\s*path:\s*["']([^"']+)["']\s*,\s*priority:\s*([\d.]+)\s*,\s*changefreq:\s*["']([^"']+)["'](?:\s*,\s*lastmod:\s*["']([^"']+)["'])?\s*\}/g;
    
    let match;
    const routes = [];
    while ((match = routeRegex.exec(content)) !== null) {
      routes.push({
        path: match[1],
        priority: parseFloat(match[2]),
        changefreq: match[3],
        lastmod: match[4] || null
      });
    }

    if (routes.length === 0) {
      throw new Error("No routes extracted from src/config/routes.ts!");
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const entry of routes) {
      const relativePath = entry.path === "/" ? "" : (entry.path.startsWith("/") ? entry.path : `/${entry.path}`);
      const fullUrl = `${SITE_URL}${relativePath}`;
      
      xml += `  <url>\n`;
      xml += `    <loc>${fullUrl}</loc>\n`;
      if (entry.lastmod) {
        xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      }
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>\n`;

    // Write to public/
    fs.writeFileSync(SITEMAP_PATH, xml, "utf-8");

    // Write to dist/ if it exists
    const distDir = path.join(APP_DIR, "dist");
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(DIST_SITEMAP_PATH, xml, "utf-8");
    }

    console.log(`Sitemap generated with ${routes.length} URLs.`);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    process.exit(1);
  }
}

generateSitemap();
