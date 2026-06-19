import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper because of ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_DIR = path.resolve(__dirname, "..");
const ROUTES_CONFIG_PATH = path.join(APP_DIR, "src/config/routes.ts");
const APP_JSX_PATH = path.join(APP_DIR, "src/App.tsx");

const defaultSEO = {
  title: "PDFMinty - Privacy-First PDF Toolkit",
  description: "Privacy-first client-side PDF toolkit. Combine, split, compress, and edit PDF files offline instantly within your browser with complete confidentiality."
};

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateStaticPages() {
  try {
    if (!fs.existsSync(ROUTES_CONFIG_PATH)) {
      throw new Error(`Routes config file not found at ${ROUTES_CONFIG_PATH}`);
    }
    if (!fs.existsSync(APP_JSX_PATH)) {
      throw new Error(`App.tsx not found at ${APP_JSX_PATH}`);
    }

    const routesContent = fs.readFileSync(ROUTES_CONFIG_PATH, "utf-8");
    const appContent = fs.readFileSync(APP_JSX_PATH, "utf-8");

    // Extract SITE_URL
    const siteUrlMatch = routesContent.match(/export const SITE_URL = ["']([^"']+)["']/);
    const SITE_URL = siteUrlMatch ? siteUrlMatch[1] : "https://pdfaid.com";

    // Extract paths from src/config/routes.ts
    const routeRegex = /\{\s*path:\s*["']([^"']+)["']\s*,\s*priority:\s*([\d.]+)\s*,\s*changefreq:\s*["']([^"']+)["']/g;
    let match;
    const activeRoutePaths = [];
    while ((match = routeRegex.exec(routesContent)) !== null) {
      if (match[1] !== "/" && match[1] !== "*") {
        activeRoutePaths.push(match[1]);
      }
    }

    // Parse lazy imports from App.tsx
    // e.g. const MergePage = React.lazy(() => import("./pages/MergePage"));
    const importRegex = /const\s+(\w+)\s*=\s*React\.lazy\(\s*\(\s*\)\s*=>\s*import\(\s*["']([^"']+)["']\s*\)\s*\)/g;
    const componentImports = {};
    let importMatch;
    while ((importMatch = importRegex.exec(appContent)) !== null) {
      componentImports[importMatch[1]] = importMatch[2];
    }

    let count = 0;

    for (const routePath of activeRoutePaths) {
      const cleanPath = routePath.startsWith("/") ? routePath.slice(1) : routePath;

      // Find the Route mapping in App.tsx
      // e.g. <Route path="/merge-pdf" element={<MergePage />} />
      // We escape Special Characters in routePath for matching
      const escapedPath = routePath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const routeElementRegex = new RegExp(`<Route\\s+path=["']${escapedPath}["']\\s+element=\\{<([^/\\s>]+)\\s*\\/>\\}\\s*\\/>`, "i");
      
      const routeElementMatch = appContent.match(routeElementRegex);
      if (!routeElementMatch) {
         console.warn(`No component route found in App.tsx matching path: ${routePath}`);
         continue;
      }

      const componentName = routeElementMatch[1];
      const importPath = componentImports[componentName];

      let pageFileContent = "";
      if (importPath) {
        const relativeSrcPath = importPath.startsWith("./") ? importPath.slice(2) : importPath;
        const fullFilePath = path.join(APP_DIR, "src", `${relativeSrcPath}.tsx`);
        if (fs.existsSync(fullFilePath)) {
          pageFileContent = fs.readFileSync(fullFilePath, "utf-8");
        }
      }

      // Default fallback SEO parameters
      let title = defaultSEO.title;
      let description = defaultSEO.description;
      let canonicalPath = cleanPath;
      if (canonicalPath === "organize") {
        canonicalPath = "delete-pages-pdf";
      }
      let canonical = `${SITE_URL}/${canonicalPath}`;

      if (pageFileContent) {
        // Extract SEO tag using multiline regex
        const seoMatch = pageFileContent.match(/<SEO\s+([^>]+)\/>/s);
        if (seoMatch) {
          const seoBody = seoMatch[1];
          const titleMatch = seoBody.match(/title=["']([^"']+)["']/i);
          const descMatch = seoBody.match(/description=["']([^"']+)["']/i);
          const canonMatch = seoBody.match(/canonical=["']([^"']+)["']/i);
          
          if (titleMatch) title = titleMatch[1];
          if (descMatch) description = descMatch[1];
          if (canonMatch) {
            canonical = canonMatch[1].replace(/https?:\/\/[^/]+/i, SITE_URL);
          }
        } else {
          // Fallback check ToolWorkspace attributes
          const workspaceMatch = pageFileContent.match(/<ToolWorkspace\s+([^>]+)\/>/s);
          if (workspaceMatch) {
            const wsBody = workspaceMatch[1];
            const titleMatch = wsBody.match(/title=["']([^"']+)["']/i);
            const descMatch = wsBody.match(/description=["']([^"']+)["']/i);
            if (titleMatch) title = titleMatch[1];
            if (descMatch) description = descMatch[1];
          }
        }
      }

      // H1 & body description default or extraction
      let h1 = title;
      if (pageFileContent) {
        const h1Match = pageFileContent.match(/<h1[^>]*>([\s\S]+?)<\/h1>/i);
        if (h1Match) {
          h1 = h1Match[1].replace(/<[^>]+>/g, "").trim();
        }
      }

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Privacy-First PDF Toolkit | PDFaid</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${SITE_URL}/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${SITE_URL}/og-image.png">
</head>
<body class="bg-slate-50 text-slate-800 antialiased selection:bg-emerald-500/30">
  <div id="root">
    <main class="container mx-auto max-w-4xl px-4 py-12 text-center">
      <h1 class="text-3xl font-black tracking-tight text-slate-900 mb-4">${h1}</h1>
      <p class="text-lg text-slate-600 mb-8 leading-relaxed">${description}</p>
    </main>
  </div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`;

      const publicRouteDir = path.join(APP_DIR, "public", cleanPath);
      ensureDir(publicRouteDir);
      fs.writeFileSync(path.join(publicRouteDir, "index.html"), htmlContent, "utf-8");

      const distDir = path.join(APP_DIR, "dist");
      if (fs.existsSync(distDir)) {
        const distRouteDir = path.join(distDir, cleanPath);
        ensureDir(distRouteDir);
        fs.writeFileSync(path.join(distRouteDir, "index.html"), htmlContent, "utf-8");
      }

      count++;
    }

    console.log(`Static pages generated for ${count} routes.`);
  } catch (error) {
    console.error("Error generating static pages:", error);
    process.exit(1);
  }
}

generateStaticPages();
