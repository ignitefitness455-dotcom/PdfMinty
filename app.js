/**
 * app.js - PDFMinty Global Engine
 * Handles Routing, State Management, File Validation, and UI Utilities
 */

(function() {
    // ==========================================
    // 1. HASH ROUTER SYSTEM
    // ==========================================
    console.log("[PDFMinty] Engine v1.2 Loaded - 2026-03-27");
    const toolsList = [
        { id: 'merge', title: 'Merge PDF', icon: '🔗', desc: 'Combine multiple PDFs into one', cat: 'organize' },
        { id: 'split', title: 'Split PDF', icon: '✂️', desc: 'Extract pages from your PDF', cat: 'organize' },
        { id: 'compress', title: 'Compress PDF', icon: '🗜️', desc: 'Reduce file size without losing quality', cat: 'optimize' },
        { id: 'rotate', title: 'Rotate PDF', icon: '↻', desc: 'Rotate pages to correct orientation', cat: 'edit' },
        { id: 'reorder', title: 'Reorder PDF', icon: '🔄', desc: 'Change the order of PDF pages', cat: 'organize' },
        { id: 'delete-pages', title: 'Delete Pages', icon: '🗑️', desc: 'Remove unwanted pages', cat: 'organize' },
        { id: 'extract-pages', title: 'Extract Pages', icon: '📑', desc: 'Get specific pages as a new PDF', cat: 'organize' },
        { id: 'image-to-pdf', title: 'Image to PDF', icon: '🖼️', desc: 'Convert JPG/PNG to PDF', cat: 'convert' },
        { id: 'pdf-to-image', title: 'PDF to Image', icon: '🖼️', desc: 'Convert PDF pages to JPG', cat: 'convert' },
        { id: 'protect', title: 'Protect PDF', icon: '🔒', desc: 'Add password to your PDF', cat: 'security' },
        { id: 'unlock', title: 'Unlock PDF', icon: '🔓', desc: 'Remove password from PDF', cat: 'security' },
        { id: 'watermark', title: 'Watermark', icon: '💧', desc: 'Stamp text on your PDF', cat: 'edit' },
        { id: 'add-page-numbers', title: 'Page Numbers', icon: '🔢', desc: 'Insert page numbers', cat: 'edit' },
        { id: 'add-blank-page', title: 'Add Blank Page', icon: '📄', desc: 'Insert blank pages anywhere', cat: 'edit' },
        { id: 'crop-resize', title: 'Crop & Resize', icon: '📐', desc: 'Adjust margins and dimensions', cat: 'optimize' }
    ];

    function renderHomePage(container) {
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
        toolsList.forEach(t => {
            html += `
                <a href="#${t.id}" class="tool-card" data-cat="${t.cat}" data-title="${t.title.toLowerCase()}" data-desc="${t.desc.toLowerCase()}">
                    <div class="tool-icon-wrapper">${t.icon}</div>
                    <div class="tool-info">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                            <h3 style="margin-bottom: 0;">${t.title}</h3>
                            <span class="category-badge">${t.cat}</span>
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
                        <p style="color: var(--muted);">Choose your PDF files from your computer or mobile device.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-number">2</div>
                        <h3>Process Locally</h3>
                        <p style="color: var(--muted);">Our browser-based engine handles the work. Your data never leaves your device.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-number">3</div>
                        <h3>Download</h3>
                        <p style="color: var(--muted);">Get your processed PDF instantly. No waiting for server queues.</p>
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
                <h2 class="section-title" style="text-align: center;">Frequently Asked Questions</h2>
                <div class="faq-item">
                    <div class="faq-question">Are my files safe? <span class="faq-icon">▼</span></div>
                    <div class="faq-answer">Yes! PDFMinty processes all files locally in your browser. Your files are never uploaded to any server, ensuring 100% privacy.</div>
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
                document.getElementById('tools-section').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Search Logic
        const searchInput = document.getElementById('tool-search');
        const toolsGrid = document.getElementById('tools-grid');
        const cards = toolsGrid.querySelectorAll('.tool-card');

        const filterTools = () => {
            const query = searchInput.value.toLowerCase();
            const activeCat = document.querySelector('.category-tab.active').getAttribute('data-cat');
            
            cards.forEach(card => {
                const title = card.getAttribute('data-title');
                const desc = card.getAttribute('data-desc');
                const cat = card.getAttribute('data-cat');
                
                const matchesSearch = title.includes(query) || desc.includes(query);
                const matchesCat = activeCat === 'all' || cat === activeCat;
                
                if (matchesSearch && matchesCat) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        };

        if (searchInput) {
            searchInput.addEventListener('input', filterTools);
        }

        // Category Logic
        const tabs = document.querySelectorAll('.category-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                filterTools();
            });
        });

        // FAQ Logic
        const faqs = document.querySelectorAll('.faq-question');
        faqs.forEach(q => {
            q.addEventListener('click', () => {
                const item = q.parentElement;
                const wasActive = item.classList.contains('active');
                document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
                if (!wasActive) item.classList.add('active');
            });
        });
    }

    function loadToolScript(toolId) {
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; color: var(--muted);">
                <div class="loading-spinner" style="width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
                <p>Loading ${toolId} tool...</p>
            </div>
        `;

        const scriptId = `script-${toolId}`;
        // Remove old script if exists to re-trigger IIFE
        const oldScript = document.getElementById(scriptId);
        if (oldScript) oldScript.remove();

        const script = document.createElement('script');
        script.id = scriptId;
        
        // Use relative path but ensure it's not starting with / to avoid root issues on some hosts
        // unless we are sure we want root. Netlify usually works fine with relative paths.
        const scriptPath = `tools/${toolId}.js`;
        script.src = scriptPath;
        
        

        script.onerror = () => {
            console.error(`[PDFMinty] Failed to load tool script: ${scriptPath}`);
            appContainer.innerHTML = `
                <div style="text-align: center; padding: 4rem 2rem; color: var(--text);">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                    <h2>Tool Loading Failed</h2>
                    <p style="color: var(--muted); margin-bottom: 2rem;">We couldn't load the "${toolId}" tool. This might be due to a slow connection or the file missing on the server.</p>
                    <a href="#" class="btn-secondary" style="text-decoration: none; display: inline-block;">Go Back Home</a>
                    <button onclick="location.reload()" class="btn-action" style="margin-left: 1rem; border: none; cursor: pointer;">Retry</button>
                    <p style="font-size: 0.8rem; color: var(--muted); margin-top: 2rem;">Debug Path: ${scriptPath}</p>
                </div>
            `;
            window.showError(`Error loading tool: ${toolId}`);
        };
        
        document.body.appendChild(script);
    }

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
            } else {
                // Check if valid tool
                const isValidTool = toolsList.some(t => t.id === hash);
                if (isValidTool) {
                    loadToolScript(hash);
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
    });

    btt.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'light') {
            document.body.classList.add('light-mode');
            themeToggle.innerHTML = '☀️';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            const theme = isLight ? 'light' : 'dark';
            localStorage.setItem('theme', theme);
            themeToggle.innerHTML = isLight ? '☀️' : '🌙';
            
            // Fun effect on toggle
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 40,
                    spread: 50,
                    origin: { y: 0.8 },
                    colors: isLight ? ['#6366f1', '#f59e0b'] : ['#6366f1', '#0ea5e9']
                });
            }
        });
    }

    // Utility to load external scripts dynamically
    window.loadExternalScript = function(src) {
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
        window.loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js').then(() => {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }).catch(err => {});
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
    window.renderPdfThumbnail = async function(file, imgElement) {
        try {
            if (typeof pdfjsLib === 'undefined') {
                await window.loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.0 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            imgElement.src = canvas.toDataURL();
        } catch (error) {
            console.error('Error generating PDF thumbnail:', error);
            // Fallback icon
            imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=';
        }
    };

    window.validateFileSize = function(files) {
        // Detect if mobile device (screen width < 768px or userAgent match)
        const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Heavy Processing Limits: 500MB for Mobile, 1500MB (1.5GB) for Desktop
        const maxSizeMB = isMobile ? 500 : 1500; 
        const maxBytes = maxSizeMB * 1024 * 1024;

        for (let i = 0; i < files.length; i++) {
            if (files[i].size > maxBytes) {
                const deviceType = isMobile ? "Mobile" : "Desktop";
                window.showError(`File "${files[i].name}" is too large. Limit for ${deviceType} is ${maxSizeMB}MB.`);
                return false;
            }
        }
        return true;
    };


    // ==========================================
    // 3. GLOBAL UI UTILITIES & DROPZONE
    // ==========================================
    window.showError = function(message) { showToast(message, 'var(--danger)'); };
    window.showSuccess = function(message) { 
        showToast(message, 'var(--success)'); 
        // Trigger Confetti
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#0ea5e9', '#10b981']
            });
        }
    };

    function showToast(message, color) {
        let toast = document.getElementById('pdfminty-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'pdfminty-toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        
        const isSuccess = color.includes('success');
        const icon = isSuccess ? '✅' : '⚠️';
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        
        // Reset classes
        toast.className = 'toast';
        toast.classList.add(isSuccess ? 'toast-success' : 'toast-danger');
        
        // Show toast
        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });
        
        if (window.toastTimeout) clearTimeout(window.toastTimeout);
        window.toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 4000);
    }

    const loadingMessages = [
        "Minting your PDF...",
        "Polishing the pages...",
        "Adding some minty fresh air...",
        "Organizing the pixels...",
        "Almost there, stay cool...",
        "Making it perfect for you...",
        "Doing the heavy lifting..."
    ];

    window.showProgress = function(percent) {
        let overlay = document.getElementById('modern-progress-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'modern-progress-overlay';
            
            overlay.innerHTML = `
                <div class="progress-glass-card">
                    <div class="cube-wrapper">
                        <div class="cube-folding">
                            <span class="leaf1"></span>
                            <span class="leaf2"></span>
                            <span class="leaf3"></span>
                            <span class="leaf4"></span>
                        </div>
                    </div>
                    <div id="modern-progress-msg" class="progress-msg-text">Minting your PDF...</div>
                    <div class="modern-progress-track">
                        <div id="modern-progress-bar" class="modern-progress-fill"></div>
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
        
        if (bar) bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
        
        if (percent % 25 === 0 && msg) {
            msg.textContent = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
        }

        if (percent >= 100) {
            if (msg) msg.textContent = "Done! 🎉";
            setTimeout(() => {
                if(overlay) {
                    overlay.style.opacity = '0';
                    overlay.style.backdropFilter = 'blur(0px)';
                    setTimeout(() => overlay.remove(), 400);
                }
            }, 800);
        }
    };

    window.hideProgress = function() {
        let overlay = document.getElementById('modern-progress-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.backdropFilter = 'blur(0px)';
            setTimeout(() => overlay.remove(), 400);
        }
    };

    window.downloadFile = function(uint8Array, filename) {
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

    window.initDropZone = function(zoneId, inputId, callback, accept = '') {
        const zone = document.getElementById(zoneId);
        const input = document.getElementById(inputId);
        if (!zone || !input) return;

        if (accept) input.accept = accept;

        zone.classList.add('drop-zone-enhanced');

        const overlay = document.createElement('div');
        overlay.className = 'drop-overlay';
        overlay.innerHTML = `
            <div class="drop-icon-large">📥</div>
            <div class="drop-text-large">Release to add files</div>
            <div class="drop-progress-container hidden">
                <div class="drop-progress-bar"></div>
            </div>
        `;
        zone.appendChild(overlay);

        const icon = overlay.querySelector('.drop-icon-large');
        const text = overlay.querySelector('.drop-text-large');
        const progContainer = overlay.querySelector('.drop-progress-container');
        const progBar = overlay.querySelector('.drop-progress-bar');

        const setOverlayState = (i, t, showProg = false) => {
            icon.textContent = i;
            text.textContent = t;
            if (showProg) {
                progContainer.classList.remove('hidden');
                icon.style.animation = 'none';
            } else {
                progContainer.classList.add('hidden');
                icon.style.animation = '';
            }
        };

        zone.addEventListener('click', (e) => { if (e.target !== input) input.click(); });
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-active'); setOverlayState('📥', 'Release to add files'); });
        zone.addEventListener('dragleave', (e) => { e.preventDefault(); if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-active'); });
        zone.addEventListener('drop', async (e) => {
            e.preventDefault();
            zone.classList.remove('drag-active');
            if (e.dataTransfer.files.length > 0) await processFiles(e.dataTransfer.files);
        });
        input.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) await processFiles(e.target.files);
        });

        async function processFiles(files) {
            overlay.classList.add('active');
            setOverlayState('⏳', `Processing ${files.length} file(s)...`, true);
            for (let i = 0; i <= 100; i += 20) {
                progBar.style.width = `${i}%`;
                await new Promise(r => setTimeout(r, 30));
            }
            
            // Success Animation
            overlay.innerHTML = `
                <div class="success-checkmark">
                    <div class="check-icon">
                        <span class="icon-line line-tip"></span>
                        <span class="icon-line line-long"></span>
                        <div class="icon-circle"></div>
                        <div class="icon-fix"></div>
                    </div>
                </div>
                <div class="drop-text-large" style="margin-top: 1rem;">Files added successfully!</div>
            `;
            
            setTimeout(() => {
                overlay.classList.remove('active');
                // Restore original overlay content for next time
                overlay.innerHTML = `
                    <div class="drop-icon-large">📥</div>
                    <div class="drop-text-large">Release to add files</div>
                    <div class="drop-progress-container hidden">
                        <div class="drop-progress-bar"></div>
                    </div>
                `;
                callback(files);
                input.value = ''; 
            }, 1500);
        }
    };
})();


    // ==========================================
    // 6. PDF WEB WORKER INTEGRATION
    // ==========================================
    let pdfWorker = null;
    let workerTaskId = 0;
    const workerCallbacks = {};

    window.initPdfWorker = function() {
        if (!pdfWorker) {
            pdfWorker = new Worker('pdf-worker.js');
            pdfWorker.onmessage = function(e) {
                const { id, status, result, error, progress } = e.data;
                if (status === 'progress') {
                    if(workerCallbacks[id] && workerCallbacks[id].onProgress) {
                        workerCallbacks[id].onProgress(progress);
                    }
                    return;
                }
                
                if(workerCallbacks[id]) {
                    if (status === 'success') {
                        workerCallbacks[id].resolve(result);
                    } else {
                        workerCallbacks[id].reject(new Error(error));
                    }
                    delete workerCallbacks[id];
                }
            };
            pdfWorker.onerror = function(err) {
                console.error('Worker error:', err);
                // Fail all pending
                for(let id in workerCallbacks) {
                    workerCallbacks[id].reject(new Error('Worker crashed'));
                    delete workerCallbacks[id];
                }
            }
        }
    };

    window.runPdfWorkerTask = function(task, payload, transferables = [], onProgress = null) {
        window.initPdfWorker();
        return new Promise((resolve, reject) => {
            const id = ++workerTaskId;
            workerCallbacks[id] = { resolve, reject, onProgress };
            payload.id = id;
            pdfWorker.postMessage({ id, task, payload }, transferables);
        });
    };


    // ==========================================
    // 7. INDEXEDDB FILE STORAGE (Memory Optimization)
    // ==========================================
    window.pdfDB = {
        dbName: 'PDFMintyDB',
        storeName: 'files',
        dbVersion: 1,
        
        init() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);
                request.onerror = event => reject('IndexedDB error: ' + event.target.error);
                request.onsuccess = event => resolve(event.target.result);
                request.onupgradeneeded = event => {
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
        }
    };
    
    // Clear leftover files on load/refresh
    window.addEventListener('load', () => {
        if (window.pdfDB) {
            window.pdfDB.clearAll().catch(e => {});
        }
    });
    window.addEventListener('beforeunload', () => {
        if (window.pdfDB) {
            window.pdfDB.clearAll().catch(e => {});
        }
    });
