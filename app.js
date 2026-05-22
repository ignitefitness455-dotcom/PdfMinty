import { toolsList } from "./src/core/toolsConfig.js";
import { renderHomePage } from "./src/ui/HomePage.js";
import { initContactModal } from "./src/ui/ContactModal.js";
import { initThemeAndScroll } from "./src/ui/ThemeManager.js";
import { ToastManager } from './src/utils/ToastManager.js';

// Lazy load canvas-confetti only when actually called to optimize bundle size
window.confetti = function (...args) {
  return import('canvas-confetti').then((module) => {
    window.confetti = module.default;
    return window.confetti(...args);
  });
};

/**
 * app.js - PDFMinty Global Engine (Optimized & Decoupled Architecture)
 * Responsible only for Routing, Lazy dynamic tool orchestration, and global SPA bootstrap
 */
(function () {
  // Clear lingering hashes on page reload or fresh entry to prevent route issues
  if (window.location.hash) {
    window.history.replaceState(null, null, window.location.pathname + window.location.search);
  }

  window.PdfMinty = window.PdfMinty || {};
  window.PdfMinty.utils = window.PdfMinty.utils || {};
  window.PdfMinty.ui = window.PdfMinty.ui || {};

  const toolLoaders = {
    merge: () => import('./tools/merge.js'),
    split: () => import('./tools/split.js'),
    compress: () => import('./tools/compress.js'),
    rotate: () => import('./tools/rotate.js'),
    reorder: () => import('./tools/reorder.js'),
    'delete-pages': () => import('./tools/delete-pages.js'),
    'extract-pages': () => import('./tools/extract-pages.js'),
    'image-to-pdf': () => import('./tools/image-to-pdf.js'),
    'pdf-to-image': () => import('./tools/pdf-to-image.js'),
    protect: () => import('./tools/protect.js'),
    unlock: () => import('./tools/unlock.js'),
    watermark: () => import('./tools/watermark.js'),
    'add-page-numbers': () => import('./tools/add-page-numbers.js'),
    'add-blank-page': () => import('./tools/add-blank-page.js'),
    'crop-resize': () => import('./tools/crop-resize.js'),
  };

  function loadToolScript(toolId) {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; color: var(--muted);" role="status" aria-busy="true">
            <div class="loading-spinner" style="width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
            <p>Loading ${toolId} tool...</p>
        </div>
    `;

    if (toolLoaders[toolId]) {
      return toolLoaders[toolId]()
        .then((module) => {
          if (window.currentTool && typeof window.currentTool.destroy === 'function') {
            try {
              window.currentTool.destroy();
            } catch(e) {
              console.error('Error during tool destruction:', e);
            }
          }

          if (typeof module.init === 'function') {
            window.currentTool = module;
            module.init();
          } else if (module.default) {
            module.default();
          } else if (typeof module.renderTool === 'function') {
            module.renderTool();
          } else {
            throw new Error("Module doesn't have an init function.");
          }
        })
        .catch((err) => {
          console.error(`[PDFMinty] Failed to load tool script: ./tools/${toolId}.js`, err);
          appContainer.innerHTML = `
              <div style="text-align: center; padding: 4rem 2rem; color: var(--text);">
                  <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                  <h2>Tool Loading Failed</h2>
                  <p style="color: var(--muted); margin-bottom: 2rem;">We couldn't load the "${toolId}" tool. Error: ${err.message}</p>
                  <a href="/" class="btn-secondary" style="text-decoration: none; display: inline-block;">Go Back Home</a>
                  <button onclick="location.reload()" class="btn-action" style="margin-left: 1rem; border: none; cursor: pointer;">Retry</button>
              </div>
          `;
          ToastManager.error(`Error loading tool: ${toolId}`);
        });
    }
  }

  const SEO = {
    updateTags(toolId) {
      const tool = toolsList.find((t) => t.id === toolId);
      if (!tool) return;

      document.title = `${tool.title} — PdfMinty Free Online Tools`;

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', tool.desc);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', `${tool.title} — PdfMinty`);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', tool.desc);
    },
  };

  function router() {
    // Clear Temporary database items on every transition to prevent memory leaks
    import('./src/core/Database.js').then((module) => {
      module.db.clearAll().catch((e) => console.log('Clear db on route:', e));
    }).catch(() => {});

    let path = window.location.pathname;
    let viewId = '';
    
    if (path !== '/' && path !== '/index.html') {
      viewId = path.replace(/^\//, '').replace(/\/$/, '').replace(/-pdf$/, '');
    }

    const appContainer = document.getElementById('app');

    // Soft view transition animations
    appContainer.style.opacity = '0';
    appContainer.style.transform = 'translateY(10px)';
    appContainer.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

    setTimeout(() => {
      appContainer.innerHTML = '';

      if (!viewId) {
        renderHomePage(appContainer, toolsList);
        document.title = 'PDFMinty — Free Online PDF Tools | Merge, Compress & Split PDF';
        const heading = appContainer.querySelector('h1');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
      } else {
        const isValidTool = toolsList.some((t) => t.id === viewId);
        if (isValidTool) {
          SEO.updateTags(viewId);
          const loadPromise = loadToolScript(viewId);
          if (loadPromise && typeof loadPromise.then === 'function') {
            loadPromise.then(() => {
              const heading = appContainer.querySelector('h1, h2');
              if (heading) {
                heading.setAttribute('tabindex', '-1');
                heading.focus();
              }
            }).catch(() => {});
          }
        } else {
          window.history.replaceState(null, '', '/');
          path = '/';
          viewId = '';
          router();
          return;
        }
      }

      requestAnimationFrame(() => {
        appContainer.style.opacity = '1';
        appContainer.style.transform = 'translateY(0)';
      });
    }, 200);
  }

  // Set up theme controls and smooth parallax scrolling behaviors
  initThemeAndScroll();

  // Load PDF worker background reference
  if (typeof pdfjsLib === 'undefined') {
    window.loadExternalScript = function (src) {
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
    };

    window.loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')
      .then(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      })
      .catch(() => {});
  }

  window.addEventListener('popstate', router);

  // Link interceptor for dynamic routing
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/')) {
        e.preventDefault();
        window.history.pushState(null, '', href);
        router();
      }
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', router);
  } else {
    router();
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function (error) {
      console.error('Service Worker registration failed:', error);
    });
  }

  // Pre-load Contact modal dynamically
  if (typeof window.requestIdleCallback !== 'undefined') {
    window.requestIdleCallback(initContactModal);
  } else {
    setTimeout(initContactModal, 2000);
  }

  // Handle temporary IndexedDB clearout on refresh
  import('./src/core/Database.js').then((module) => {
    const db = module.db;
    window.addEventListener('load', () => {
      db.clearAll().catch((e) => console.log('Clear db load:', e));
    });
    window.addEventListener('beforeunload', () => {
      db.clearAll().catch((e) => console.log('Clear db unload:', e));
    });
  });

  // Proxy wrapper call for Gemini endpoints (backward compatibility)
  window.PdfMinty.utils.callGeminiAPI = async function (prompt, context = '', history = []) {
    try {
      const response = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context, history }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch from AI proxy');
      }
      return data;
    } catch (error) {
      console.error('Gemini API Error:', error);
      ToastManager.error('AI features are currently unavailable.');
      throw error;
    }
  };

  window.callGeminiAPI = window.PdfMinty.utils.callGeminiAPI;
})();
