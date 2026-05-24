/**
 * src/core/analytics.js - Real User Monitoring (Privacy-First)
 * No cookies. No personal data. Only anonymous aggregated metrics.
 */
const SESSION_HASH = crypto.randomUUID ? crypto.randomUUID().slice(0, 16) : Date.now().toString(36);

function sendBeacon(data) {
  const payload = {
    ...data,
    session_hash: SESSION_HASH,
    country_code: '', // Will be filled server-side from CF-IPCountry
    user_agent: navigator.userAgent.slice(0, 100),
    timestamp: new Date().toISOString(),
  };

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
  } else {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }
}

export function trackToolUsage(toolId, processingTimeMs, fileSizeBytes, pageCount, success, errorType = null) {
  sendBeacon({
    tool_id: toolId,
    processing_time_ms: Math.round(processingTimeMs),
    file_size_bytes: fileSizeBytes,
    page_count: pageCount,
    success,
    error_type: errorType,
  });
}

export function trackWebVitals() {
  // CLS
  if (window.PerformanceObserver) {
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            sendBeacon({ metric: 'CLS', value: entry.value });
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}

    // LCP
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        sendBeacon({ metric: 'LCP', value: lastEntry.startTime });
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {}
  }
}

export function initAnalytics() {
  trackWebVitals();
}
