import { downloadFile as originalDownloadFile } from '../src/utils/fileUtils.js';
import { UI } from '../src/ui/UIManager.js';

export function downloadFile(uint8Array, filename) {
  try {
    if (!uint8Array) {
      throw new Error('downloadFile: First argument (uint8Array) is required.');
    }
    if (!filename) {
      throw new Error('downloadFile: Second argument (filename) is required.');
    }
    originalDownloadFile(uint8Array, filename);
  } catch (error) {
    console.error('[globals.js] downloadFile execution failed:', error);
    throw error;
  }
}

export function showSuccess(message) {
  try {
    if (!message) {
      throw new Error('showSuccess: message argument is required.');
    }
    if (UI && typeof UI.showSuccess === 'function') {
      UI.showSuccess(message);
    } else {
      console.log('[globals.js] Success fallback:', message);
      throw new Error('showSuccess: UIManager UI.showSuccess is not available.');
    }
  } catch (error) {
    console.error('[globals.js] showSuccess execution failed:', error);
    throw error;
  }
}

export function showError(message) {
  try {
    if (!message) {
      throw new Error('showError: message argument is required.');
    }
    const msgString = typeof message === 'string' ? message : message.message || 'Unknown error';
    if (UI && typeof UI.showError === 'function') {
      UI.showError(msgString);
    } else {
      console.error('[globals.js] Error fallback:', message);
      throw new Error(`showError: UIManager UI.showError is not available. Native error: ${msgString}`);
    }
  } catch (error) {
    console.error('[globals.js] showError fallback:', message);
    throw error;
  }
}

export function showProgress(percentOrData, labelText) {
  try {
    if (UI && typeof UI.showProgress === 'function') {
      UI.showProgress(percentOrData, labelText);
    } else {
      throw new Error('showProgress: UIManager UI.showProgress is not available.');
    }
  } catch (error) {
    console.error('[globals.js] showProgress execution failed:', error);
    throw error;
  }
}

export function hideProgress() {
  try {
    if (UI && typeof UI.hideProgress === 'function') {
      UI.hideProgress();
    } else {
      throw new Error('hideProgress: UIManager UI.hideProgress is not available.');
    }
  } catch (error) {
    console.error('[globals.js] hideProgress execution failed:', error);
    throw error;
  }
}

// STEP 3 - IMPORT HEALTH CHECK
const REQUIRED_EXPORTS = [downloadFile, showSuccess, showError, showProgress, hideProgress];

REQUIRED_EXPORTS.forEach((fn, i) => {
  if (typeof fn !== 'function') {
    throw new Error(
      `[globals.js] CRITICAL: Export #${i} is not a function. 
       Module failed to initialize correctly. 
       All PDF tools will not work until this is resolved.`
    );
  }
});
