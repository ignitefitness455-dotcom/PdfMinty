// Vitest setup file
import { vi } from 'vitest';

// Mock localStorage
if (typeof localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
}

// Mock matchMedia
globalThis.matchMedia = globalThis.matchMedia || function() {
  return {
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
};

// Mock crypto.randomUUID if not available
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  globalThis.crypto = globalThis.crypto || {};
  globalThis.crypto.randomUUID = () => 'test-uuid-1234';
}
