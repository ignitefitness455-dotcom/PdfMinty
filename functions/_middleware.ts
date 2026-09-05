import { TOOLS } from '../src/config/seo-data';

import { getCorsOrigin, getCorsHeaders } from './utils/cors';

// Canonical legacy redirects map (always 301 directly to canonical destination)
const LEGACY_REDIRECTS: Record<string, string> = {
  '/about': '/about-us/',
  '/contact-us': '/contact/',
  '/edit-metadata': '/edit-pdf-metadata/',
  '/protect': '/protect-pdf/',
  '/unlock': '/unlock-pdf/',
  '/compress': '/blog/how-to-compress-a-pdf-without-losing-quality-2026/',
  '/compress-pdf': '/blog/how-to-compress-a-pdf-without-losing-quality-2026/',
  '/delete-pages': '/delete-pages-pdf/',
  '/extract-pages': '/extract-pages-pdf/',
  '/reorder': '/reorder-pdf/',
  '/watermark': '/watermark-pdf/',
  '/page-numbers': '/add-page-numbers/',
  '/add-blank': '/add-blank-page/',
  '/img-to-pdf': '/image-to-pdf/',
  '/pdf-to-img': '/pdf-to-image/',
  '/grayscale': '/grayscale-pdf/',
  '/flatten': '/flatten-pdf/',
  '/repair': '/repair-pdf/',
  '/sign': '/sign-pdf/',
  '/ocr': '/ocr-pdf/',
  '/sanitize': '/sanitize-pdf/',
  '/intelligence': '/ai-analyze-pdf/',
  '/switch-from-adobe-acrobat': '/adobe-acrobat-alternative/',
  '/is-it-safe-to-upload-pdf-to-online-tools': '/blog/is-it-safe-to-upload-pdf-to-online-tools/',
  '/merge': '/merge-pdf/',
  '/split': '/split-pdf/',
  '/rotate': '/rotate-pdf/',
  '/pdfminty-vs-smallpdf': '/compare/pdfminty-vs-smallpdf/',
  '/pdfminty-vs-ilovepdf': '/compare/pdfminty-vs-ilovepdf/',
  '/blog/best-free-pdf-compressor-without-losing-quality': '/blog/how-to-compress-a-pdf-without-losing-quality-2026/',
  '/blog/how-to-compress-pdf-without-losing-quality-locally': '/blog/how-to-compress-a-pdf-without-losing-quality-2026/',
  '/blog/how-to-protect-a-pdf-with-password-in-3-easy-steps': '/blog/how-to-password-protect-a-pdf-offline/',
  '/blog/how-to-edit-a-pdf-offline-without-uploading-it': '/blog/secure-pdf-editing-without-uploading/',
  '/blog/why-offline-pdf-editors-are-the-future-of-privacy': '/blog/why-privacy-first-pdf-tools-matter-in-2026/',
};

// Static pages that are always valid
const STATIC_VALID_ROUTES = new Set([
  'blog', 'about-us', 'contact', 'privacy-policy', 'terms-of-service',
  'adobe-acrobat-alternative',
  'bn', 'bn/merge-pdf',
]);

function checkValidRoute(cleanPath: string): boolean {
  if (cleanPath === '' || STATIC_VALID_ROUTES.has(cleanPath)) {
    return true;
  }
  if (cleanPath === 'bn' || cleanPath.startsWith('bn/')) {
    const bnSubPath = cleanPath.replace(/^bn\/?/, '');
    return bnSubPath === '' || bnSubPath === 'merge-pdf' || TOOLS.some((item) => item.slug === bnSubPath);
  }
  return TOOLS.some((item) => item.slug === cleanPath);
}

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const rawPath = url.pathname;

  // Fast bypass for static assets: Vite chunks, CSS, fonts, images, wasm, etc.
  // Static assets must be served directly with their exact case-sensitive filenames and without page-level redirects.
  const isStaticAsset =
    rawPath.startsWith('/assets/') ||
    rawPath.startsWith('/fonts/') ||
    rawPath.startsWith('/icons/') ||
    /\.(js|css|png|jpe?g|svg|gif|ico|webp|woff2?|ttf|wasm|webmanifest|xml|txt|map|json)$/i.test(rawPath);

  if (isStaticAsset) {
    return context.next();
  }

  const lowerPath = rawPath.toLowerCase();

  // Normalize slashes and dot-segments early for non-API routes to avoid multi-hop redirect chains
  const normalizedLower = lowerPath.startsWith('/api')
    ? lowerPath
    : lowerPath.replace(/\/{2,}/g, '/').replace(/\/\.\//g, '/').replace(/\/\.$/, '/');

  // 1. Check legacy redirects first (with or without trailing slash)
  const strippedPath = normalizedLower.replace(/\/+$/, '') || '/';
  if (LEGACY_REDIRECTS[strippedPath]) {
    const targetHost = url.hostname === 'www.pdfminty.com' ? 'pdfminty.com' : url.hostname;
    const targetProtocol = (url.hostname === 'pdfminty.com' || url.hostname === 'www.pdfminty.com') ? 'https:' : url.protocol;
    const targetUrl = `${targetProtocol}//${targetHost}${LEGACY_REDIRECTS[strippedPath]}${url.search}`;
    return Response.redirect(targetUrl, 301);
  }

  // 2. Canonical URL Normalization: Hostname (www -> non-www) & Protocol (http -> https)
  let shouldRedirect = false;
  let targetHost = url.hostname;
  let targetProtocol = url.protocol;
  let targetPathname = rawPath;

  if (url.hostname === 'www.pdfminty.com') {
    targetHost = 'pdfminty.com';
    targetProtocol = 'https:';
    shouldRedirect = true;
  } else if (url.hostname === 'pdfminty.com' && url.protocol === 'http:') {
    targetProtocol = 'https:';
    shouldRedirect = true;
  }

  // 3. Dot-segment and consecutive slash collapsing for non-API paths
  if (!targetPathname.startsWith('/api')) {
    const cleanedDots = targetPathname.replace(/\/\.\//g, '/').replace(/\/\.$/, '/');
    if (cleanedDots !== targetPathname) {
      targetPathname = cleanedDots;
      shouldRedirect = true;
    }
    if (/\/{2,}/.test(targetPathname)) {
      targetPathname = targetPathname.replace(/\/{2,}/g, '/');
      shouldRedirect = true;
    }
  }

  // 4. Strip index.html / index.htm to directory trailing slash
  if (targetPathname === '/index.html' || targetPathname === '/index.htm') {
    targetPathname = '/';
    shouldRedirect = true;
  } else if (targetPathname.endsWith('/index.html') || targetPathname.endsWith('/index.htm')) {
    targetPathname = targetPathname.replace(/\/index\.html?$/, '/');
    shouldRedirect = true;
  }

  // 5. Lowercase path enforcement for non-API routes
  const lowerCandidate = targetPathname.toLowerCase();
  if (!targetPathname.startsWith('/api') && targetPathname !== lowerCandidate) {
    targetPathname = lowerCandidate;
    shouldRedirect = true;
  }

  // 6. Trailing slash enforcement for valid directory/HTML routes (not files, not /api)
  if (
    !targetPathname.startsWith('/api') &&
    !targetPathname.includes('.') &&
    !targetPathname.endsWith('/')
  ) {
    const cleanCandidate = targetPathname.toLowerCase().replace(/^\//, '').replace(/\/$/, '');
    // Only redirect valid routes to slash, so non-existent URLs 404 directly without chain
    if (checkValidRoute(cleanCandidate)) {
      targetPathname = `${targetPathname}/`;
      shouldRedirect = true;
    }
  }

  if (shouldRedirect) {
    const targetUrl = `${targetProtocol}//${targetHost}${targetPathname}${url.search}`;
    return Response.redirect(targetUrl, 301);
  }

  const pathname = lowerPath;

  // Define valid API endpoints
  const validApiEndpoints = [
    '/api/contact',
    '/api/error',
    '/api/feedback',
    '/api/gemini-proxy',
    '/api/health',
    '/api/subscribe',
  ];

  // Helper to check if a path is invalid/needs to be blocked with a 404 JSON response
  const isInvalidEndpoint = (path: string): boolean => {
    // 1. Is it an invalid API path?
    if (path === '/api' || path.startsWith('/api/')) {
      const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
      return !validApiEndpoints.includes(cleanPath);
    }

    // 2. Is it a GraphQL path?
    if (path === '/graphql' || path.startsWith('/graphql/') || path.endsWith('/graphql') || path.includes('/graphql')) {
      return true;
    }

    // 3. Is it an internal systems path?
    if (path === '/_internal' || path.startsWith('/_internal/') || path.includes('/_internal')) {
      return true;
    }

    return false;
  };

  if (isInvalidEndpoint(pathname)) {
    const origin = getCorsOrigin(context.request);
    const corsHeaders = getCorsHeaders(origin, 'application/json', 'GET, POST, OPTIONS');
    
    if (context.request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders as HeadersInit,
      });
    }

    return new Response(
      JSON.stringify({
        error: 'Not found',
        status: 404,
        message: `Endpoint ${url.pathname} does not exist.`,
      }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          'X-Robots-Tag': 'noindex, nofollow',
        } as HeadersInit,
      }
    );
  }

  const response = await context.next();

  // Handle responses with 304, 204 or 1xx statuses which cannot have a body per HTTP spec.
  const hasNoBody =
    response.status === 204 ||
    response.status === 304 ||
    (response.status >= 100 && response.status < 200);

  const contentType = response.headers.get('Content-Type') || '';
  const newResponse = new Response(hasNoBody ? null : response.body, response);

  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');

  // Explicitly tell search engines to index and follow links on all HTML pages.
  // For non-HTML responses (API, assets), use noindex to prevent indexing of internal endpoints.
  if (url.pathname === '/sw.js' || url.pathname.endsWith('/sw.js')) {
    newResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  } else if (contentType.includes('text/html')) {
    newResponse.headers.set('Cache-Control', 'no-cache, must-revalidate');

    // General 404 check for ALL HTML routes (including localized and blog/compare routes)
    const cleanPath = pathname.replace(/^\//, '').replace(/\/$/, '');

    // Check language prefix (e.g. /bn/ or /bn/merge-pdf)
    const isBn = pathname === '/bn' || pathname === '/bn/' || pathname.startsWith('/bn/');
    newResponse.headers.set('Content-Language', isBn ? 'bn' : 'en');

    const isValidRoute = checkValidRoute(cleanPath);

    if (!isValidRoute) {
      // Return 404 status so crawlers don't index unknown paths
      newResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return new Response(hasNoBody ? null : response.body, {
        status: 404,
        statusText: 'Not Found',
        headers: newResponse.headers,
      });
    }

    newResponse.headers.set('X-Robots-Tag', 'index, follow');
  } else if (contentType.includes('application/json') || url.pathname.startsWith('/api/')) {
    newResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  newResponse.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
  );
  newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  // Content-Security-Policy — সব ক্লায়েন্টের জন্য অভিন্ন (UA-ভিত্তিক বাইপাস নেই)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' blob: data: https://www.googletagmanager.com https://launchbuff.com https://launchstag.com",
    "connect-src 'self' blob: https://www.google-analytics.com https://stats.g.doubleclick.net https://static.cloudflareinsights.com https://generativelanguage.googleapis.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  newResponse.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  return newResponse;
};
