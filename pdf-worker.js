/**
 * Web Worker for PDF Processing.
 * Receives tasks from the main thread, dynamically loads the decentralized worker logic
 * for the requested task, executes the operations using pdf-lib,
 * and posts the result or structured error back.
 */
self.onmessage = async function (e) {
  const { id, task, payload } = e.data;
  const fileName = payload?.fileName || 'unknown_file.pdf';

  try {
    const postMessage = (msg) => self.postMessage(msg);
    let result;
    
    // Convert camelCase task names if needed, though they map directly to our filenames
    let workerModule;
    switch(task) {
      case 'merge':
        workerModule = await import('./workers/merge.js');
        break;
      case 'split':
        workerModule = await import('./workers/split.js');
        break;
      case 'compress':
        workerModule = await import('./workers/compress.js');
        break;
      case 'watermark':
        workerModule = await import('./workers/watermark.js');
        break;
      case 'add-page-numbers':
        workerModule = await import('./workers/add-page-numbers.js');
        break;
      case 'reorder':
        workerModule = await import('./workers/reorder.js');
        break;
      case 'protect':
        workerModule = await import('./workers/protect.js');
        break;
      case 'add-blank-page':
        workerModule = await import('./workers/add-blank-page.js');
        break;
      case 'delete-pages':
        workerModule = await import('./workers/delete-pages.js');
        break;
      case 'extract-pages':
        workerModule = await import('./workers/extract-pages.js');
        break;
      case 'rotate':
        workerModule = await import('./workers/rotate.js');
        break;
      case 'unlock':
        workerModule = await import('./workers/unlock.js');
        break;
      case 'image-to-pdf':
        workerModule = await import('./workers/image-to-pdf.js');
        break;
      default:
         throw new Error('Failed to load decentralized worker module for ' + task);
    }
    
    // Find the exported execute function (e.g., executeMerge, executeSplit)
    const exportNames = Object.keys(workerModule);
    const executeFuncKey = exportNames.find(key => key.startsWith('execute'));
    
    if (!executeFuncKey) {
      throw new Error('Worker module ' + task + ' does not export an execute function');
    }
    
    result = await workerModule[executeFuncKey](payload, postMessage);

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
