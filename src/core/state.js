/**
 * src/core/state.js - Centralized Reactive State
 * Lightweight proxy-based store (no external dependencies)
 */
const listeners = new Map();
const state = {
  theme: localStorage.getItem('theme') || 'light',
  locale: 'en',
  currentTool: null,
  files: [],
  isProcessing: false,
  progress: 0,
  progressLabel: '',
  notifications: [],
  offline: !navigator.onLine,
};

function notify(key) {
  const keyListeners = listeners.get(key);
  if (keyListeners) {
    keyListeners.forEach(cb => cb(state[key], key));
  }
}

export function getState(key) {
  return key ? state[key] : { ...state };
}

export function setState(key, value) {
  if (state[key] !== value) {
    state[key] = value;
    notify(key);
  }
}

export function subscribe(key, callback) {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key).add(callback);

  // Return unsubscribe function
  return () => {
    listeners.get(key).delete(callback);
  };
}

export function batchSet(updates) {
  Object.entries(updates).forEach(([key, value]) => {
    state[key] = value;
  });
  // Notify all changed keys
  Object.keys(updates).forEach(key => notify(key));
}

// Network status
window.addEventListener('online', () => setState('offline', false));
window.addEventListener('offline', () => setState('offline', true));
