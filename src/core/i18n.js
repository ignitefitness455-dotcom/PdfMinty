/**
 * src/core/i18n.js - Lightweight i18n with lazy loading
 */
const dictionaries = {};
let currentLocale = 'en';

const defaultDict = {
  en: {
    'app.name': 'PDFMinty',
    'app.tagline': 'Free Online PDF Tools',
    'nav.home': 'Home',
    'nav.tools': 'Tools',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.auto': 'Auto',
    'dropzone.drag': 'Drag & drop your files here',
    'dropzone.or': 'or',
    'dropzone.browse': 'Browse files',
    'button.process': 'Process',
    'button.download': 'Download',
    'button.cancel': 'Cancel',
    'progress.processing': 'Processing...',
    'progress.almost': 'Almost done...',
    'error.generic': 'Something went wrong. Please try again.',
    'success.complete': 'Done! 🎉',
    'footer.privacy': 'Your files never leave your device',
    'footer.copyright': '© 2026 PDFMinty. Free and open-source PDF tools.',
    'tool.merge.title': 'Merge PDF',
    'tool.merge.desc': 'Combine multiple PDFs into one',
    'tool.split.title': 'Split PDF',
    'tool.split.desc': 'Extract pages from your PDF',
    'tool.compress.title': 'Compress PDF',
    'tool.compress.desc': 'Reduce file size without losing quality',
    'tool.rotate.title': 'Rotate PDF',
    'tool.rotate.desc': 'Rotate pages to correct orientation',
    'tool.reorder.title': 'Reorder PDF',
    'tool.reorder.desc': 'Change the order of PDF pages',
    'tool.delete-pages.title': 'Delete Pages',
    'tool.delete-pages.desc': 'Remove unwanted pages',
    'tool.extract-pages.title': 'Extract Pages',
    'tool.extract-pages.desc': 'Get specific pages as a new PDF',
    'tool.image-to-pdf.title': 'Image to PDF',
    'tool.image-to-pdf.desc': 'Convert JPG/PNG to PDF',
    'tool.pdf-to-image.title': 'PDF to Image',
    'tool.pdf-to-image.desc': 'Convert PDF pages to JPG',
    'tool.protect.title': 'Protect PDF',
    'tool.protect.desc': 'Add password to your PDF',
    'tool.unlock.title': 'Unlock PDF',
    'tool.unlock.desc': 'Remove password from PDF',
    'tool.watermark.title': 'Watermark',
    'tool.watermark.desc': 'Stamp text on your PDF',
    'tool.add-page-numbers.title': 'Page Numbers',
    'tool.add-page-numbers.desc': 'Insert page numbers',
    'tool.add-blank-page.title': 'Add Blank Page',
    'tool.add-blank-page.desc': 'Insert blank pages anywhere',
    'tool.crop-resize.title': 'Crop & Resize',
    'tool.crop-resize.desc': 'Adjust margins and dimensions',
  },
  bn: {
    'app.name': 'PDFMinty',
    'app.tagline': 'ফ্রি অনলাইন PDF টুলস',
    'nav.home': 'হোম',
    'nav.tools': 'টুলস',
    'theme.light': 'আলো',
    'theme.dark': 'অন্ধকার',
    'theme.auto': 'অটো',
    'dropzone.drag': 'ফাইল এখানে ড্র্যাগ করুন',
    'dropzone.or': 'অথবা',
    'dropzone.browse': 'ফাইল ব্রাউজ করুন',
    'button.process': 'প্রসেস করুন',
    'button.download': 'ডাউনলোড',
    'button.cancel': 'বাতিল',
    'progress.processing': 'প্রসেসিং হচ্ছে...',
    'progress.almost': 'প্রায় শেষ...',
    'error.generic': 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।',
    'success.complete': 'সম্পন্ন! 🎉',
    'footer.privacy': 'আপনার ফাইল কখনোই আপনার ডিভাইস ছাড়া যাবে না',
    'footer.copyright': '© 2026 PDFMinty। ফ্রি ও ওপেন-সোর্স PDF টুলস।',
    'tool.merge.title': 'PDF মার্জ করুন',
    'tool.merge.desc': 'একাধিক PDF একত্রিত করুন',
    'tool.split.title': 'PDF স্প্লিট করুন',
    'tool.split.desc': 'আপনার PDF থেকে পেজ আলাদা করুন',
    'tool.compress.title': 'PDF কমপ্রেস করুন',
    'tool.compress.desc': 'কোয়ালিটি না কমিয়েই ফাইলের সাইজ কমান',
    'tool.rotate.title': 'PDF রোটেট করুন',
    'tool.rotate.desc': 'পেজ সঠিক দিকে ঘুরিয়ে নিন',
    'tool.reorder.title': 'পেজ রিঅর্ডার করুন',
    'tool.reorder.desc': 'PDF পেজের ক্রম পরিবর্তন করুন',
    'tool.delete-pages.title': 'পেজ ডিলিট করুন',
    'tool.delete-pages.desc': 'অপ্রয়োজনীয় পেজ সরিয়ে ফেলুন',
    'tool.extract-pages.title': 'পেজ এক্সট্র্যাক্ট করুন',
    'tool.extract-pages.desc': 'নির্দিষ্ট পেজ নিয়ে নতুন PDF তৈরি করুন',
    'tool.image-to-pdf.title': 'ছবি থেকে PDF',
    'tool.image-to-pdf.desc': 'JPG/PNG ছবিকে PDF ফাইলে রূপান্তর করুন',
    'tool.pdf-to-image.title': 'PDF থেকে ছবি',
    'tool.pdf-to-image.desc': 'PDF পেজ সরাসরি JPG-তে কনভার্ট করুন',
    'tool.protect.title': 'PDF সুরক্ষিত করুন',
    'tool.protect.desc': 'আপনার PDF-এ পাসওয়ার্ড যুক্ত করুন',
    'tool.unlock.title': 'PDF আনলক করুন',
    'tool.unlock.desc': 'PDF থেকে পাসওয়ার্ড সরিয়ে ফেলুন',
    'tool.watermark.title': 'ওয়াটারমার্ক',
    'tool.watermark.desc': 'PDF-এ ওয়াটারমার্ক টেক্সট যোগ করুন',
    'tool.add-page-numbers.title': 'পেজ নাম্বার',
    'tool.add-page-numbers.desc': 'পেজে নাম্বার বা সংখ্যা সেট করুন',
    'tool.add-blank-page.title': 'খালি পেজ যোগ করুন',
    'tool.add-blank-page.desc': 'যেকোনো জায়গায় খালি পেজ যুক্ত করুন',
    'tool.crop-resize.title': 'ক্রপ ও রিসাইজ',
    'tool.crop-resize.desc': 'মার্জিন এবং ফাইলের আকার পরিবর্তন করুন',
  }
};

// Load default dictionaries immediately
Object.assign(dictionaries, defaultDict);

export function setLocale(locale) {
  currentLocale = locale;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('locale', locale);
}

export function getLocale() {
  return currentLocale;
}

export function t(key, fallback = null) {
  const dict = dictionaries[currentLocale] || dictionaries.en;
  return dict[key] || fallback || dict[key] || key;
}

export async function loadLocale(locale) {
  if (dictionaries[locale]) {
    setLocale(locale);
    return;
  }

  try {
    const response = await fetch(`/locales/${locale}.json`);
    if (response.ok) {
      dictionaries[locale] = await response.json();
      setLocale(locale);
    }
  } catch (e) {
    console.warn(`Failed to load locale: ${locale}`);
    setLocale('en');
  }
}

// Initialize locale from URL or localStorage
export function initLocale() {
  const savedLocale = localStorage.getItem('locale') || 'en';
  setLocale(savedLocale);
}
