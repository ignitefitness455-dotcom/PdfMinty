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
      "tools_dashboard": "Tools Dashboard",
      "why_offline": "Why Offline?",
      "sandbox_active": "Sandbox Active",
      "secure": "Secure",
      "privacy_faq": "Privacy & FAQ",
      "secure_studio": "100% Secure Offline Studio",
      "all_files_locally": "All files are processed locally on your device. No data is ever uploaded to our servers.",
      "provide_feedback": "Provide Feedback",
      "contact_us": "Contact Us",
      "is_it_safe": "Is It Safe?"
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
      "how_it_works_desc": "সম্পূর্ণ নিরপত্তা নিশ্চিত করতে আপনার নিজস্ব ডিভাইসে স্থানীয়ভাবে চলা প্রফেশনال মানের অফলাইন পিডিএফ টুলস।",
      "step_1_title": "১. আপনার ফাইল নির্বাচন করুন",
      "step_1_desc": "আপনার পিডিএফ ডকুমেন্ট নির্বাচন করে আমাদের নিরাপদ অফলাইন ওয়ার্কস্পেসে ড্র্যাগ করুন।",
      "step_2_title": "২. প্রসেস বেছে নিন",
      "step_2_desc": "কম্প্রেশন, স্প্লিট রেঞ্জ, রোটেশন, বা পাসওয়ার্ড সিকিউরিটি লেআউট পছন্দ করুন।",
      "step_3_title": "৩. নিরাপদ ডাউনলোড",
      "step_3_desc": "তাৎক্ষণিকভাবে আপনার নতুন পিডিএফ ফাইল সরাসরি আপনার ডিভাইসে জেনারেট করে ডাউনলোড করুন।",
      "faq_title": "সচরাচর জিজ্ঞাসিত প্রশ্নাবলী",
      "tools_dashboard": "টুলস ড্যাশবورد",
      "why_offline": "কেন অফলাইন?",
      "sandbox_active": "স্যান্ডবক্স সক্রিয়",
      "secure": "নিরাপদ",
      "privacy_faq": "গোপনীয়তা ও প্রশ্নোত্তর",
      "secure_studio": "১০০% নিরাপদ অফলাইন স্টুডিও",
      "all_files_locally": "সমস্ত ফাইল আপনার ডিভাইসে স্থানীয়ভাবে প্রক্রিয়া করা হয়। আমাদের সার্ভারে কোনো ফাইল আপলোড করা হয় না।",
      "provide_feedback": "মতামত দিন",
      "contact_us": "যোগাযোগ করুন",
      "is_it_safe": "এটি কি নিরাপদ?"
    }
  },
  ar: {
    translation: {
      "popular": "شائع",
      "smart_reduction": "ضغط ذكي",
      "ai_hybrid": "ذكاء اصطناعي هجين",
      "offline_aes": "تشفير AES-256 محلي",
      "fast_convert": "تحويل سريع",
      "extractor": "مستخرج الصفحات",
      "launch_tool": "إطلاق الأداة",
      "clear_filter": "مسح التصفية وإعادة البحث",
      "not_found_title": "لم يتم العثور على نتائج لبحثك",
      "not_found_desc": "يرجى تجربة البحث عن كلمة مفتاحية أخرى لأدوات PDF، مثل دمج، ضغط، تقسيم، تحويل، أو علامة مائية.",
      "search_placeholder": "ابحث في 15 أداة PDF تعمل بدون اتصال...",
      "how_it_works_title": "كيف يعمل PDFMinty",
      "how_it_works_desc": "أدوات PDF احترافية تعمل محلياً بالكامل على جهازك لضمان السرية التامة والأمان المطلق.",
      "step_1_title": "1. اختر ملفك",
      "step_1_desc": "اسحب ملف PDF أو حدده بأمان داخل بيئة عملنا الآمنة والمحمية.",
      "step_2_title": "2. اختر الإجراء",
      "step_2_desc": "اختر الضغط، أو تقسيم الصفحات، أو التدوير، أو حماية الملف بكلمة مرور.",
      "step_3_title": "3. تصدير آمن",
      "step_3_desc": "أنشئ واحفظ ملف PDF المحدث على الفور مباشرةً على جهازك الشخصي.",
      "faq_title": "الأسئلة الشائعة والمتكررة",
      "tools_dashboard": "لوحة الأدوات",
      "why_offline": "لماذا بدون اتصال؟",
      "sandbox_active": "Sandbox نشط",
      "secure": "آمن",
      "privacy_faq": "الخصوصية والأسئلة الشائعة",
      "secure_studio": "استوديو محلي آمن 100%",
      "all_files_locally": "يتم معالجة جميع الملفات محلياً على جهازك. لا يتم رفع أي بيانات إلى خوادمنا نهائياً.",
      "provide_feedback": "تقديم ملاحظات",
      "contact_us": "اتصل بنا",
      "is_it_safe": "هل هو آمن؟"
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
