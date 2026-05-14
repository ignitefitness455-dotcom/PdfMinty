export class ToastManager {
  static init() {
    if (!document.getElementById('pdfminty-toast')) {
      const toast = document.createElement('div');
      toast.id = 'pdfminty-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
  }

  static show(message, isSuccess = false) {
    this.init();
    const toast = document.getElementById('pdfminty-toast');
    const icon = isSuccess ? '✅' : '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toast.className = 'toast ' + (isSuccess ? 'toast-success' : 'toast-danger');

    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 4000);
  }

  static success(message) {
    this.show(message, true);
    if (typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#0ea5e9', '#10b981'],
      });
    }
  }

  static error(err) {
    let msg = typeof err === 'string' ? err : err.message || 'An unknown error occurred.';
    let type = 'danger';

    // Smart error resolution
    const lowered = msg.toLowerCase();

    if (
      lowered.includes('encrypted') ||
      lowered.includes('password') ||
      lowered.includes('encrypt dictionary')
    ) {
      msg =
        'Error: PDF is encrypted or password-protected. Please unlock it using the Unlock tool first.';
    } else if (
      lowered.includes('pdf size') ||
      lowered.includes('too large') ||
      lowered.includes('out of memory') ||
      lowered.includes('allocation failed') ||
      lowered.includes('warning:')
    ) {
      type = 'warning';
      if (!msg.toLowerCase().includes('warning:')) {
        msg =
          'Warning: File size is very large. Processing might take a while or limit browser memory resources.';
      }
    } else if (
      lowered.includes('corrupt') ||
      lowered.includes('invalid pdf') ||
      lowered.includes('failed to parse')
    ) {
      msg = 'Error: The PDF file appears to be corrupted, poorly formatted, or invalid.';
    } else if (lowered.includes('failed to fetch') || lowered.includes('network')) {
      msg = 'Network Error: Please check your internet connection.';
    } else if (msg.trim() === 'Need more files') {
      msg = 'Error: Please add at least 2 PDFs to process.';
    } else if (lowered.includes('worker not found')) {
      msg = 'System Error: Background processing worker could not be loaded.';
    }

    console.error('[PDFMinty Error Logger]:', err);

    this.init();
    const toast = document.getElementById('pdfminty-toast');
    const icon = type === 'warning' ? '⏳' : '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
    toast.className = `toast toast-${type}`;

    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 4000);
  }
}
