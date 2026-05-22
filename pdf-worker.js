/**
 * Web Worker for PDF Processing.
 * Receives tasks from the main thread, dynamically loads the decentralized worker logic
 * for the requested task, executes the operations using pdf-lib,
 * and posts the result or structured error back.
 */
import { executeMerge } from './workers/merge.js';
import { executeSplit } from './workers/split.js';
import { executeCompress } from './workers/compress.js';
import { executeWatermark } from './workers/watermark.js';
import { executeAddPageNumbers } from './workers/add-page-numbers.js';
import { executeReorder } from './workers/reorder.js';
import { executeProtect } from './workers/protect.js';
import { executeAddBlankPage } from './workers/add-blank-page.js';
import { executeDeletePages } from './workers/delete-pages.js';
import { executeExtractPages } from './workers/extract-pages.js';
import { executeRotate } from './workers/rotate.js';
import { executeUnlock } from './workers/unlock.js';
import { executeImageToPdf } from './workers/image-to-pdf.js';

self.onmessage = async function (e) {
  const { id, task, payload } = e.data;
  const fileName = payload?.fileName || 'unknown_file.pdf';

  try {
    const postMessage = (msg) => self.postMessage(msg);
    let result;
    
    // Convert camelCase task names if needed, though they map directly to our filenames
    switch(task) {
      case 'merge':
        result = await executeMerge(payload, postMessage);
        break;
      case 'split':
        result = await executeSplit(payload, postMessage);
        break;
      case 'compress':
        result = await executeCompress(payload, postMessage);
        break;
      case 'watermark':
        result = await executeWatermark(payload, postMessage);
        break;
      case 'add-page-numbers':
        result = await executeAddPageNumbers(payload, postMessage);
        break;
      case 'reorder':
        result = await executeReorder(payload, postMessage);
        break;
      case 'protect':
        result = await executeProtect(payload, postMessage);
        break;
      case 'add-blank-page':
        result = await executeAddBlankPage(payload, postMessage);
        break;
      case 'delete-pages':
        result = await executeDeletePages(payload, postMessage);
        break;
      case 'extract-pages':
        result = await executeExtractPages(payload, postMessage);
        break;
      case 'rotate':
        result = await executeRotate(payload, postMessage);
        break;
      case 'unlock':
        result = await executeUnlock(payload, postMessage);
        break;
      case 'image-to-pdf':
        result = await executeImageToPdf(payload, postMessage);
        break;
      default:
         throw new Error('Failed to load decentralized worker module for ' + task);
    }

    // Return transferables
    if (result instanceof Uint8Array) {
      self.postMessage({ id, status: 'success', result }, [result.buffer]);
    } else if (Array.isArray(result) && result[0] && result[0].bytes instanceof Uint8Array) {
      // For split, return array of { name, bytes }
      const buffers = result.map((r) => r.bytes.buffer);
      self.postMessage({ id, status: 'success', result }, buffers);
    } else {
      self.postMessage({ id, status: 'success', result });
    }
  } catch (err) {
    // Structured error reporting for async operations
    const structuredError = {
      id,
      status: 'error',
      error: {
        operationName: task,
        fileName: fileName,
        errorType: err.name || 'Error',
        message: err.message,
        stack: err.stack,
      },
    };
    console.error(`[Worker Error] Task: ${task} | File: ${fileName}`, err);
    self.postMessage(structuredError);
  }
};
