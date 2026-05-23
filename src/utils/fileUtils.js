export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function downloadFile(uint8Array, filename) {
  const blob = new Blob([uint8Array], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export async function renderPdfThumbnail(file, imgElement) {
  let pdf = null;
  try {
    if (typeof window.pdfjsLib === 'undefined') {
      await loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    
    // Calculate a lower resolution scale to reduce memory
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const maxThumbnailWidth = 300;
    let scale = 1.0;
    if (unscaledViewport.width > maxThumbnailWidth) {
      scale = maxThumbnailWidth / unscaledViewport.width;
    }
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
    
    const isWebpSupported = (() => {
      const elem = document.createElement('canvas');
      if (elem.getContext && elem.getContext('2d')) {
          return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
      }
      return false;
    })();
    
    if (isWebpSupported) {
      imgElement.src = canvas.toDataURL('image/webp', 0.8);
    } else {
      imgElement.src = canvas.toDataURL('image/jpeg', 0.8);
    }
    
    canvas.width = 0;
    canvas.height = 0;
  } catch (error) {
    console.error('Error generating PDF thumbnail:', error);
    imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=';
  } finally {
    if (pdf && typeof pdf.destroy === 'function') {
      pdf.destroy();
    }
  }
}
