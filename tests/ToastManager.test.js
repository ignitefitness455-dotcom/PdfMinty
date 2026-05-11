import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ToastManager } from '../utils/ToastManager.js';

describe('ToastManager Unit Test', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize toast container in DOM', () => {
        ToastManager.init();
        const toast = document.getElementById('pdfminty-toast');
        expect(toast).toBeTruthy();
        expect(toast.className).toContain('toast');
    });

    it('should show success message properly', () => {
        // mock window.confetti
        window.confetti = vi.fn();
        
        ToastManager.success('Test successful');
        
        const toast = document.getElementById('pdfminty-toast');
        expect(toast.className).toContain('toast-success');
        expect(toast.innerHTML).toContain('Test successful');
        expect(toast.innerHTML).toContain('✅');
        expect(window.confetti).toHaveBeenCalled();
    });

    it('should show error with warning for large files', () => {
        ToastManager.error('Warning: File size is large');
        const toast = document.getElementById('pdfminty-toast');
        expect(toast.className).toContain('toast-warning');
        expect(toast.innerHTML).toContain('⏳');
    });
});
