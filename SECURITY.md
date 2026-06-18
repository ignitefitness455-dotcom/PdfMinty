# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 17.x    | Yes       |
| 16.x    | No        |

## Reporting a Vulnerability

Email: pdfminty@gmail.com

We respond within 48 hours. Critical issues patched within 72 hours.

## Security Architecture

- All PDF processing is client-side (browser Web Workers)
- Server-side functions only handle metadata, never file content
- Rate limiting on all API endpoints
- Input sanitization on all user inputs
- CORS restricted to pdfminty.com domains
- CSP headers prevent XSS
- API keys never exposed to client

## Known Limitations

- Rate limiting uses atomic counters (best-effort consistency)
- Client-side processing limited by browser memory (~2GB)
- PDF.js text extraction may fail on scanned/image-based PDFs
