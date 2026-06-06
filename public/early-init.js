(function() {
  // Early theme detection to avoid flashing white on mobile load
  try {
    const saved = localStorage.getItem("pdfminty-theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (e) {}

  // Early language detection & loading skeleton dynamic localization
  try {
    const savedLang = localStorage.getItem("pdfminty-lang");
    const browserLang = navigator.language || navigator.userLanguage || "en";
    const activeLang = savedLang || browserLang.substring(0, 2);
    
    // Once the DOM is ready, configure early load message
    document.addEventListener("DOMContentLoaded", function() {
      const loadingEl = document.querySelector(".loading-text");
      if (loadingEl) {
        if (activeLang === "bn") {
          loadingEl.textContent = "পিডিএফমিন্টি লোড হচ্ছে...";
        } else {
          loadingEl.textContent = "Loading PDFMinty...";
        }
      }
    });
  } catch (e) {}
})();
