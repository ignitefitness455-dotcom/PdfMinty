/**
 * Toast notification system
 */
const toasts = [];
let container = null;

function getContainer() {
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${getIcon(type)}</span>
    <span>${message}</span>
  `;

  getContainer().appendChild(toast);

  // Animate in
  requestAnimationFrame(() => toast.classList.add('visible'));

  const remove = () => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  };

  if (duration > 0) {
    setTimeout(remove, duration);
  }

  return remove;
}

export function showError(message) { return showToast(message, 'danger', 6000); }
export function showSuccess(message) { return showToast(message, 'success', 4000); }
export function showWarning(message) { return showToast(message, 'warning', 5000); }
export function showInfo(message) { return showToast(message, 'info', 4000); }

function getIcon(type) {
  const icons = {
    danger: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  };
  return icons[type] || icons.info;
}
