import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import deCommon from '../locales/de/common.json';
import deFaq from '../locales/de/faq.json';
import deMergePdf from '../locales/de/merge-pdf.json';
import enCommon from '../locales/en/common.json';
import enFaq from '../locales/en/faq.json';
import enMergePdf from '../locales/en/merge-pdf.json';
import esCommon from '../locales/es/common.json';
import esFaq from '../locales/es/faq.json';
import esMergePdf from '../locales/es/merge-pdf.json';
import frCommon from '../locales/fr/common.json';
import frFaq from '../locales/fr/faq.json';
import frMergePdf from '../locales/fr/merge-pdf.json';

// Supported locales defined in ONE config array so adding more locales touches only this place
export const SUPPORTED_LOCALES = ['en', 'de', 'fr', 'es'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';
export const DEFAULT_NAMESPACE = 'common';

export interface LocaleMetadata {
  code: SupportedLocale;
  name: string;
  nativeName: string;
}

export const LOCALE_METADATA: Record<SupportedLocale, LocaleMetadata> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
  },
};

// Tool slugs configured with localized routing enabled
export const I18N_TOOL_SLUGS = [
  'merge-pdf',
  'split-pdf',
  'grayscale-pdf',
  'protect-pdf',
  'image-to-pdf',
  'pdf-to-image',
] as const;
export type I18nToolSlug = (typeof I18N_TOOL_SLUGS)[number];

export function isI18nToolSlug(slug: string): boolean {
  const clean = slug.replace(/^\//, '').replace(/\/$/, '');
  return (I18N_TOOL_SLUGS as readonly string[]).includes(clean);
}

export function getLocalizedPath(baseSlug: string, locale: SupportedLocale): string {
  const clean = baseSlug.replace(/^\//, '').replace(/\/$/, '');
  if (!clean) {
    return locale === DEFAULT_LOCALE ? '/' : `/${locale}/`;
  }
  if (locale === DEFAULT_LOCALE) {
    return `/${clean}/`;
  }
  return `/${locale}/${clean}/`;
}

/**
 * Derives the target navigation path when switching language from the current pathname.
 * If the current page is an i18n-enabled route (e.g. merge-pdf), it preserves the page under the new locale.
 * Otherwise, it falls back to that locale's homepage (e.g. /de/ or /).
 */
export function getSwitchLocalePath(currentPathname: string, targetLocale: SupportedLocale): string {
  const pathWithoutQuery = (currentPathname || '').split('?')[0];
  const segments = pathWithoutQuery.split('/').filter(Boolean);

  const hasLocalePrefix =
    segments.length > 0 &&
    (SUPPORTED_LOCALES as readonly string[]).includes(segments[0]) &&
    segments[0] !== DEFAULT_LOCALE;

  const baseSegments = hasLocalePrefix ? segments.slice(1) : segments;
  const baseSlug = baseSegments.join('/');
  const cleanSlug = baseSlug.replace(/^\//, '').replace(/\/$/, '');

  if (cleanSlug && isI18nToolSlug(cleanSlug)) {
    return getLocalizedPath(cleanSlug, targetLocale);
  }

  // Fallback to that locale's homepage
  return targetLocale === DEFAULT_LOCALE ? '/' : `/${targetLocale}/`;
}

export function getCanonicalUrl(
  baseSlug: string,
  locale: SupportedLocale,
  siteUrl = 'https://pdfminty.com'
): string {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, '');
  const localizedPath = getLocalizedPath(baseSlug, locale);
  return `${normalizedSiteUrl}${localizedPath}`;
}

export interface HreflangEntry {
  hreflang: string;
  href: string;
}

export function getHreflangs(
  baseSlug: string,
  siteUrl = 'https://pdfminty.com'
): HreflangEntry[] {
  const entries: HreflangEntry[] = [];
  for (const locale of SUPPORTED_LOCALES) {
    entries.push({
      hreflang: locale,
      href: getCanonicalUrl(baseSlug, locale, siteUrl),
    });
  }
  entries.push({
    hreflang: 'x-default',
    href: getCanonicalUrl(baseSlug, DEFAULT_LOCALE, siteUrl),
  });
  return entries;
}

export function getInitialLocale(): SupportedLocale {
  if (typeof window !== 'undefined' && window.location) {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const first = segments[0] as SupportedLocale;
    if (first && (SUPPORTED_LOCALES as readonly string[]).includes(first)) {
      return first;
    }
  }
  return DEFAULT_LOCALE;
}

export const resources = {
  en: {
    common: enCommon,
    'merge-pdf': enMergePdf,
    faq: enFaq,
  },
  de: {
    common: deCommon,
    'merge-pdf': deMergePdf,
    faq: deFaq,
  },
  fr: {
    common: frCommon,
    'merge-pdf': frMergePdf,
    faq: frFaq,
  },
  es: {
    common: esCommon,
    'merge-pdf': esMergePdf,
    faq: esFaq,
  },
};

const initialLocale = getInitialLocale();

i18n
  .use(initReactI18next)
  .init({
    lng: initialLocale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    defaultNS: DEFAULT_NAMESPACE,
    ns: [DEFAULT_NAMESPACE, 'merge-pdf', 'faq'],
    resources,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLocale;
}

export default i18n;
