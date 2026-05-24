/**
 * src/core/router.js - SPA Router with View Transitions API
 */
let _onRouteChange = null;
let _toolsList = [];

export function initRouter({ onRouteChange, toolsList = [] }) {
  _onRouteChange = onRouteChange;
  _toolsList = toolsList;

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    if (_onRouteChange) _onRouteChange(path);
  });

  // Link interceptor for SPA navigation
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Internal navigation
    if (href.startsWith('/')) {
      e.preventDefault();
      window.history.pushState(null, '', href);
      if (_onRouteChange) _onRouteChange(href);
      return;
    }

    // Hash links for same-page navigation
    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  // Initial route
  const initialPath = window.location.pathname;
  if (_onRouteChange) _onRouteChange(initialPath);
}

export function navigateTo(path) {
  window.history.pushState(null, '', path);
  if (_onRouteChange) _onRouteChange(path);
}

export function getCurrentRoute() {
  return {
    path: window.location.pathname,
    hash: window.location.hash,
    search: window.location.search,
  };
}

export function getRouteInfo(path) {
  // Parse locale and tool ID from path
  // Patterns: /, /merge, /bn/merge, /en/merge
  const parts = path.split('/').filter(Boolean);
  const locales = ['en', 'bn', 'hi', 'ar'];

  let locale = 'en';
  let toolId = '';

  if (parts.length === 0) {
    return { locale: 'en', toolId: '', isHome: true };
  }

  if (locales.includes(parts[0])) {
    locale = parts[0];
    toolId = parts[1] || '';
  } else {
    toolId = parts[0];
  }

  return {
    locale,
    toolId: toolId.replace(/-pdf$/, ''),
    isHome: !toolId,
    isTool: !!toolId && _toolsList.some(t => t.id === toolId.replace(/-pdf$/, '')),
  };
}

export function updateSEOTags(toolId, toolsList, locale = 'en') {
  const tool = toolsList.find(t => t.id === toolId);
  if (!tool) return;

  const title = locale === 'bn' 
    ? `${tool.title} — PdfMinty ফ্রি অনলাইন টুলস`
    : `${tool.title} — PdfMinty Free Online Tools`;

  document.title = title;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', tool.desc);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', tool.desc);

  const twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.setAttribute('content', title);

  const twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) twDesc.setAttribute('content', tool.desc);

  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', `${window.location.origin}/${locale === 'en' ? '' : locale + '/'}${toolId}`);
}
