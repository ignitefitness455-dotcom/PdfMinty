/**
 * src/ui/shell/Navbar.js - Sticky Navigation Bar
 */
import { toggleTheme } from './ThemeManager.js';

export function createNavbar(container) {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <div class="nav-content">
      <a href="/" class="logo" data-nav>
        <span class="logo-icon">📄</span>
        <span>PDFMinty</span>
      </a>
      <div class="nav-links">
        <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
          ☀️
        </button>
      </div>
    </div>
  `;

  container.prepend(nav);

  // Theme toggle
  const themeBtn = nav.querySelector('#theme-toggle');
  themeBtn.addEventListener('click', () => {
    toggleTheme();
    const isDark = document.body.classList.contains('dark-mode');
    themeBtn.textContent = isDark ? '🌙' : '☀️';
  });

  // Set initial icon
  const isDark = document.body.classList.contains('dark-mode');
  themeBtn.textContent = isDark ? '🌙' : '☀️';

  return nav;
}
