/* =========================================================
   Meridian ERP — Prototype Interactions
   ========================================================= */

(function () {
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  // Theme handling
  const STORAGE_KEY = 'meridian-erp-theme';
  const savedTheme = localStorage.getItem(STORAGE_KEY) || 'light';
  applyTheme(savedTheme);

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.innerHTML = theme === 'dark'
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>'
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>';
    }
  }

  themeBtn && themeBtn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  });

  // Density / size toggle
  const sizeButtons = document.querySelectorAll('[data-size]');
  sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const size = btn.getAttribute('data-size');
      const map = { sm: 320, md: 390, lg: 440 };
      root.style.setProperty('--device-w', map[size] + 'px');
      // device height aspect maintained roughly
      const heightMap = { sm: 680, md: 820, lg: 920 };
      root.style.setProperty('--device-h', heightMap[size] + 'px');
    });
  });

  // Anchor scroll for screen index
  document.querySelectorAll('[data-jump]').forEach(el => {
    el.addEventListener('click', () => {
      const target = document.getElementById(el.getAttribute('data-jump'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
