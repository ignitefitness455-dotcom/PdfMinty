import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      "popular": "POPULAR",
      "smart_reduction": "SMART REDUCTION",
      "ai_hybrid": "AI HYBRID",
      "offline_aes": "OFFLINE AES-256",
      "fast_convert": "FAST CONVERT",
      "extractor": "EXTRACTOR",
      "launch_tool": "Launch Tool",
      "clear_filter": "Clear Filter & Reset Search",
      "not_found_title": "No match found for your search query",
      "not_found_desc": "Please try searching for another PDF utility keyword, such as Merge, Compress, Split, Convert or Watermark.",
      "search_placeholder": "Search from 15 offline PDF tools...",
      "how_it_works_title": "How PDFMinty Works",
      "how_it_works_desc": "Professional grade client side PDF tools running locally on your device for absolute safety.",
      "step_1_title": "1. Choose Your File",
      "step_1_desc": "Select or drag your PDF document securely into our sandboxed workspace.",
      "step_2_title": "2. Select Action",
      "step_2_desc": "Choose compression, split ranges, rotations, or password security layouts.",
      "step_3_title": "3. Secure Export",
      "step_3_desc": "Generate and save your updated PDF file instantly directly onto your device.",
      "faq_title": "Frequently Answered Queries",
    }
  },
  bn: {
    translation: {
      "popular": "জনপ্রিয়",
      "smart_reduction": "স্মার্ট কম্প্রেশন",
      "ai_hybrid": "এআই হাইব্রিড",
      "offline_aes": "অফলাইন এইএস-২৫৬",
      "fast_convert": "দ্রুত কনভার্ট",
      "extractor": "এক্সট্রাক্টর",
      "launch_tool": "টুল চালু করুন",
      "clear_filter": "ফিল্টার মুছুন ও পুনরায় খুঁজুন",
      "not_found_title": "আপনার অনুসন্ধান প্রশ্নের জন্য কোনো মিল পাওয়া যায়নি",
      "not_found_desc": "অনুগ্রহ করে অন্য কোনো পিডিএফ ইউটিলিটি কীওয়ার্ড যেমন মার্জ, কমপ্রেস, স্প্লিট, কনভার্ট বা ওয়াটারমার্ক দিয়ে অনুসন্ধানের চেষ্টা করুন।",
      "search_placeholder": "১৫টি অফলাইন পিডিএফ টুল থেকে খুঁজুন...",
      "how_it_works_title": "পিডিএফমিন্টি কীভাবে কাজ করে",
      "how_it_works_desc": "সম্পূর্ণ নিরপত্তা নিশ্চিত করতে আপনার নিজস্ব ডিভাইসে স্থানীয়ভাবে চলা প্রফেশনাল মানের অফলাইন পিডিএফ টুলস।",
      "step_1_title": "১. আপনার ফাইল নির্বাচন করুন",
      "step_1_desc": "আপনার পিডিএফ ডকুমেন্ট নির্বাচন করে আমাদের নিরাপদ অফলাইন ওয়ার্কস্পেসে ড্র্যাগ করুন।",
      "step_2_title": "২. প্রসেস বেছে নিন",
      "step_2_desc": "কম্প্রেশন, স্প্লিট রেঞ্জ, রোটেশন, বা পাসওয়ার্ড সিকিউরিটি লেআউট পছন্দ করুন।",
      "step_3_title": "৩. নিরাপদ ডাউনলোড",
      "step_3_desc": "তাৎক্ষণিকভাবে আপনার নতুন পিডিএফ ফাইল সরাসরি আপনার ডিভাইসে জেনারেট করে ডাউনলোড করুন।",
      "faq_title": "সচরাচর জিজ্ঞাসিত প্রশ্নাবলী",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage", "cookie"],
    }
  });

export default i18n;