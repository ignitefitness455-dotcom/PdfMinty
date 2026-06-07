import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Define English translation key-value mappings
const resourcesEn = {
  translation: {
    app_title: "PDFMinty — Free Online PDF Tools",
    app_tagline: "Secure PDF studio. No uploads, entirely in your browser.",
    loading: "Loading PDFMinty...",
    search_placeholder: "Filter tools (e.g. merge, protect, watermarks...)",
    clear_filter: "Clear Filter",
    not_found_title: "No tools match your filter",
    not_found_desc: 'Try looking for alternate synonyms such as "combine", "split", "lock", "watermark", or clear your filter.',
    how_it_works_title: "How PDFMinty Works",
    how_it_works_desc: "Three simple steps to manage your documents",
    step_1_title: "Select Files",
    step_1_desc: "Choose your PDF files from your computer or mobile device. Files are stored entirely temporarily in your browser.",
    step_2_title: "Process Locally",
    step_2_desc: "Our browser-based engine handles the work. They are never sent to any external server or third-party service.",
    step_3_title: "Download & Clean",
    step_3_desc: "Get your processed PDF instantly. All temporary data is cleared automatically when you close the browser tab.",
    why_title: "Why Choose PDFMinty?",
    why_desc: "Professional grade tools without the premium price tag.",
    popular: "POPULAR",
    smart_reduction: "SMART REDUCTION",
    ai_hybrid: "AI HYBRID",
    offline_aes: "OFFLINE AES",
    fast_convert: "FAST CONVERT",
    extractor: "EXTRACTOR",
    launch_tool: "Launch tool",
    faq_title: "Frequently Asked Questions",
    nav_home: "Home",
    nav_privacy: "Privacy",
    nav_terms: "Terms",
    language_switcher: "Change Language",
    developed_by: "Developed by & under Proprietorship of PDFMinty. Strictly safe & distributed.",
    drag_instructions: "Drag & drop anywhere in this card, or tap to choose",
    upload_target: "Upload Target File(s)",
    upload_btn: "Choose File(s)",
    success_notif: "Successfully loaded!",
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: resourcesEn,
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: false, // fallback already governed by toolskeleton
    },
  });

// Expose standard switcher callback helper, locked to English
export const changeLanguage = (_lang?: string) => {
  i18n.changeLanguage("en");
  try {
    localStorage.setItem("pdfminty-lang", "en");
  } catch (e) {}
};

export default i18n;
