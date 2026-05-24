/**
 * src/ui/shell/ThemeManager.js - Dark/Light/Auto Theme
 */
import { setState, getState, subscribe } from '../../core/state.js';

const STORAGE_KEY = 'theme';

function applyTheme(theme) {
  const isDark = theme === 'dark' || 
    (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.body.classList.toggle('dark-mode', isDark);

  // Update meta theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', isDark ? '#020617' : '#f8fafc');
  }
}

export function initThemeManager() {
  const savedTheme = localStorage.getItem(STORAGE_KEY) || 'light';
  setState('theme', savedTheme);
  applyTheme(savedTheme);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getState('theme') === 'auto') {
      applyTheme('auto');
    }
  });

  subscribe('theme', (theme) => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  });
}

export function toggleTheme() {
  const current = getState('theme');
  const next = current === 'light' ? 'dark' : 'light';
  setState('theme', next);
}

export function setTheme(theme) {
  setState('theme', theme);
}
