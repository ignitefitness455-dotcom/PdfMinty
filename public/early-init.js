(function() {
  let targetPath = window.location.pathname;
  let cleanHash = window.location.hash || '';

  // Standardize hash routing to path routing
  if (cleanHash.startsWith('#/')) {
    const routeParts = cleanHash.slice(2).split('?');
    targetPath = '/' + routeParts[0];
    cleanHash = routeParts[1] ? '?' + routeParts[1] : '';
  }

  const hn = window.location.hostname.toLowerCase();
  if (hn === 'pdfminty.com' || hn === 'pdfmity.com' || hn === 'www.pdfmity.com') {
    window.location.replace('https://www.pdfminty.com' + targetPath + (cleanHash.startsWith('?') ? cleanHash : window.location.search + cleanHash));
    return;
  } else if (window.location.hash && window.location.hash.startsWith('#/')) {
    window.location.replace(targetPath + window.location.search);
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
