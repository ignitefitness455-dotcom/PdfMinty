export function renderHomePage(container, toolsList) {
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
