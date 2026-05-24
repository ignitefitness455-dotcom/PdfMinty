import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initRouter, navigateTo, getRouteInfo } from '../../src/core/router.js';

describe('Router Unit Tests', () => {
  const mockToolsList = [
    { id: 'merge', title: 'Merge PDF' },
    { id: 'split', title: 'Split PDF' }
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('should parse route info correctly for home page', () => {
    const info = getRouteInfo('/');
    expect(info.isHome).toBe(true);
    expect(info.isTool).toBe(false);
  });

  it('should parse route info correctly for localized home page', () => {
    const info = getRouteInfo('/bn');
    expect(info.isHome).toBe(true);
    expect(info.locale).toBe('bn');
  });

  it('should parse route info correctly for a tool route', () => {
    // router module needs to be initialized with toolsList first so isTool works
    initRouter({ onRouteChange: () => {}, toolsList: mockToolsList });
    const info = getRouteInfo('/merge');
    expect(info.isTool).toBe(true);
    expect(info.toolId).toBe('merge');
  });

  it('should navigate smoothly and fire callback', () => {
    const callback = vi.fn();
    initRouter({ onRouteChange: callback, toolsList: mockToolsList });
    navigateTo('/split');
    expect(window.location.pathname).toBe('/split');
    expect(callback).toHaveBeenCalledWith('/split');
  });
});
