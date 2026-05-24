// src/main.js - App Orchestrator (Phase 2: Modular Foundations)
// Core engines are imported to prepare for Phase 3 migration while app.js serves as bridge
import '../app.js';

import { initThemeManager } from './ui/shell/ThemeManager.js';
import { initLocale } from './core/i18n.js';
import { initAnalytics } from './core/analytics.js';

// Initialize modular systems under the hood
try {
  initThemeManager();
  initLocale();
  initAnalytics();
  console.log('[PDFMinty] v2.0.0 Phase 2 initialized - Modular systems online');
} catch (e) {
  console.warn('[PDFMinty] Handover to modular system underway:', e);
}

