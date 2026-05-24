/* =========================================================
   Folio ERP — Live App Runtime
   Renders each screen, wires every visible control to work,
   and navigates between screens like a real mobile app.
   ========================================================= */

(function () {
  'use strict';

  // ---------- Theme ----------
  const root = document.documentElement;
  const STORAGE_KEY = 'folio-erp-theme';
  applyTheme(localStorage.getItem(STORAGE_KEY) || 'light');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.innerHTML = theme === 'dark'
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>'
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>';
    }
  }

  // ---------- Section labels for the screens drawer ----------
  const SECTIONS = [
    { name: 'Onboarding & Auth',     screens: [1, 2, 3, 4] },
    { name: 'Dashboard & Navigation', screens: [5, 6, 7, 8] },
    { name: 'Sales',                  screens: [9, 10, 11, 12, 13] },
    { name: 'Customers & Accounts',   screens: [14, 15, 16] },
    { name: 'Proposals & Reports',    screens: [17, 18, 19, 20] },
    { name: 'Settings & States',      screens: [21, 22, 23, 24, 25, 26] }
  ];

  // ---------- Navigation flow ----------
  // selector → target screen id (when this element is clicked, go there).
  // Special: 'auto' = automatically advance after delay (ms).
  const FLOW = {
    1: { auto: { next: 2, delay: 2400 } },
    2: {
      hotspots: [
        { selector: '.onb .btn-primary', target: 3 },
        { selector: '.onb .skip', target: 3 }
      ]
    },
    3: {
      hotspots: [
        { selector: '.btn-primary', target: 4 },
        { selector: '.auth-row .link', target: 4 },
        { selector: '.bottom-link .link', target: 4 }
      ]
    },
    4: {
      hotspots: [
        { selector: '.btn-primary', target: 5 },
        { selector: '.icon-btn', target: 3 },
        { selector: '.biometric', target: 5 }
      ]
    },
    5: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 6 },
        { selector: '.app-header .right .icon-pill:nth-of-type(1)', target: 7 },
        { selector: '.app-header .right .icon-pill:nth-of-type(2)', target: 8 },
        { selector: '.fab', target: 10 },
        { selector: '.bottom-nav .nav-item:nth-child(2)', target: 9 },
        { selector: '.bottom-nav .nav-item:nth-child(3)', target: 14 },
        { selector: '.bottom-nav .nav-item:nth-child(4)', target: 19 },
        { selector: '.bottom-nav .nav-item:nth-child(5)', target: 21 },
        { selector: '.quick-act:nth-child(1)', target: 10 },
        { selector: '.quick-act:nth-child(2)', target: 14 },
        { selector: '.quick-act:nth-child(3)', target: 12 },
        { selector: '.quick-act:nth-child(4)', target: 11 },
        { selector: '.activity-item:nth-child(1)', target: 11 },
        { selector: '.activity-item:nth-child(2)', target: 11 },
        { selector: '.activity-item:nth-child(3)', target: 9 },
        { selector: '.balance-card', target: 16 }
      ]
    },
    6: {
      hotspots: [
        { selector: '.nav-link:nth-of-type(1)', target: 5 },
        { selector: '.nav-link:nth-of-type(2)', target: 9 },
        { selector: '.nav-link:nth-of-type(3)', target: 12 },
        { selector: '.nav-link:nth-of-type(4)', target: 17 },
        { selector: '.nav-link:nth-of-type(5)', target: 13 },
        { selector: '.nav-link:nth-of-type(6)', target: 19 },
        // scrim closes drawer
        { selector: '[style*="rgba(15,23,42,0.5)"]', target: 5 }
      ]
    },
    7: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 5 },
        { selector: '.list-item:nth-of-type(1)', target: 15 },
        { selector: '.list-item:nth-of-type(2)', target: 15 },
        { selector: '.list-item:nth-of-type(3)', target: 11 },
        { selector: '.list-item:nth-of-type(4)', target: 11 },
        { selector: '.list-item:nth-of-type(5)', target: 11 }
      ]
    },
    8: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 5 },
        { selector: '.notif-item:nth-of-type(1)', target: 11 },
        { selector: '.notif-item:nth-of-type(2)', target: 11 },
        { selector: '.notif-item:nth-of-type(3)', target: 12 }
      ]
    },
    9: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 5 },
        { selector: '.fab', target: 10 },
        { selector: '.list-item:nth-of-type(1)', target: 11 },
        { selector: '.list-item:nth-of-type(2)', target: 11 },
        { selector: '.list-item:nth-of-type(3)', target: 11 },
        { selector: '.list-item:nth-of-type(4)', target: 11 },
        { selector: '.list-item:nth-of-type(5)', target: 11 },
        { selector: '.list-item:nth-of-type(6)', target: 10 },
        { selector: '.list-item:nth-of-type(7)', target: 10 },
        { selector: '.app-header .right .icon-pill:nth-of-type(2)', target: 20 },
        { selector: '.bottom-nav .nav-item:nth-child(1)', target: 5 },
        { selector: '.bottom-nav .nav-item:nth-child(3)', target: 14 },
        { selector: '.bottom-nav .nav-item:nth-child(4)', target: 19 },
        { selector: '.bottom-nav .nav-item:nth-child(5)', target: 21 }
      ]
    },
    10: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 9 },
        { selector: '.app-header .right .btn', target: 9 },
        { selector: '[style*="bottom:0"] .btn-primary', target: 11 },
        { selector: '[style*="bottom:0"] .btn-secondary', target: 11 }
      ]
    },
    11: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 9 },
        { selector: '.app-header .right .icon-pill:nth-of-type(1)', target: 23 },
        { selector: '[style*="grid-template-columns:1fr 1fr"] .btn-primary', target: 23 },
        { selector: '[style*="grid-template-columns:1fr 1fr"] .btn-secondary', target: 8 }
      ]
    },
    12: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 5 },
        { selector: '.fab', target: 10 },
        { selector: '.card .btn-primary', target: 10 },
        { selector: '.list-item:nth-of-type(1)', target: 17 },
        { selector: '.list-item:nth-of-type(2)', target: 17 },
        { selector: '.list-item:nth-of-type(3)', target: 17 },
        { selector: '.list-item:nth-of-type(4)', target: 11 },
        { selector: '.bottom-nav .nav-item:nth-child(1)', target: 5 },
        { selector: '.bottom-nav .nav-item:nth-child(3)', target: 14 },
        { selector: '.bottom-nav .nav-item:nth-child(4)', target: 19 },
        { selector: '.bottom-nav .nav-item:nth-child(5)', target: 21 }
      ]
    },
    13: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 6 },
        { selector: '[style*="bottom:0"] .btn-primary', target: 9 },
        { selector: '[style*="bottom:0"] .btn-secondary', target: 9 }
      ]
    },
    14: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 6 },
        { selector: '.fab', target: 7 },
        { selector: '.list-item', target: 15, all: true },
        { selector: '.bottom-nav .nav-item:nth-child(1)', target: 5 },
        { selector: '.bottom-nav .nav-item:nth-child(2)', target: 9 },
        { selector: '.bottom-nav .nav-item:nth-child(4)', target: 19 },
        { selector: '.bottom-nav .nav-item:nth-child(5)', target: 21 }
      ]
    },
    15: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 14 },
        { selector: '.profile-actions .pa:nth-child(1)', target: 15 },
        { selector: '.profile-actions .pa:nth-child(2)', target: 15 },
        { selector: '.profile-actions .pa:nth-child(3)', target: 15 },
        { selector: '.profile-actions .pa:nth-child(4)', target: 10 },
        { selector: '.activity-item', target: 11, all: true }
      ]
    },
    16: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 6 },
        { selector: '.activity-item', target: 11, all: true }
      ]
    },
    17: {
      hotspots: [
        { selector: '.icon-pill', target: 6, all: true },
        { selector: '.btn-primary', target: 18 }
      ]
    },
    18: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 17 },
        { selector: '[style*="bottom:0"] .btn-success', target: 11 },
        { selector: '[style*="bottom:0"] .btn-secondary', target: 17 }
      ]
    },
    19: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 6 },
        { selector: '.bottom-nav .nav-item:nth-child(1)', target: 5 },
        { selector: '.bottom-nav .nav-item:nth-child(2)', target: 9 },
        { selector: '.bottom-nav .nav-item:nth-child(3)', target: 14 },
        { selector: '.bottom-nav .nav-item:nth-child(5)', target: 21 }
      ]
    },
    20: {
      hotspots: [
        { selector: '[style*="grid-template-columns:1fr 1.4fr"] .btn-primary', target: 9 },
        { selector: '[style*="grid-template-columns:1fr 1.4fr"] .btn-secondary', target: 9 }
      ]
    },
    21: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 5 },
        { selector: '.card[style*="padding:18px"]', target: 22 },
        { selector: '.setting-item:nth-of-type(1)', target: 22 },
        { selector: '.btn-secondary[style*="rose"]', target: 3 },
        { selector: '.bottom-nav .nav-item:nth-child(1)', target: 5 },
        { selector: '.bottom-nav .nav-item:nth-child(2)', target: 9 },
        { selector: '.bottom-nav .nav-item:nth-child(3)', target: 14 },
        { selector: '.bottom-nav .nav-item:nth-child(4)', target: 19 }
      ]
    },
    22: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 21 },
        { selector: '.app-header .right .icon-pill', target: 21 },
        { selector: '.activity-item', target: 11, all: true }
      ]
    },
    23: {
      hotspots: [
        { selector: '.empty .btn-primary', target: 10 },
        { selector: '.bottom-nav .nav-item:nth-child(1)', target: 5 },
        { selector: '.bottom-nav .nav-item:nth-child(3)', target: 14 },
        { selector: '.bottom-nav .nav-item:nth-child(4)', target: 19 },
        { selector: '.bottom-nav .nav-item:nth-child(5)', target: 21 }
      ]
    },
    24: { auto: { next: 5, delay: 2200 } },
    25: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 5 },
        { selector: '.err .btn-primary', target: 5 }
      ]
    },
    26: {
      hotspots: [
        { selector: '.app-header .left .icon-pill', target: 5 },
        { selector: '.err .btn-secondary', target: 5 },
        { selector: '.err .btn-primary', target: 8 },
        { selector: '.setting-item:nth-of-type(2)', target: 8 }
      ]
    }
  };

  // ---------- State ----------
  const state = {
    screens: [],
    currentId: 1,
    history: [],
    autoTimer: null,
    toastTimer: null
  };

  // ---------- Bootstrap ----------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const source = document.getElementById('screensSource');
    if (!source) {
      showError('App data missing.');
      return;
    }

    const wraps = source.querySelectorAll('.device-wrap');
    wraps.forEach(w => {
      const id = parseInt(w.id.replace('screen-', ''), 10);
      if (!id) return;
      const nameEl = w.querySelector('.device-caption .name');
      const screenEl = w.querySelector('.device-screen');
      if (!screenEl) return;

      const section = SECTIONS.find(s => s.screens.includes(id));
      state.screens.push({
        id,
        name: nameEl ? nameEl.textContent.trim() : 'Screen ' + id,
        html: screenEl.innerHTML,
        sectionName: section ? section.name : 'Misc'
      });
    });
    state.screens.sort((a, b) => a.id - b.id);

    if (state.screens.length === 0) {
      showError('No screens found.');
      return;
    }

    buildScreensList();
    wireControls();
    setupKeyboard();
    goTo(1, { addToHistory: false, showToast: false });
  }

  function showError(msg) {
    const phone = document.getElementById('phoneScreen');
    if (phone) {
      phone.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-secondary);font-size:13px"><div style="font-size:32px;margin-bottom:12px">⚠️</div>' + msg + '</div>';
    }
  }

  // ---------- Screens drawer (slide-in screen picker) ----------
  function buildScreensList() {
    const list = document.getElementById('screensList');
    if (!list) return;
    list.innerHTML = '';
    SECTIONS.forEach((section, si) => {
      const group = document.createElement('div');
      group.className = 'group';
      group.innerHTML = '<div class="gh">' + String(si + 1).padStart(2, '0') + ' · ' + section.name + '</div>';
      section.screens.forEach(id => {
        const s = state.screens.find(x => x.id === id);
        if (!s) return;
        const item = document.createElement('div');
        item.className = 'item';
        item.dataset.screenId = id;
        item.innerHTML = '<span class="num">' + String(id).padStart(2, '0') + '</span><span class="lbl">' + s.name + '</span>';
        item.addEventListener('click', () => {
          goTo(id);
          closeDrawer();
        });
        group.appendChild(item);
      });
      list.appendChild(group);
    });
  }

  function refreshScreensList() {
    document.querySelectorAll('.screens-drawer .item').forEach(el => {
      const id = parseInt(el.dataset.screenId, 10);
      el.classList.toggle('is-active', id === state.currentId);
    });
    const active = document.querySelector('.screens-drawer .item.is-active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function openDrawer() {
    document.getElementById('screensDrawerOverlay')?.classList.add('is-open');
    document.getElementById('screensDrawer')?.classList.add('is-open');
    refreshScreensList();
  }
  function closeDrawer() {
    document.getElementById('screensDrawerOverlay')?.classList.remove('is-open');
    document.getElementById('screensDrawer')?.classList.remove('is-open');
  }

  // ---------- Floating controls ----------
  function wireControls() {
    document.getElementById('themeBtn')?.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });

    document.getElementById('screensBtn')?.addEventListener('click', openDrawer);
    document.getElementById('drawerClose')?.addEventListener('click', closeDrawer);
    document.getElementById('screensDrawerOverlay')?.addEventListener('click', closeDrawer);
  }

  // ---------- Render screen ----------
  function goTo(id, opts) {
    opts = opts || {};
    const addToHistory = opts.addToHistory !== false;
    const showToast = opts.showToast !== false;

    const screen = state.screens.find(s => s.id === id);
    if (!screen) return;

    clearTimeout(state.autoTimer);

    if (addToHistory && state.currentId && state.currentId !== id) {
      state.history.push(state.currentId);
      if (state.history.length > 50) state.history.shift();
    }
    state.currentId = id;

    const phone = document.getElementById('phoneScreen');
    if (phone) {
      phone.innerHTML = screen.html;
      phone.classList.remove('is-changing');
      // Restart animation
      void phone.offsetWidth;
      phone.classList.add('is-changing');
      wireScreen();
    }

    updateIndicator(screen);
    refreshScreensList();

    if (showToast) flashToast(screen.name);

    // Auto-advance for splash, loading
    const flow = FLOW[id];
    if (flow && flow.auto) {
      state.autoTimer = setTimeout(() => goTo(flow.auto.next, { showToast: false }), flow.auto.delay);
    }
  }

  function updateIndicator(screen) {
    const nameEl = document.getElementById('indicatorScreen');
    if (nameEl) nameEl.textContent = screen.name;
  }

  function flashToast(text) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('is-on');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toast.classList.remove('is-on'), 1400);
  }

  // ---------- Wire up interactivity within the current screen ----------
  function wireScreen() {
    const phone = document.getElementById('phoneScreen');
    if (!phone) return;

    // 1. Navigation hotspots
    const flow = FLOW[state.currentId];
    if (flow && flow.hotspots) {
      flow.hotspots.forEach(hs => {
        const all = hs.all === true;
        const targets = all ? phone.querySelectorAll(hs.selector) : [phone.querySelector(hs.selector)].filter(Boolean);
        targets.forEach(t => {
          if (!t || t.dataset.hsWired === '1') return;
          t.dataset.hsWired = '1';
          t.addEventListener('click', e => {
            // Only navigate if the click target isn't a known interactive widget below
            if (isInteractiveWidget(e.target, t)) return;
            e.preventDefault();
            e.stopPropagation();
            goTo(hs.target);
          });
        });
      });
    }

    // 2. Generic widget interactivity (so non-navigating controls still feel alive)

    // Tabs (segmented)
    phone.querySelectorAll('.tabs').forEach(group => {
      group.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          group.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
        });
      });
    });

    // Tabs (underline)
    phone.querySelectorAll('.tabs-u').forEach(group => {
      group.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          group.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
        });
      });
    });

    // Chart picker buttons
    phone.querySelectorAll('.picker').forEach(group => {
      group.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          group.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
        });
      });
    });

    // Filter pills — toggle (or single-select if first child is selected)
    phone.querySelectorAll('.filter-row').forEach(row => {
      row.querySelectorAll('.f-pill').forEach(pill => {
        pill.addEventListener('click', e => {
          e.stopPropagation();
          row.querySelectorAll('.f-pill').forEach(p => p.classList.remove('is-active'));
          pill.classList.add('is-active');
        });
      });
    });

    // Toggles
    phone.querySelectorAll('.toggle').forEach(t => {
      t.addEventListener('click', e => {
        e.stopPropagation();
        t.classList.toggle('is-on');
      });
    });

    // OTP boxes — clicking advances the cursor
    phone.querySelectorAll('.otp-boxes').forEach(boxes => {
      const items = Array.from(boxes.querySelectorAll('div'));
      items.forEach((it, i) => {
        it.addEventListener('click', e => {
          e.stopPropagation();
          items.forEach(x => x.classList.remove('is-active'));
          it.classList.add('is-active');
        });
      });
    });

    // Onboarding dots — visual progress
    phone.querySelectorAll('.onb-dots').forEach(dots => {
      dots.querySelectorAll('i').forEach((dot, i) => {
        dot.addEventListener('click', e => {
          e.stopPropagation();
          dots.querySelectorAll('i').forEach(d => d.classList.remove('is-active'));
          dot.classList.add('is-active');
        });
      });
    });

    // Inputs: focus on click and allow typing (clear default placeholder-style values on first focus if desired)
    phone.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('click', e => e.stopPropagation());
    });

    // Stop propagation on the entire bottom-sheet body so taps inside don't trigger scrim navigation
    phone.querySelectorAll('.bottom-sheet > div, [style*="border-radius:24px 24px 0 0"]').forEach(sheet => {
      sheet.addEventListener('click', e => e.stopPropagation());
    });
  }

  // Identify clicks that should be handled as widgets (not navigation)
  function isInteractiveWidget(el, hotspotEl) {
    // If the click target is INSIDE a tabs/picker/filter-row/toggle and the hotspot element is something larger, treat as widget
    const widgetSelectors = ['.tabs button', '.tabs-u button', '.picker button', '.f-pill', '.toggle'];
    for (let i = 0; i < widgetSelectors.length; i++) {
      const w = el.closest(widgetSelectors[i]);
      if (w && w !== hotspotEl && !hotspotEl.contains(w)) return true;
      // If hotspotEl itself is the widget, that's fine — navigation should still happen
    }
    return false;
  }

  // ---------- Keyboard ----------
  function setupKeyboard() {
    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        if (document.getElementById('screensDrawer')?.classList.contains('is-open')) {
          closeDrawer();
          return;
        }
        // Back
        if (state.history.length > 0) {
          const prev = state.history.pop();
          goTo(prev, { addToHistory: false });
        }
      } else if (e.key === 'ArrowRight') {
        const idx = state.screens.findIndex(s => s.id === state.currentId);
        if (idx < state.screens.length - 1) goTo(state.screens[idx + 1].id);
      } else if (e.key === 'ArrowLeft') {
        const idx = state.screens.findIndex(s => s.id === state.currentId);
        if (idx > 0) goTo(state.screens[idx - 1].id);
      } else if (e.key === 's' || e.key === 'S') {
        openDrawer();
      }
    });
  }
})();
