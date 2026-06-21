export function getCorsOrigin(request: Request): string {
  const origin = request.headers.get('Origin') || '';
  const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
  const isProd = /^https:\/\/([a-z0-9-]+\.)?pdfminty\.(com|pages\.dev)$/.test(origin);
  return isLocal || isProd ? origin : 'https://pdfminty.com';
}

export function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
  const isProd = /^https:\/\/([a-z0-9-]+\.)?pdfminty\.(com|pages\.dev)$/.test(origin);
  return isLocal || isProd;
}

export function getCorsHeaders(
  origin: string,
  contentType = 'application/json',
  methods = 'POST, GET, OPTIONS'
): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || 'https://pdfminty.com',
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Origin',
    'Access-Control-Max-Age': '86400',
    'Content-Type': contentType,
  };
}
