import confetti from 'canvas-confetti';
import { ToastManager } from './utils/ToastManager.js';

window.confetti = confetti;

/**
 * app.js - PDFMinty Global Engine
 * Handles Routing, State Management, File Validation, and UI Utilities
 */
(function () {
  // Force the home page to load on initial visit by clearing any lingering hash.
  // This fixes the issue where the browser or preview iframe retains the old #merge state.
  if (window.location.hash) {
    window.history.replaceState(null, null, window.location.pathname + window.location.search);
  }

  window.PdfMinty = window.PdfMinty || {};
  window.PdfMinty.utils = window.PdfMinty.utils || {};
  window.PdfMinty.ui = window.PdfMinty.ui || {};

  const ICONS = {
    merge:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    split:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
    compress:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 15 6 6m-6-6v4m0-4h4M9 9 3 3m6 6V5m0 4H5"/></svg>',
    rotate:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    reorder:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>',
    delete_pages:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
    extract_pages:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>',
    image_to_pdf:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    pdf_to_image:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="2"/><path d="m16 17-2.2-2.2a1.5 1.5 0 0 0-2.12 0L8 18"/></svg>',
    protect:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    unlock:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
    watermark:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',
    add_page_numbers:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M9 18h6"/></svg>',
    add_blank_page:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9 15h6"/></svg>',
    crop_resize:
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>',
  };
  window.PdfMinty.ICONS = ICONS;

  const toolsList = [
    {
      id: 'merge',
      title: 'Merge PDF',
      icon: ICONS.merge,
      desc: 'Combine multiple PDFs into one',
      cat: 'organize',
    },
    {
      id: 'split',
      title: 'Split PDF',
      icon: ICONS.split,
      desc: 'Extract pages from your PDF',
      cat: 'organize',
    },
    {
      id: 'compress',
      title: 'Compress PDF',
      icon: ICONS.compress,
      desc: 'Reduce file size without losing quality',
      cat: 'optimize',
    },
    {
      id: 'rotate',
      title: 'Rotate PDF',
      icon: ICONS.rotate,
      desc: 'Rotate pages to correct orientation',
      cat: 'edit',
    },
    {
      id: 'reorder',
      title: 'Reorder PDF',
      icon: ICONS.reorder,
      desc: 'Change the order of PDF pages',
      cat: 'organize',
    },
    {
      id: 'delete-pages',
      title: 'Delete Pages',
      icon: ICONS.delete_pages,
      desc: 'Remove unwanted pages',
      cat: 'organize',
    },
    {
      id: 'extract-pages',
      title: 'Extract Pages',
      icon: ICONS.extract_pages,
      desc: 'Get specific pages as a new PDF',
      cat: 'organize',
    },
    {
      id: 'image-to-pdf',
      title: 'Image to PDF',
      icon: ICONS.image_to_pdf,
      desc: 'Convert JPG/PNG to PDF',
      cat: 'convert',
    },
    {
      id: 'pdf-to-image',
      title: 'PDF to Image',
      icon: ICONS.pdf_to_image,
      desc: 'Convert PDF pages to JPG',
      cat: 'convert',
    },
    {
      id: 'protect',
      title: 'Protect PDF',
      icon: ICONS.protect,
      desc: 'Add password to your PDF',
      cat: 'security',
    },
    {
      id: 'unlock',
      title: 'Unlock PDF',
      icon: ICONS.unlock,
      desc: 'Remove password from PDF',
      cat: 'security',
    },
    {
      id: 'watermark',
      title: 'Watermark',
      icon: ICONS.watermark,
      desc: 'Stamp text on your PDF',
      cat: 'edit',
    },
    {
      id: 'add-page-numbers',
      title: 'Page Numbers',
      icon: ICONS.add_page_numbers,
      desc: 'Insert page numbers',
      cat: 'edit',
    },
    {
      id: 'add-blank-page',
      title: 'Add Blank Page',
      icon: ICONS.add_blank_page,
      desc: 'Insert blank pages anywhere',
      cat: 'edit',
    },
    {
      id: 'crop-resize',
      title: 'Crop & Resize',
      icon: ICONS.crop_resize,
      desc: 'Adjust margins and dimensions',
      cat: 'optimize',
    },
  ];

  function renderHomePage(container) {
    try {
      let html = `
                <header class="hero">
                    <div class="hero-badge">✨ 100% Free & Secure</div>
                    <h1>The Ultimate <span class="text-gradient">PDF Tools</span> Collection</h1>
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
                    <a href="#${t.id}" class="tool-card" data-cat="${t.cat}" data-title="${t.title.toLowerCase()}" data-desc="${t.desc.toLowerCase()}" aria-label="Tool: ${t.title}. ${t.desc}">
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
                            <p style="color: var(--muted);">Choose your PDF files from your computer or mobile device. Files are stored entirely temporarily in your browser's IndexedDB storage.</p>
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

                <section class="features-section">
                    <div class="features-header">
                        <h2>Why Choose PDFMinty?</h2>
                        <p>Professional grade tools without the premium price tag.</p>
                    </div>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">🛡️</div>
                            <h3>100% Private</h3>
                            <p>Your files never leave your device. All processing happens locally in your browser.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">⚡</div>
                            <h3>Lightning Fast</h3>
                            <p>No waiting for uploads or downloads. Get your results instantly.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🆓</div>
                            <h3>Completely Free</h3>
                            <p>No hidden fees, no subscriptions, and no watermarks on your documents.</p>
                        </div>
                    </div>
                </section>

                <section class="faq-section">
                    <h2 class="section-title" style="text-align: center;">Frequently Asked Questions / Privacy & Security</h2>
                    <div class="faq-item">
                        <div class="faq-question">Privacy & Security: Are my files safe? <span class="faq-icon">▼</span></div>
                        <div class="faq-answer">All your PDF processing is done entirely locally in your browser. The code required to run the tools is loaded from trusted CDNs, but your files are never uploaded to any server.</div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question">Is it really free? <span class="faq-icon">▼</span></div>
                        <div class="faq-answer">Absolutely. There are no hidden costs, no subscriptions, and no limits on how many files you can process.</div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question">Do I need to install anything? <span class="faq-icon">▼</span></div>
                        <div class="faq-answer">No installation required. PDFMinty works directly in any modern web browser on your computer, tablet, or smartphone.</div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question">Does it work offline? <span class="faq-icon">▼</span></div>
                        <div class="faq-answer">Once the page is loaded, most tools will work even if you disconnect from the internet, as all logic is client-side.</div>
                    </div>
                </section>

                <section class="bottom-cta">
                    <h2>Ready to Mint Your PDF?</h2>
                    <p>Experience the fastest and most secure PDF tools today.</p>
                    <button id="cta-get-started" class="btn-cta-white" style="border: none; cursor: pointer;">Get Started Now</button>
                </section>
            `;
      container.innerHTML = html;

      // CTA Logic
      const ctaBtn = document.getElementById('cta-get-started');
      if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
          const ts = document.getElementById('tools-section');
          if (ts) ts.scrollIntoView({ behavior: 'smooth' });
        });
      }

      // Search Logic
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

            if (matchesSearch && matchesCat) {
              card.style.display = 'flex';
            } else {
              card.style.display = 'none';
            }
          });
        };

        searchInput.addEventListener('input', filterTools);

        // Category Logic
        const tabs = document.querySelectorAll('.category-tab');
        tabs.forEach((tab) => {
          tab.addEventListener('click', () => {
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            filterTools();
          });
        });
      }

      // FAQ Logic
      const faqs = document.querySelectorAll('.faq-question');
      faqs.forEach((q) => {
        q.addEventListener('click', () => {
          const item = q.parentElement;
          if (item) {
            const wasActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('active'));
            if (!wasActive) item.classList.add('active');
          }
        });
      });
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
            throw new Error("Module doesn't have an init function. Keys: " + Object.keys(module));
          }
        })
        .catch((err) => {
          console.error(`[PDFMinty] Failed to load tool script: ./tools/${toolId}.js`, err);
          appContainer.innerHTML = `
                        <div style="text-align: center; padding: 4rem 2rem; color: var(--text);">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                            <h2>Tool Loading Failed</h2>
                            <p style="color: var(--muted); margin-bottom: 2rem;">We couldn't load the "${toolId}" tool. Error: ${err.message}</p>
                            <a href="#" class="btn-secondary" style="text-decoration: none; display: inline-block;">Go Back Home</a>
                            <button onclick="location.reload()" class="btn-action" style="margin-left: 1rem; border: none; cursor: pointer;">Retry</button>
                            <p style="font-size: 0.8rem; color: var(--muted); margin-top: 2rem;">Debug Path: ./tools/${toolId}.js</p>
                        </div>
                    `;
          window.showError(`Error loading tool: ${toolId}`);
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

      const twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute('content', `${tool.title} — PdfMinty`);

      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute('content', tool.desc);
    },
  };

  function router() {
    const hash = window.location.hash.substring(1);
    const appContainer = document.getElementById('app');

    // Smooth transition effect
    appContainer.style.opacity = '0';
    appContainer.style.transform = 'translateY(10px)';
    appContainer.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

    setTimeout(() => {
      appContainer.innerHTML = ''; // Clear current view

      if (!hash) {
        renderHomePage(appContainer);
        document.title = 'PDFMinty — Free Online PDF Tools | Merge, Compress & Split PDF';
        const heading = appContainer.querySelector('h1');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
      } else {
        // Check if valid tool
        const isValidTool = toolsList.some((t) => t.id === hash);
        if (isValidTool) {
          SEO.updateTags(hash);
          const loadPromise = loadToolScript(hash);
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
          window.location.hash = ''; // Redirect to home if invalid
        }
      }

      // Fade in
      requestAnimationFrame(() => {
        appContainer.style.opacity = '1';
        appContainer.style.transform = 'translateY(0)';
      });
    }, 200);
  }

  // Back to Top Logic
  const btt = document.createElement('div');
  btt.id = 'back-to-top';
  btt.innerHTML = '↑';
  document.body.appendChild(btt);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btt.classList.add('visible');
    } else {
      btt.classList.remove('visible');
    }

    const banner = document.querySelector('.privacy-banner');
    if (banner) {
      if (window.scrollY > 20) {
        banner.classList.add('hidden-banner');
      } else {
        banner.classList.remove('hidden-banner');
      }
    }
  });

  btt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Theme Toggle Logic
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    let currentTheme = localStorage.getItem('theme');
    if (!currentTheme) {
      currentTheme = 'light';
      localStorage.setItem('theme', 'light');
    }

    if (currentTheme === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggle.innerHTML = '🌙';
    } else {
      themeToggle.innerHTML = '☀️';
    }

    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      const theme = isDark ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
      themeToggle.innerHTML = isDark ? '🌙' : '☀️';

      // Fun effect on toggle
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 },
          colors: isDark ? ['#6366f1', '#0ea5e9'] : ['#6366f1', '#f59e0b'],
        });
      }
    });
  }

  // Utility to load external scripts dynamically
  window.loadExternalScript = function (src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(); // Already loaded
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };

  // Load PDF worker silently in background for instant thumbnails
  if (typeof pdfjsLib === 'undefined') {
    window
      .loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')
      .then(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      })
      .catch(() => {});
  }

  window.addEventListener('hashchange', router);

  // Run router immediately if DOM is ready, else wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', router);
  } else {
    router();
  }

  // ==========================================
  // 2. DEVICE-AWARE FILE SIZE VALIDATION
  // ==========================================

  window.PdfMinty.utils.renderPdfThumbnail = async function (file, imgElement) {
    let pdf = null;
    try {
      if (typeof pdfjsLib === 'undefined') {
        await window.loadExternalScript(
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
        );
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
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
      
      // Use WebP format for smaller data URI if supported, fallback to JPEG
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
      
      // Release canvas memory
      canvas.width = 0;
      canvas.height = 0;
    } catch (error) {
      console.error('Error generating PDF thumbnail:', error);
      imgElement.src =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=';
    } finally {
      // Free up memory from pdf loading task
      if (pdf && typeof pdf.destroy === 'function') {
        pdf.destroy();
      }
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

  // Keep global proxy for backward compatibility with older tools
  window.renderPdfThumbnail = window.PdfMinty.utils.renderPdfThumbnail;
  window.f; // ==========================================
  // 3. GLOBAL UI UTILITIES & DROPZONE
  // ==========================================
  window.PdfMinty.ui.showError = function (message) {
    ToastManager.error(message);
  };
  window.PdfMinty.ui.showSuccess = function (message) {
    ToastManager.success(message);
  };

  const loadingMessages = [
    'Minting your PDF...',
    'Polishing the pages...',
    'Adding some minty fresh air...',
    'Organizing the pixels...',
    'Almost there, stay cool...',
    'Making it perfect for you...',
    'Doing the heavy lifting...',
  ];

  window.PdfMinty.ui.showProgress = function (percentOrData, labelText) {
    let overlay = document.getElementById('modern-progress-overlay');
    let percent = percentOrData;
    let label = labelText;

    if (typeof percentOrData === 'object' && percentOrData !== null) {
      percent = percentOrData.percent !== undefined ? percentOrData.percent : percentOrData.progress;
      label = percentOrData.label;
    }

    if (!overlay) {
      window._progressStartTime = Date.now();
      window._progressLastETAUpdate = Date.now();
      overlay = document.createElement('div');
      overlay.id = 'modern-progress-overlay';

      overlay.innerHTML = `
                <div class="progress-glass-card" role="status" aria-live="polite">
                    <div class="cube-wrapper">
                        <div class="cube-folding">
                            <span class="leaf1"></span>
                            <span class="leaf2"></span>
                            <span class="leaf3"></span>
                            <span class="leaf4"></span>
                        </div>
                    </div>
                    <div id="modern-progress-msg" class="progress-msg-text" aria-atomic="true">Minting your PDF...</div>
                    <div class="modern-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                        <div id="modern-progress-bar" class="modern-progress-fill"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--muted); margin-top: 0.5rem;" aria-hidden="true">
                        <span id="modern-progress-pct">0%</span>
                        <span id="modern-progress-eta">Calculating ETA...</span>
                    </div>
                </div>
            `;
      document.body.appendChild(overlay);

      // Allow CSS to trigger animation
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.style.backdropFilter = 'blur(10px)';
      });
    }

    const bar = document.getElementById('modern-progress-bar');
    const msg = document.getElementById('modern-progress-msg');
    const pctText = document.getElementById('modern-progress-pct');
    const etaText = document.getElementById('modern-progress-eta');

    const cleanPercent = Math.min(100, Math.max(0, percent));
    const track = document.querySelector('.modern-progress-track');
    if (track) track.setAttribute('aria-valuenow', Math.round(cleanPercent));
    if (bar) {
      if (bar.classList.contains('modern-progress-fill')) {
        bar.style.transform = `scaleX(${cleanPercent / 100})`;
      } else {
        bar.style.width = `${cleanPercent}%`;
      }
    }
    if (pctText) pctText.textContent = `${Math.round(cleanPercent)}%`;

    // Calculate ETA
    if (cleanPercent > 0 && cleanPercent < 100 && window._progressStartTime) {
      const elapsed = Date.now() - window._progressStartTime;
      if (elapsed > 1000) {
        // wait a bit before calculating
        const totalEstimated = elapsed / (cleanPercent / 100);
        const etaMs = Math.max(0, totalEstimated - elapsed);

        // Update ETA every second
        if (Date.now() - window._progressLastETAUpdate > 1000) {
          window._progressLastETAUpdate = Date.now();
          const etaSecs = Math.ceil(etaMs / 1000);
          if (etaSecs < 2) {
            etaText.textContent = 'Almost done...';
          } else if (etaSecs < 60) {
            etaText.textContent = `ETA: ${etaSecs}s`;
          } else {
            const m = Math.floor(etaSecs / 60);
            const s = (etaSecs % 60).toString().padStart(2, '0');
            etaText.textContent = `ETA: ${m}:${s}`;
          }
        }
      }
    }

    if (label && msg) {
      msg.textContent = label;
    } else if (cleanPercent > 0 && Math.round(cleanPercent) % 25 === 0 && msg && msg.textContent.startsWith('Minting')) {
      msg.textContent = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    }

    if (cleanPercent >= 100) {
      if (msg) msg.textContent = 'Done! 🎉';
      if (etaText) etaText.textContent = '';
      setTimeout(() => {
        if (overlay) {
          overlay.style.opacity = '0';
          overlay.style.backdropFilter = 'blur(0px)';
          setTimeout(() => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            window._progressStartTime = null;
          }, 400);
        }
      }, 800);
    }
  };

  window.PdfMinty.ui.hideProgress = function () {
    let overlay = document.getElementById('modern-progress-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.backdropFilter = 'blur(0px)';
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        window._progressStartTime = null;
      }, 400);
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
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // Keep global proxy for backward compatibility with older tools
  window.showError = window.PdfMinty.ui.showError;
  window.showSuccess = window.PdfMinty.ui.showSuccess;
  window.showProgress = window.PdfMinty.ui.showProgress;
  window.hideProgress = window.PdfMinty.ui.hideProgress;
  window.downloadFile = window.PdfMinty.utils.downloadFile;

  // (initDropZone moved to utils/fileHandler.js)

  // ==========================================
  // 6. PDF WEB WORKER INTEGRATION
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
          if (workerCallbacks[id] && workerCallbacks[id].onProgress) {
            workerCallbacks[id].onProgress(e.data);
          }
          return;
        }

        if (workerCallbacks[id]) {
          if (status === 'success') {
            workerCallbacks[id].resolve(result);
          } else {
            workerCallbacks[id].reject(new Error(error));
          }
          delete workerCallbacks[id];
        }
      };
      pdfWorker.onerror = function (err) {
        console.error('Worker error:', err);
        // Fail all pending
        for (let id in workerCallbacks) {
          workerCallbacks[id].reject(new Error('Worker crashed'));
          delete workerCallbacks[id];
        }
      };
    }
  };

  window.PdfMinty.utils.runPdfWorkerTask = function (
    task,
    payload,
    transferables = [],
    onProgress = null,
  ) {
    window.PdfMinty.utils.initPdfWorker();
    return new Promise((resolve, reject) => {
      const id = ++workerTaskId;
      const progressHandler = onProgress || ((data) => {
        if (typeof window.PdfMinty.ui.showProgress === 'function') {
           window.PdfMinty.ui.showProgress(data);
        }
      });
      workerCallbacks[id] = { resolve, reject, onProgress: progressHandler };
      payload.id = id;
      pdfWorker.postMessage({ id, task, payload }, transferables);
    });
  };

  // Keep global proxy for backward compatibility
  window.initPdfWorker = window.PdfMinty.utils.initPdfWorker;
  window.runPdfWorkerTask = window.PdfMinty.utils.runPdfWorkerTask;

  // ==========================================
  // 7. INDEXEDDB FILE STORAGE (Memory Optimization)
  // ==========================================
  window.PdfMinty.db = {
    dbName: 'PDFMintyDB',
    storeName: 'files',
    dbVersion: 1,

    init() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);
        request.onerror = (event) => reject('IndexedDB error: ' + event.target.error);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
      });
    },

    async saveFile(id, arrayBuffer) {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.put(arrayBuffer, id);
        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(request.error);
      });
    },

    async getFile(id) {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },

    async deleteFile(id) {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },

    async clearAll() {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },
  };

  // Keep global proxy for backward compatibility
  window.pdfDB = window.PdfMinty.db;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function (error) {
      console.error('Service Worker registration failed:', error);
    });
  }

  // Clear leftover files on load/refresh
  window.addEventListener('load', () => {
    if (window.PdfMinty && window.PdfMinty.db) {
      window.PdfMinty.db.clearAll().catch(() => {});
    }
  });
  window.addEventListener('beforeunload', () => {
    if (window.PdfMinty && window.PdfMinty.db) {
      window.PdfMinty.db.clearAll().catch(() => {});
    }
  });

  // ==========================================
  // 8. GEMINI AI PROXY INTEGRATION
  // ==========================================
  window.PdfMinty.utils.callGeminiAPI = async function (prompt, context = '', history = []) {
    try {
      const response = await fetch('/.netlify/functions/gemini-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
          history,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch from AI proxy');
      }
      return data;
    } catch (error) {
      console.error('Gemini API Error:', error);
      if (window.PdfMinty && window.PdfMinty.ui)
        window.PdfMinty.ui.showError('AI features are currently unavailable.');
      throw error;
    }
  };

  // Keep global proxy for backward compatibility with older tools
  window.callGeminiAPI = window.PdfMinty.utils.callGeminiAPI;

  // ==========================================
  // 9. USER FEEDBACK MECHANISM
  // ==========================================
  function initFeedbackWidget() {
    const btn = document.getElementById('footer-feedback-btn');
    if (!btn) return;

    const dialog = document.createElement('div');
    dialog.className = 'feedback-dialog hidden';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-label', 'Feedback form');
    dialog.style.position = 'fixed';
    dialog.style.bottom = '100px';
    dialog.style.left = '50%';
    dialog.style.transform = 'translateX(-50%)';
    dialog.style.zIndex = '9999';
    dialog.style.background = 'var(--card)';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '12px';
    dialog.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
    dialog.style.width = '300px';
    dialog.style.maxWidth = '90vw';
    
    dialog.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h4 id="feedback-title" style="margin: 0; font-size: 1.1rem;">How can we improve?</h4>
        <button class="feedback-close" aria-label="Close feedback" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--muted);">&times;</button>
      </div>
      <form id="feedback-form" style="display: flex; flex-direction: column; gap: 10px;">
        <textarea id="feedback-text" required placeholder="Tell us what you think..." aria-labelledby="feedback-title" style="width: 100%; height: 100px; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); resize: none; font-family: inherit; box-sizing: border-box;"></textarea>
        <button type="submit" class="btn-action" style="width: 100%;">Send Feedback</button>
      </form>
      <div id="feedback-success" class="hidden" style="color: var(--primary); font-weight: 500; text-align: center; margin-top: 10px;">Thanks for your feedback!</div>
    `;
    document.body.appendChild(dialog);

    btn.addEventListener('click', () => {
      dialog.classList.toggle('hidden');
      if (!dialog.classList.contains('hidden')) {
        document.getElementById('feedback-text').focus();
        // Scroll a bit so dialog is perfectly visible above footer on small screens
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }
    });

    dialog.querySelector('.feedback-close').addEventListener('click', () => {
      dialog.classList.add('hidden');
      btn.focus();
    });

    document.getElementById('feedback-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const text = document.getElementById('feedback-text').value;
      
      const feed = JSON.parse(localStorage.getItem('pdfminty_feedback') || '[]');
      feed.push({ date: new Date().toISOString(), text });
      localStorage.setItem('pdfminty_feedback', JSON.stringify(feed));
      
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(reg => reg.sync.register('sync-feedback')).catch(() => {});
      }

      document.getElementById('feedback-form').style.display = 'none';
      document.getElementById('feedback-success').classList.remove('hidden');

      setTimeout(() => {
        dialog.classList.add('hidden');
        setTimeout(() => {
          document.getElementById('feedback-form').style.display = 'flex';
          document.getElementById('feedback-success').classList.add('hidden');
          document.getElementById('feedback-text').value = '';
        }, 300);
      }, 2000);
    });
  }

  // Delay widget initialization so it doesn't block main thread metrics
  if (typeof window.requestIdleCallback !== 'undefined') {
    window.requestIdleCallback(initFeedbackWidget);
  } else {
    setTimeout(initFeedbackWidget, 2000);
  }

})();
