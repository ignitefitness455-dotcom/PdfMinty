const ALLOWED_ORIGINS = ['https://pdfminty.com', 'http://localhost:3000', 'http://localhost:5173'];

const DEFAULT_ORIGIN = 'https://pdfminty.com';

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

export function getCorsOrigin(request: Request): string {
  const origin = request.headers.get('origin');
  if (origin && isAllowedOrigin(origin)) {
    return origin;
  }
  return DEFAULT_ORIGIN;
}

export function getCorsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}
