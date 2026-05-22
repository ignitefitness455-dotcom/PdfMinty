import { ICONS } from "./src/ui/icons.js";
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
                            <a href="/" class="btn-secondary" style="text-decoration: none; display: inline-block;">Go Back Home</a>
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
    let path = window.location.pathname;
    let viewId = '';
    
    if (path !== '/' && path !== '/index.html') {
      viewId = path.replace(/^\//, '').replace(/\/$/, '').replace(/-pdf$/, '');
    }

    const appContainer = document.getElementById('app');

    // Smooth transition effect
    appContainer.style.opacity = '0';
    appContainer.style.transform = 'translateY(10px)';
    appContainer.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

    setTimeout(() => {
      appContainer.innerHTML = ''; // Clear current view

      if (!viewId) {
        renderHomePage(appContainer);
        document.title = 'PDFMinty — Free Online PDF Tools | Merge, Compress & Split PDF';
        const heading = appContainer.querySelector('h1');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
      } else {
        // Check if valid tool
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
          window.history.replaceState(null, '', '/'); // Redirect to home if invalid
          path = '/';
          viewId = '';
          router();
          return;
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

  window.addEventListener('popstate', router);

  // Intercept all clicks to handle internal links for SPA
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      // If it's an internal link (e.g. /merge-pdf or /)
      if (href && href.startsWith('/')) {
        e.preventDefault();
        window.history.pushState(null, '', href);
        router();
      }
    }
  });

  // Run router immediately if DOM is ready, else wait for DOMContentLoaded
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

  // Clear leftover files on load/refresh using actual DB module
  import('./src/core/Database.js').then((module) => {
    const db = module.db;
    window.addEventListener('load', () => {
      db.clearAll().catch((e) => console.log('Clear db load:', e));
    });
    window.addEventListener('beforeunload', () => {
      db.clearAll().catch((e) => console.log('Clear db unload:', e));
    });
  });

  // ==========================================
  // 8. GEMINI AI PROXY INTEGRATION
  // ==========================================
  window.PdfMinty.utils.callGeminiAPI = async function (prompt, context = '', history = []) {
    try {
      const response = await fetch('/api/gemini-proxy', {
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
  // IN-APP CONTACT & FEEDBACK MODAL
  // ==========================================
  function initContactModal() {
    const overlay = document.createElement('div');
    overlay.className = 'contact-modal-overlay';
    overlay.innerHTML = `
      <div class="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
        <div class="contact-modal-header">
          <h2 id="contact-modal-title" class="contact-modal-title">Contact Us</h2>
          <button class="contact-modal-close" aria-label="Close Contact Modal">&times;</button>
        </div>
        <form id="contact-form">
          <div class="contact-form-group">
            <label class="contact-form-label" for="contact-name">Name</label>
            <input type="text" id="contact-name" class="contact-form-input" placeholder="Your Name" required>
          </div>
          <div class="contact-form-group">
            <label class="contact-form-label" for="contact-email">Email Address</label>
            <input type="email" id="contact-email" class="contact-form-input" placeholder="you@example.com" required>
          </div>
          <div class="contact-form-group">
            <label class="contact-form-label" for="contact-type">Topic</label>
            <select id="contact-type" class="contact-form-select" required>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Feedback">Feedback & Suggestions</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Business">Business Talk</option>
            </select>
          </div>
          <div class="contact-form-group">
            <label class="contact-form-label" for="contact-message">Message</label>
            <textarea id="contact-message" class="contact-form-textarea" placeholder="How can we help you?" required></textarea>
          </div>
          <button type="submit" id="contact-submit" class="btn-action w-full" style="width: 100%;">
            <span>Send Message</span>
          </button>
        </form>
        <div id="contact-success" style="display: none; text-align: center; padding: 20px 0;">
          <div style="font-size: 3rem; margin-bottom: 10px;">✅</div>
          <h3 style="color: var(--text); margin-bottom: 5px;">Message Sent!</h3>
          <p style="color: var(--muted); font-size: 0.9rem;">Thank you for reaching out. We'll get back to you soon.</p>
          <button class="btn-secondary contact-modal-close-success" style="margin-top: 15px; padding: 8px 16px;">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const form = document.getElementById('contact-form');
    const successView = document.getElementById('contact-success');
    let isOpen = false;

    const openModal = (defaultTopic = 'General Inquiry') => {
      document.getElementById('contact-type').value = defaultTopic;
      form.style.display = 'block';
      successView.style.display = 'none';
      form.reset();
      
      overlay.classList.add('active');
      isOpen = true;
      setTimeout(() => document.getElementById('contact-name').focus(), 100);
    };

    const closeModal = () => {
      overlay.classList.remove('active');
      isOpen = false;
    };

    // Event Listeners for opening
    const feedbackBtn = document.getElementById('footer-feedback-btn');
    const contactBtn = document.getElementById('footer-contact-btn');
    
    if (feedbackBtn) {
      feedbackBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('Feedback'); });
    }
    if (contactBtn) {
      contactBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('General Inquiry'); });
    }

    // Event listeners for closing
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    overlay.querySelector('.contact-modal-close').addEventListener('click', closeModal);
    overlay.querySelector('.contact-modal-close-success').addEventListener('click', closeModal);

    // Form Submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('contact-submit');
      const originalText = submitBtn.innerHTML;
      
      const payload = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        type: document.getElementById('contact-type').value,
        message: document.getElementById('contact-message').value
      };

      try {
        submitBtn.innerHTML = '<div class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>';
        submitBtn.disabled = true;

        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Submission failed');
        
        form.style.display = 'none';
        successView.style.display = 'block';

      } catch (err) {
        console.error(err);
        if (window.PdfMinty && window.PdfMinty.ui && window.PdfMinty.ui.showError) {
           window.PdfMinty.ui.showError('Could not send message. Please try again later.');
        } else {
           alert('Error sending message. Please check your connection.');
        }
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  if (typeof window.requestIdleCallback !== 'undefined') {
    window.requestIdleCallback(initContactModal);
  } else {
    setTimeout(initContactModal, 2000);
  }

})();
