import { TOOLS } from '../src/config/seo-data';

import { getCorsOrigin, getCorsHeaders } from './utils/cors';

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname.toLowerCase();

  // 301 redirect: /switch-from-adobe-acrobat is a duplicate route of
  // /adobe-acrobat-alternative (same component). It was listed in the
  // sitemap but served the SPA shell with a homepage canonical.
  if (pathname === '/switch-from-adobe-acrobat' || pathname === '/switch-from-adobe-acrobat/') {
    return Response.redirect(url.origin + '/adobe-acrobat-alternative/', 301);
  }

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

    // Static pages that are always valid
    const staticValidRoutes = new Set([
      'blog', 'about-us', 'contact', 'privacy-policy', 'terms-of-service',
      'adobe-acrobat-alternative', 'switch-from-adobe-acrobat',
      'bn', 'bn/merge-pdf',
    ]);

    // Check if cleanPath or stripped locale path is a valid route
    let isValidRoute = false;
    if (cleanPath === '' || staticValidRoutes.has(cleanPath)) {
      isValidRoute = true;
    } else if (isBn) {
      const bnSubPath = cleanPath.replace(/^bn\/?/, '');
      isValidRoute = bnSubPath === '' || bnSubPath === 'merge-pdf' || TOOLS.some((item) => item.slug === bnSubPath);
    } else {
      isValidRoute = TOOLS.some((item) => item.slug === cleanPath);
    }

    if (!isValidRoute) {
      // Return 404 status so crawlers don't index unknown paths
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
    "img-src 'self' blob: data: https://www.googletagmanager.com",
    "connect-src 'self' blob: https://www.google-analytics.com https://stats.g.doubleclick.net https://static.cloudflareinsights.com https://generativelanguage.googleapis.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  newResponse.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  return newResponse;
};
