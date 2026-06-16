# PDFMinty

**PDFMinty** is a privacy-first, client-side PDF toolkit designed to securely manipulate PDF documents directly in the browser. All file processing occurs locally on the user's device via Web Workers, ensuring no user data or documents are ever uploaded to remote servers.

## Architecture & Tech Stack

This project is built as a single-page application (SPA) focused on security and performance.

### Core Stack
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **Routing:** React Router (v6) with lazy-loaded code splitting for route pages

### PDF Processing
- **PDF-Lib & @cantoo/pdf-lib:** Powers the creation, modification, splitting, and merging of PDFs.
- **PDF.js (pdfjs-dist):** Powers rendering PDF pages to high-quality images and extracting metadata.
- **Web Workers:** Most heavy operations run in dedicated background threads (`src/core/WorkerManager.ts` & `src/core/pdfRunner.ts`) to avoid blocking the main UI thread.

### Backend Infrastructure (Cloudflare)
Cloudflare edge computing is utilized for lightweight helper APIs without storing user data:
- **Cloudflare Pages:** Globally distributed SPA asset hosting.
- **Cloudflare Workers:** Serverless functions under `functions/api/*` handling tasks like feedback submission, rate-limiting, and proxying AI analysis requests (Gemini).
- **Cloudflare KV:** Used by Workers for state management like request rate-limiting hashes (Note: `wrangler.toml` configuration is currently absent from this repo and must be configured for target deployment).

## Key Patterns
- **Tool Workspace UI (`src/components/ToolWorkspace.tsx`):** A shared layout structure for almost all 15+ PDF tools.
- **Progressive Web App (PWA):** Features a service worker designed for offline capability and rapid loading, with built-in stale-cache mitigation.
- **RTL & i18n:** Supports multiple languages including Arabic (RTL) via `i18next`.

## Local Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   This will spin up a Vite server with hot module replacement (HMR).
3. **Build for Production:**
   ```bash
   npm run build
   ```
   This command chains `vite build`, static page generation, and sitemap generation.
4. **Validation:**
   - Typechecking: `npm run typecheck`
   - Linting: `npm run lint`
   - Unit tests: `npm run test`
   - Smoke tests (Puppeteer): `npm run test:smoke`

## Cloudflare Deployment

PDFMinty is optimized for Cloudflare Pages.
1. Connect this repository to your Cloudflare Pages project.
2. Set the build command to `npm run build`.
3. Set the build output directory to `dist`.
4. Ensure environment variables (e.g., Gemini API keys for the `functions/api/gemini-proxy.ts` worker) are configured.
5. Create a KV Namespace for rate-limiting and bind it to the Pages Functions environment. *(Note: You will need to add a `wrangler.toml` file to define these bindings explicitly for local testing or CI/CD pipelines if not using the Cloudflare Dashboard.)*
