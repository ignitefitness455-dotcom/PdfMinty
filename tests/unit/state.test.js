import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getState, setState, subscribe, batchSet } from '../../src/core/state.js';

describe('State Management Unit Tests', () => {
  beforeEach(() => {
    // Reset state values we will modify
    setState('theme', 'light');
    setState('files', []);
  });

  it('should retrieve individual state value', () => {
    const currentTheme = getState('theme');
    expect(currentTheme).toBe('light');
  });

  it('should update state and notify subscriber', () => {
    const callback = vi.fn();
    const unsubscribe = subscribe('theme', callback);

    setState('theme', 'dark');

    expect(getState('theme')).toBe('dark');
    expect(callback).toHaveBeenCalledWith('dark', 'theme');

    unsubscribe();
  });

  it('should not notify subscriber if value has not changed', () => {
    const callback = vi.fn();
    const unsubscribe = subscribe('theme', callback);

    setState('theme', 'light'); // same value

    expect(callback).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('should support batch state updates and trigger multiple notifications', () => {
    const themeCallback = vi.fn();
    const filesCallback = vi.fn();

    const unsubTheme = subscribe('theme', themeCallback);
    const unsubFiles = subscribe('files', filesCallback);

    batchSet({
      theme: 'dark',
      files: ['pdf1.pdf', 'pdf2.pdf']
    });

    expect(getState('theme')).toBe('dark');
    expect(getState('files')).toEqual(['pdf1.pdf', 'pdf2.pdf']);
    expect(themeCallback).toHaveBeenCalled();
    expect(filesCallback).toHaveBeenCalled();

    unsubTheme();
    unsubFiles();
  });
});
