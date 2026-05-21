/**
 * Shared Utilities for PDF Tools
 * Contains helper functions for processing Web Worker tasks and fetching bytes.
 */

/**
 * Fetches the PDF bytes either from DB cache or raw object.
 * @param {string|ArrayBuffer} input - ID or File Buffer
 * @returns {Promise<Uint8Array>}
 */
export async function getPdfBytes(input) {
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (input instanceof Uint8Array) return input;
  if (typeof input === 'string' && window.pdfDB) {
    const result = await window.pdfDB.getFile(input);
    if (!result) throw new Error('Could not retrieve file data from storage.');
    return result instanceof Uint8Array ? result : new Uint8Array(result);
  }
  throw new Error('Could not retrieve file data.');
}

/**
 * Normalises any error value to a display-safe string.
 * Prevents "[Object Object]" from appearing in UI messages.
 * @param {*} err
 * @returns {string}
 */
export function getErrorMessage(err) {
  if (!err) return 'An unknown error occurred.';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message || 'An unknown error occurred.';
  if (typeof err === 'object') {
    // Worker structured-error shape: { message, operationName, ... }
    if (err.message) return err.message;
    try { return JSON.stringify(err); } catch (_) { return 'An unknown error occurred.'; }
  }
  return String(err);
}

/**
 * Validates that a result byte array is non-empty before reporting success.
 * @param {Uint8Array|null|undefined} bytes
 * @returns {boolean}
 */
export function isValidOutput(bytes) {
  return bytes instanceof Uint8Array && bytes.length > 0;
}

/**
 * Wraps an async PDF processing function with button state management,
 * progress overlay, and unified error handling.
 * @param {HTMLElement|null} btnElem
 * @param {Function} processFn
 */
export async function processPdfTask(btnElem, processFn) {
  if (btnElem && !btnElem.hasAttribute('data-original-text')) {
    btnElem.setAttribute('data-original-text', btnElem.textContent);
  }
  if (btnElem) {
    btnElem.disabled = true;
    btnElem.textContent = 'Processing...';
  }
  if (typeof window.showProgress === 'function') window.showProgress(10);

  try {
    await processFn();
  } catch (error) {
    console.error('PDF Processing Error:', error);
    // Bug 2 fix: always convert error to a safe string before displaying
    const message = getErrorMessage(error);
    if (typeof window.showError === 'function') {
      window.showError(message);
    } else {
      alert('Error: ' + message);
    }
  } finally {
    if (typeof window.hideProgress === 'function') window.hideProgress();
    if (btnElem) {
      btnElem.disabled = false;
      btnElem.textContent = btnElem.getAttribute('data-original-text') ?? 'Apply';
    }
  }
}

/**
 * Sets up the back button on a tool page to use the SPA history API
 * instead of hash-based navigation, and registers a popstate listener
 * so the browser back button works correctly.
 *
 * Bug 5 fix: call this once per tool page init.
 */
export function setupBackButton() {
  const btn = document.getElementById('btn-back');
  if (!btn) return;

  // Push the tool URL into history so the back button has somewhere to go
  if (window.location.pathname !== '/' && window.history.state === null) {
    window.history.pushState({ tool: window.location.pathname }, '', window.location.pathname);
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    // Navigate back via history API — falls back to home if no history entry
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.history.pushState(null, '', '/');
      if (typeof window.router === 'function') window.router();
    }
  });

  // Ensure popstate (browser back/forward) is handled by the SPA router
  if (!window._popstateRegistered) {
    window.addEventListener('popstate', () => {
      if (typeof window.router === 'function') {
        window.router();
      } else {
        // Fallback: reload to let app.js router handle the new URL
        window.location.reload();
      }
    });
    window._popstateRegistered = true;
  }
}
