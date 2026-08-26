import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

// Supported locales defined in ONE config array so adding more locales touches only this place
export const SUPPORTED_LOCALES = ['en', 'bn'] as const;
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
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
  },
};

// Tool slugs configured with localized routing enabled
export const I18N_TOOL_SLUGS = ['merge-pdf'] as const;
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
 * Otherwise, it falls back to that locale's homepage (e.g. /bn/ or /).
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
  return `${siteUrl}${getLocalizedPath(baseSlug, locale)}`;
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

i18n
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`../locales/${language}/${namespace}.json`)
    )
  )
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: DEFAULT_NAMESPACE,
    ns: [DEFAULT_NAMESPACE, 'merge-pdf', 'faq'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['path', 'htmlTag'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
