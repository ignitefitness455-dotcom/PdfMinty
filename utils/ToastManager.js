export class ToastManager {
  static status = 'idle'; // 'idle' | 'processing' | 'success' | 'error'
  static timeout = null;

  static init() {
    if (!document.getElementById('pdfminty-toast')) {
      const toast = document.createElement('div');
      toast.id = 'pdfminty-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
  }

  /**
   * Resets the UI state, hiding any active toasts and resetting status.
   * Call this when a new file is uploaded or a new operation starts.
   */
  static reset() {
    this.status = 'idle';
    const toast = document.getElementById('pdfminty-toast');
    if (toast) {
      toast.classList.remove('visible');
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  static show(message, type = 'info') {
    this.init();
    const toast = document.getElementById('pdfminty-toast');
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    else if (type === 'danger' || type === 'error') icon = '⚠️';
    else if (type === 'warning') icon = '⏳';

    toast.innerHTML = '';
    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    const msgSpan = document.createElement('span');
    msgSpan.textContent = message;
    
    toast.appendChild(iconSpan);
    toast.appendChild(document.createTextNode(' '));
    toast.appendChild(msgSpan);
    
    toast.className = `toast toast-${type}`;

    // Ensure we are visible
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      toast.classList.remove('visible');
      if (this.status === type) this.status = 'idle';
    }, 4000);
  }

  static success(message) {
    // Engineering Directive: Success Toast strictly requires status === 'success'
    this.status = 'success';
    this.show(message, 'success');
    
    // Engineering Directive: Confetti trigger strictly requires status === 'success'
    if (typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#0ea5e9', '#10b981'],
        // Bug fix: Ensure confetti doesn't block UI
        zIndex: 0, 
      });
    }
  }

  static error(err) {
    this.status = 'error';
    let msg = typeof err === 'string' ? err : err.message || 'An unknown error occurred.';
    let type = 'danger';

    const lowered = msg.toLowerCase();
    if (lowered.includes('encrypted') || lowered.includes('password')) {
      msg = 'Error: PDF is encrypted. Please unlock it first.';
    } else if (lowered.includes('size') || lowered.includes('large') || lowered.includes('memory')) {
      type = 'warning';
      msg = 'Warning: Large file detected. Processing may take longer.';
    } else if (lowered.includes('corrupt') || lowered.includes('invalid')) {
      msg = 'Error: Invalid or corrupted PDF file.';
    }

    console.error('[PDFMinty Error]:', err);
    this.show(msg, type);
  }
}
