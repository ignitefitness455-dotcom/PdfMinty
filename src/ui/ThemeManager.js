export function initThemeAndScroll() {
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

      // Fun effect on toggle matching confetti choice
      if (typeof window.confetti === 'function') {
        window.confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 },
          colors: isDark ? ['#6366f1', '#0ea5e9'] : ['#6366f1', '#f59e0b'],
        });
      }
    });
  }
}
