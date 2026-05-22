import { db } from '../src/core/Database.js';
import { UI } from '../src/ui/UIManager.js';

/**
 * Shared Utilities for PDF Tools
 * Contains helper functions for processing Web Worker tasks and fetching bytes.
 */
/**
 * Fetches the PDF bytes either from DB cache or raw object.
 * @param {string|ArrayBuffer} originalPdfBytes - ID or File Buffer
 * @returns {Promise<Uint8Array>}
 */
export async function getPdfBytes(input) {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (typeof input === 'string') {
    const ab = await db.getFile(input);
    return new Uint8Array(ab);
  }
  throw new Error('Could not retrieve file data.');
}

export async function processPdfTask(btnElem, processFn) {
  if (btnElem && !btnElem.hasAttribute('data-original-text')) {
    btnElem.setAttribute('data-original-text', btnElem.textContent);
  }
  if (btnElem) {
    btnElem.disabled = true;
    btnElem.textContent = 'Processing...';
  }
  UI.showProgress(10);

  try {
    await processFn();
  } catch (error) {
    console.error('PDF Processing Error:', error);
    UI.showError(error.message || 'An error occurred while processing the PDF.');
  } finally {
    UI.hideProgress();
    if (btnElem) {
      btnElem.disabled = false;
      btnElem.textContent = btnElem.getAttribute('data-original-text');
    }
  }
}

