// Early Initialization Script for PDFMinty Applet
(function () {
  try {
    // Detect dark mode theme state from localStorage and apply immediately to avoid layout flash
    const currentTheme = localStorage.getItem("theme");
    if (
      currentTheme === "dark" ||
      (!currentTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    console.log("PDFMinty early-init successfully applied visual preferences.");
  } catch (err) {
    console.error("PDFMinty early-init theme setup error:", err);
  }
})();
