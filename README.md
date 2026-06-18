# PDFMinty

Free privacy-first PDF tools. All processing happens in your browser.

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- pdf-lib + PDF.js (client-side)
- Cloudflare Pages Functions (serverless)
- Cloudflare KV (metadata storage)

## Development

```bash
npm install
npm run dev
```

## Deployment

```bash
npm run build
# Deploy dist/ to Cloudflare Pages
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| GEMINI_API_KEY | No | Google AI API key for /intelligence |
| GEMINI_MODEL | No | Model name (default: gemini-2.0-flash) |
| RESEND_API_KEY | No | For email notifications |
| RATELIMIT_KV | Yes | Cloudflare KV namespace |

## Privacy Guarantee

- PDFs never leave your browser
- No server-side PDF processing
- No analytics on file content
- Zero-knowledge architecture
