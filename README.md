<div align="center">
  <h1>PDFMinty</h1>
  <p><strong>Privacy-First, Client-Side PDF Toolkit with AI Intelligence</strong></p>
  <p>100% Offline Processing • Zero File Uploads • Serverless AI Integration</p>
</div>

---

## 🌟 Overview

**PDFMinty** is a modern, privacy-focused Web Application for operating on PDF documents. Unlike traditional online PDF tools that upload sensitive files to remote servers, PDFMinty processes documents **directly inside your browser** using WebAssembly and client-side JavaScript. 

For intelligent features (such as PDF Analysis, OCR, and PDF-to-Markdown conversion), PDFMinty leverages a serverless proxy supporting **Groq, Gemini, and xAI Grok** models without compromising document privacy for basic operations.

---

## ✨ Features & Tools

### 📄 Document Manipulation
* **Merge PDF** — Combine multiple PDFs into a single organized document.
* **Split PDF** — Divide PDFs by page ranges or extract separate pages.
* **Reorder Pages** — Drag-and-drop page thumbnail arrangement.
* **Delete Pages** — Visual page selection and instant deletion.
* **Extract Pages** — Select and pull out specific pages into a new PDF.
* **Add Blank Page** — Insert blank pages at custom positions.
* **Rotate PDF** — Rotate individual or all pages with preview support.

### 🔒 Security & Privacy
* **Protect PDF** — Encrypt PDFs with user & owner passwords.
* **Unlock PDF** — Remove password protection from authorized PDFs.
* **Sanitize PDF** — Strip hidden metadata, embedded scripts, and hidden attachments.
* **Sign PDF** — Add signature stamps, drawing signatures, and text overlays.

### 🎨 Formatting & Conversion
* **Image to PDF** — Convert JPG, PNG, and WebP images to a PDF.
* **PDF to Image** — Export PDF pages as high-resolution PNG or JPEG images.
* **Watermark PDF** — Add custom text or image watermarks with controllable opacity and rotation.
* **Add Page Numbers** — Custom page numbering with header/footer alignment styles.
* **Grayscale PDF** — Convert colorful PDFs into monochrome documents.
* **Flatten PDF** — Lock form fields and annotations into static page elements.
* **Repair PDF** — Re-render corrupted or broken PDF structures.
* **Edit Metadata** — Update title, author, subject, and keywords.

### 🤖 AI-Powered Intelligence
* **AI Analyze PDF** — Ask questions, generate summaries, and extract insights from documents.
* **PDF to Markdown** — Convert structured PDF layouts into clean Markdown text.
* **OCR PDF** — Extract text from scanned documents using vision model OCR.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 18 + TypeScript + Vite
* **Styling:** Tailwind CSS + Lucide Icons
* **PDF Processing Engine:** `pdf-lib`, `@cantoo/pdf-lib`, `pdfjs-dist`
* **Serverless Backend:** Cloudflare Pages Functions
* **AI Provider Support:** Groq API (`GROQ_API_KEY`), Google Gemini API (`GEMINI_API_KEY`), xAI Grok (`GROK_API_KEY`)
* **Testing & Quality:** Vitest, ESLint, TypeScript

---

## 🚀 Local Development

### Prerequisites
* **Node.js**: v18+ 
* **npm** or **bun**
* **Wrangler CLI** (for Cloudflare Pages Functions testing)

### Quick Start

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` (or set Cloudflare Secrets in production):
   ```env
   # API Keys for AI features (Groq, Gemini, or xAI)
   GROQ_API_KEY=your_groq_api_key_here
   # GEMINI_API_KEY=your_gemini_api_key_here
   # GROK_API_KEY=your_grok_api_key_here
   ```

3. **Start Vite Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Test Cloudflare Pages Functions locally (Proxy & AI API):**
   ```bash
   npm run pages:dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🧪 Code Quality & Testing

```bash
# Type check TypeScript files
npm run typecheck

# Run linter
npm run lint

# Run unit & component tests
npm run test

# Check formatting
npm run format:check
```

---

## 🛡️ Security & Privacy Notice

* **Client-First Philosophy:** All core PDF editing operations (merge, split, encrypt, rotate, watermark, convert) run completely in-browser. Your files are **never uploaded** to any server.
* **AI Proxy Security:** When using AI features (OCR, Analyze, Markdown conversion), only the relevant text/images are sent securely over HTTPS to your configured AI provider proxy (`/api/gemini-proxy`).
* **Content Security Policy:** Built-in dynamic CSP headers protect users against XSS and injection attacks.

---

## 📜 License

Distributed under the MIT License.
