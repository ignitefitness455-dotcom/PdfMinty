(function() {
  const isCapacitor = typeof window !== 'undefined' && (typeof window.Capacitor !== 'undefined' || window.location.href.startsWith('file://') || window.location.href.startsWith('capacitor://'));

  if (!isCapacitor && window.location.hash && window.location.hash.startsWith('#/')) {
    const cleanPath = window.location.hash.replace('#', '');
    window.location.replace(cleanPath);
    return;
  }

  let targetPath = window.location.pathname;
  let cleanHash = window.location.hash || '';

  // Standardize hash routing to path routing
  if (!isCapacitor && cleanHash.startsWith('#/')) {
    const routeParts = cleanHash.slice(2).split('?');
    targetPath = '/' + routeParts[0];
    cleanHash = routeParts[1] ? '?' + routeParts[1] : '';
  }

  const hn = window.location.hostname.toLowerCase();
  
  // Rule 1: Redirect non-www and typo hostnames to canonical www.pdfminty.com with clean paths
  if (!isCapacitor && (hn === 'pdfminty.com' || hn === 'pdfmity.com' || hn === 'www.pdfmity.com')) {
    const finalQuery = cleanHash.startsWith('?') ? cleanHash : window.location.search;
    window.location.replace('https://www.pdfminty.com' + targetPath + finalQuery);
    return;
  }
  
  // Rule 2: If we are already on www.pdfminty.com (or local/dev) but have a "#/" hash, redirect to clean path
  if (!isCapacitor && window.location.hash && window.location.hash.startsWith('#/')) {
    const finalQuery = cleanHash.startsWith('?') ? cleanHash : window.location.search;
    window.location.replace(targetPath + finalQuery);
    return;
  }
  
  // Early theme detection to avoid flashing white on mobile load
  try {
    const saved = localStorage.getItem("pdfminty-theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (e) {}
})();
