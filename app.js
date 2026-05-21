import { ToastManager } from './utils/ToastManager.js';

/**
 * app.js - PDFMinty Global Engine (Enterprise Optimized)
 * Handles Routing (Sub-directory based), State Management, File Validation, and UI Utilities
 */
(function () {
  // Enforce Sub-directory routing and clean legacy hashes
  if (window.location.hash) {
    window.history.replaceState(null, null, window.location.pathname + window.location.search);
  }

  window.PdfMinty = window.PdfMinty || {};
  window.PdfMinty.utils = window.PdfMinty.utils || {};
  window.PdfMinty.ui = window.PdfMinty.ui || {};

  const ICONS = {
    merge: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    split: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
    compress: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 15 6 6m-6-6v4m0-4h4M9 9 3 3m6 6V5m0 4H5"/></svg>',
    rotate: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    reorder: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>',
    delete_pages: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
    extract_pages: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>',
    image_to_pdf: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    pdf_to_image: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="2"/><path d="m16 17-2.2-2.2a1.5 1.5 0 0 0-2.12 0L8 18"/></svg>',
    protect: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    unlock: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
    watermark: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',
    add_page_numbers: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M9 18h6"/></svg>',
    add_blank_page: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9 15h6"/></svg>',
    crop_resize: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>',
  };
  window.PdfMinty.ICONS = ICONS;

  const toolsList = [
    { id: 'merge', title: 'Merge PDF', icon: ICONS.merge, desc: 'Combine multiple PDFs into one', cat: 'organize' },
    { id: 'split', title: 'Split PDF', icon: ICONS.split, desc: 'Extract pages from your PDF', cat: 'organize' },
    { id: 'compress', title: 'Compress PDF', icon: ICONS.compress, desc: 'Reduce file size without losing quality', cat: 'optimize' },
    { id: 'rotate', title: 'Rotate PDF', icon: ICONS.rotate, desc: 'Rotate pages to correct orientation', cat: 'edit' },
    { id: 'reorder', title: 'Reorder PDF', icon: ICONS.reorder, desc: 'Change the order of PDF pages', cat: 'organize' },
    { id: 'delete-pages', title: 'Delete Pages', icon: ICONS.delete_pages, desc: 'Remove unwanted pages', cat: 'organize' },
    { id: 'extract-pages', title: 'Extract Pages', icon: ICONS.extract_pages, desc: 'Get specific pages as a new PDF', cat: 'organize' },
    { id: 'image-to-pdf', title: 'Image to PDF', icon: ICONS.image_to_pdf, desc: 'Convert JPG/PNG to PDF', cat: 'convert' },
    { id: 'pdf-to-image', title: 'PDF to Image', icon: ICONS.pdf_to_image, desc: 'Convert PDF pages to JPG', cat: 'convert' },
    { id: 'protect', title: 'Protect PDF', icon: ICONS.protect, desc: 'Add password to your PDF', cat: 'security' },
    { id: 'unlock', title: 'Unlock PDF', icon: ICONS.unlock, desc: 'Remove password from PDF', cat: 'security' },
    { id: 'watermark', title: 'Watermark', icon: ICONS.watermark, desc: 'Stamp text on your PDF', cat: 'edit' },
    { id: 'add-page-numbers', title: 'Page Numbers', icon: ICONS.add_page_numbers, desc: 'Insert page numbers', cat: 'edit' },
    { id: 'add-blank-page', title: 'Add Blank Page', icon: ICONS.add_blank_page, desc: 'Insert blank pages anywhere', cat: 'edit' },
    { id: 'crop-resize', title: 'Crop & Resize', icon: ICONS.crop_resize, desc: 'Adjust margins and dimensions', cat: 'optimize' },
  ];

  function renderHomePage(container) {
    try {
      let html = `
        <header class="hero">
            <div class="hero-badge">✨ 100% Free & Secure</div>
            <h1 class="hero-title">The Ultimate <span class="text-gradient">PDF Tools</span> Collection</h1>
            <p>Merge, split, compress, and edit PDFs directly in your browser. <strong>No server uploads. No registration.</strong></p>
            <div class="trust-indicators">
                <span>🔒 Local Processing</span>
                <span>⚡ Lightning Fast</span>
                <span>🛡️ Privacy First</span>
            </div>
        </header>

        <div class="tools-section" id="tools-section">
            <div class="section-header">
                <h2 class="section-title">Popular Tools</h2>
                <div class="search-container">
                    <input type="text" id="tool-search" placeholder="Search tools (e.g. merge, split)...">
                    <span class="search-icon">🔍</span>
                </div>
            </div>

            <div class="category-tabs">
                <div class="category-tab active" data-cat="all">All Tools</div>
                <div class="category-tab" data-cat="organize">Organize</div>
                <div class="category-tab" data-cat="optimize">Optimize</div>
                <div class="category-tab" data-cat="edit">Edit</div>
                <div class="category-tab" data-cat="convert">Convert</div>
                <div class="category-tab" data-cat="security">Security</div>
            </div>

            <div class="tools-grid" id="tools-grid">
      `;
      toolsList.forEach((t) => {
        html += `
            <a href="/${t.id}-pdf" class="tool-card" data-cat="${t.cat}" data-title="${t.title.toLowerCase()}" data-desc="${t.desc.toLowerCase()}" aria-label="Tool: ${t.title}. ${t.desc}">
                <div class="tool-icon-wrapper" aria-hidden="true">${t.icon}</div>
                <div class="tool-info">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                        <h3 style="margin-bottom: 0;">${t.title}</h3>
                        <span class="category-badge" aria-label="Category: ${t.cat}">${t.cat}</span>
                    </div>
                    <p>${t.desc}</p>
                </div>
            </a>
        `;
      });
      html += `
            </div>
        </div>

        <section class="how-it-works">
            <h2 class="section-title">How PDFMinty Works</h2>
            <p style="color: var(--muted); margin-bottom: 3rem;">Three simple steps to manage your documents</p>
            <div class="steps-grid">
                <div class="step-card">
                    <div class="step-number">1</div>
                    <h3>Select Files</h3>
                    <p style="color: var(--muted);">Choose your PDF files from your computer or mobile device. Files are stored temporarily in your browser's IndexedDB storage.</p>
                </div>
                <div class="step-card">
                    <div class="step-number">2</div>
                    <h3>Process Locally</h3>
                    <p style="color: var(--muted);">Our browser-based engine handles the work. They are never sent to any external server or third-party service.</p>
                </div>
                <div class="step-card">
                    <div class="step-number">3</div>
                    <h3>Download & Clean</h3>
                    <p style="color: var(--muted);">Get your processed PDF instantly. All temporary data is cleared automatically when you close the browser tab.</p>
                </div>
            </div>
        </section>

        <section class="bottom-cta">
            <h2>Ready to Mint Your PDF?</h2>
            <p>Experience the fastest and most secure PDF tools today.</p>
            <button id="cta-get-started" class="btn-cta-white" style="border: none; cursor: pointer;">Get Started Now</button>
        </section>
      `;
      container.innerHTML = html;

      const ctaBtn = document.getElementById('cta-get-started');
      if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
          const ts = document.getElementById('tools-section');
          if (ts) ts.scrollIntoView({ behavior: 'smooth' });
        });
      }

      const searchInput = document.getElementById('tool-search');
      const toolsGrid = document.getElementById('tools-grid');
      if (searchInput && toolsGrid) {
        const cards = toolsGrid.querySelectorAll('.tool-card');
        const filterTools = () => {
          const query = searchInput.value.toLowerCase();
          const activeTab = document.querySelector('.category-tab.active');
          const activeCat = activeTab ? activeTab.getAttribute('data-cat') : 'all';
          cards.forEach((card) => {
            const title = card.getAttribute('data-title') || '';
            const desc = card.getAttribute('data-desc') || '';
            const cat = card.getAttribute('data-cat') || '';
            const matchesSearch = title.includes(query) || desc.includes(query);
            const matchesCat = activeCat === 'all' || cat === activeCat;
            card.style.display = matchesSearch && matchesCat ? 'flex' : 'none';
          });
        };

        searchInput.addEventListener('input', filterTools);
        const tabs = document.querySelectorAll('.category-tab');
        tabs.forEach((tab) => {
          tab.addEventListener('click', () => {
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            filterTools();
          });
        });
      }
    } catch (err) {
      console.error('Home Page Render Error:', err);
      container.innerHTML = `<div style="padding: 2rem; text-align: center; color: red;"><h2>Failed to load landing page</h2><p>${err.message}</p></div>`;
    }
  }

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
            try { window.currentTool.destroy(); } catch(e) { console.error(e); }
          }
          if (typeof module.init === 'function') {
            window.currentTool = module;
            module.init();
          } else if (module.default) {
            module.default();
          } else if (typeof module.renderTool === 'function') {
            module.renderTool();
          } else {
            throw new Error("Module initialization failed.");
          }
        })
        .catch((err) => {
          appContainer.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem; color: var(--text);">
                <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                <h2>Tool Loading Failed</h2>
                <p style="color: var(--muted); margin-bottom: 2rem;">Error: ${err.message}</p>
                <a href="/" class="btn-secondary" style="text-decoration: none; display: inline-block;">Go Back Home</a>
            </div>
          `;
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
    },
  };

  function router() {
    let path = window.location.pathname;
    let viewId = '';
    
    if (path !== '/' && path !== '/index.html') {
      viewId = path.replace(/^\//, '').replace(/\/$/, '').replace(/-pdf$/, '');
    }

    const appContainer = document.getElementById('app');
    appContainer.style.opacity = '0';
    appContainer.style.transform = 'translateY(10px)';
    appContainer.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

    setTimeout(() => {
      appContainer.innerHTML = ''; 
      if (!viewId) {
        renderHomePage(appContainer);
        document.title = 'PDFMinty — Free Online PDF Tools | Merge, Compress & Split PDF';
      } else {
        const isValidTool = toolsList.some((t) => t.id === viewId);
        if (isValidTool) {
          SEO.updateTags(viewId);
          loadToolScript(viewId);
        } else {
          history.replaceState(null, '', '/');
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

  // Theme Toggle with Dynamic Import for Confetti Performance boost
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    let currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggle.innerHTML = '🌙';
    } else {
      themeToggle.innerHTML = '☀️';
    }

    themeToggle.addEventListener('click', async () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      themeToggle.innerHTML = isDark ? '🌙' : '☀️';

      try {
        const confettiModule = await import('canvas-confetti');
        const confetti = confettiModule.default;
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 },
          colors: isDark ? ['#6366f1', '#0ea5e9'] : ['#6366f1', '#f59e0b'],
        });
      } catch (err) {
        console.warn('Confetti failed to load', err);
      }
    });
  }

  window.loadExternalScript = function (src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(); return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };

  window.router = router;
  window.addEventListener('popstate', router);
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/')) {
        e.preventDefault();
        history.pushState(null, '', href);
        router();
      }
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', router);
  } else {
    router();
  }

  // ==========================================
  // DEVICE-AWARE FILE SIZE VALIDATION & MEMORY SAFE THUMBNAILS
  // ==========================================
  window.PdfMinty.utils.renderPdfThumbnail = async function (file, imgElement) {
    let pdf = null;
    let loadingTask = null;
    try {
      if (typeof pdfjsLib === 'undefined') {
        await window.loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      const arrayBuffer = await file.arrayBuffer();
      loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const maxThumbnailWidth = 300;
      let scale = unscaledViewport.width > maxThumbnailWidth ? maxThumbnailWidth / unscaledViewport.width : 1.0;
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      imgElement.src = canvas.toDataURL('image/jpeg', 0.8);
      
      canvas.width = 0; canvas.height = 0; // Explicit memory free
    } catch (error) {
      console.error('Thumbnail Generation Failed:', error);
    } finally {
      if (pdf && typeof pdf.destroy === 'function') await pdf.destroy();
      if (loadingTask && typeof loadingTask.destroy === 'function') await loadingTask.destroy();
    }
  };

  window.PdfMinty.utils.formatBytes = function (bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  window.renderPdfThumbnail = window.PdfMinty.utils.renderPdfThumbnail;

  // ==========================================
  // GLOBAL UI UTILITIES & DOWNLOAD FIX
  // ==========================================
  window.PdfMinty.ui.showError = function (message) { ToastManager.error(message); };
  window.PdfMinty.ui.showSuccess = function (message) { ToastManager.success(message); };

  window.PdfMinty.ui.showProgress = function (percentOrData, labelText) {
    let overlay = document.getElementById('modern-progress-overlay');
    let percent = percentOrData?.percent !== undefined ? percentOrData.percent : percentOrData;
    
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modern-progress-overlay';
      overlay.innerHTML = `
        <div class="progress-glass-card">
            <div id="modern-progress-msg" class="progress-msg-text">Processing...</div>
            <div class="modern-progress-track">
                <div id="modern-progress-bar" class="modern-progress-fill"></div>
            </div>
        </div>
      `;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.style.opacity = '1');
    }
    const bar = document.getElementById('modern-progress-bar');
    if (bar) bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    if (percent >= 100) setTimeout(window.PdfMinty.ui.hideProgress, 800);
  };

  window.PdfMinty.ui.hideProgress = function () {
    const overlay = document.getElementById('modern-progress-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 400);
    }
  };

  window.PdfMinty.utils.downloadFile = function (uint8Array, filename) {
    const blob = new Blob([uint8Array], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Fixed: Increased timeout to ensure browser has time to stream to disk
    setTimeout(() => URL.revokeObjectURL(url), 2500); 
  };

  window.showError = window.PdfMinty.ui.showError;
  window.showSuccess = window.PdfMinty.ui.showSuccess;
  window.showProgress = window.PdfMinty.ui.showProgress;
  window.hideProgress = window.PdfMinty.ui.hideProgress;
  window.downloadFile = window.PdfMinty.utils.downloadFile;

  // ==========================================
  // PDF WEB WORKER (Crash Recovery Enabled)
  // ==========================================
  let pdfWorker = null;
  let workerTaskId = 0;
  const workerCallbacks = {};

  window.PdfMinty.utils.initPdfWorker = function () {
    if (!pdfWorker) {
      pdfWorker = new Worker(new URL('./pdf-worker.js', import.meta.url), { type: 'module' });
      pdfWorker.onmessage = function (e) {
        const { id, status, result, error, progress, type } = e.data;
        if (status === 'progress' || type === 'progress') {
          if (workerCallbacks[id] && workerCallbacks[id].onProgress) workerCallbacks[id].onProgress(e.data);
          return;
        }
        if (workerCallbacks[id]) {
          if (status === 'success') workerCallbacks[id].resolve(result);
          else workerCallbacks[id].reject(new Error(error?.message || error));
          delete workerCallbacks[id];
        }
      };
      pdfWorker.onerror = function (err) {
        console.error('Critical Worker Crash:', err);
        for (let id in workerCallbacks) {
          workerCallbacks[id].reject(new Error('Worker crashed out of memory. Please try a smaller file.'));
          delete workerCallbacks[id];
        }
        // Architecture Fix: Terminate and clear the dead worker so it can be re-instantiated
        pdfWorker.terminate();
        pdfWorker = null; 
      };
    }
  };

  window.PdfMinty.utils.runPdfWorkerTask = function (task, payload, transferables = [], onProgress = null) {
    window.PdfMinty.utils.initPdfWorker();
    return new Promise((resolve, reject) => {
      const id = ++workerTaskId;
      workerCallbacks[id] = { resolve, reject, onProgress: onProgress || window.showProgress };
      payload.id = id;
      pdfWorker.postMessage({ id, task, payload }, transferables);
    });
  };

  window.initPdfWorker = window.PdfMinty.utils.initPdfWorker;
  window.runPdfWorkerTask = window.PdfMinty.utils.runPdfWorkerTask;

})();
