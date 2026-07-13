import React from 'react';

import { logger } from './logger';

/**
 * Wraps React.lazy() so a failed dynamic-import (stale hashed chunk after a
 * fresh deploy — "ChunkLoadError" / "Failed to fetch dynamically imported
 * module") triggers exactly ONE silent full-page reload instead of bubbling
 * up to the route's ErrorBoundary as a generic crash screen.
 *
 * Guard via sessionStorage so a genuinely broken component (real runtime
 * error, not a stale-chunk 404) doesn't cause an infinite reload loop —
 * after one retry it lets the real error surface normally.
 */
export function lazyWithRetry<T extends { default: React.ComponentType<any> }>(
  factory: () => Promise<T>
) {
  return React.lazy(async () => {
    try {
      const result = await factory();
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('pdfminty-chunk-retry');
        }
      } catch (e) {
        // Ignore sessionStorage errors
      }
      return result;
    } catch (error) {
      const key = 'pdfminty-chunk-retry';
      if (!sessionStorage.getItem(key)) {
        logger.warn('Lazy chunk load failed. Cleaning Service Worker + Cache to force network fetch...', error);
        sessionStorage.setItem(key, '1');
        
        // Unregister service workers and clear cache storage to guarantee clean load from network
        try {
          if (typeof window !== 'undefined') {
            if ('serviceWorker' in navigator) {
              const regs = await navigator.serviceWorker.getRegistrations();
              for (const reg of regs) {
                await reg.unregister();
              }
            }
            if ('caches' in window) {
              const cacheKeys = await caches.keys();
              for (const cacheKey of cacheKeys) {
                await caches.delete(cacheKey);
              }
            }
          }
        } catch (swError) {
          logger.error('Failed to clear SW/caches during chunk retry:', swError);
        }

        window.location.reload();
        // Never resolves — the reload takes over before React needs this.
        return new Promise<T>(() => {});
      }
      sessionStorage.removeItem(key);
      throw error;
    }
  });
}
