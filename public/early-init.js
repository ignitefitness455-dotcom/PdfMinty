(function() {
  const hn = window.location.hostname.toLowerCase();
  if (hn === 'pdfminty.com' || hn === 'pdfmity.com' || hn === 'www.pdfmity.com') {
    window.location.replace('https://www.pdfminty.com' + window.location.pathname + window.location.search + window.location.hash);
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
