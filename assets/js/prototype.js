/* =========================================================
   Folio ERP — Interactive Prototype
   Loads screens from index.html and wires app-flow navigation.
   ========================================================= */

(function () {
  'use strict';

  // ---------- Theme ----------
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const STORAGE_KEY = 'folio-erp-theme';
  applyTheme(localStorage.getItem(STORAGE_KEY) || 'light');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.innerHTML = theme === 'dark'
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>'
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>';
    }
  }
  themeBtn && themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  });

  // ---------- Section labels ----------
  const SECTIONS = [
    { name: 'Onboarding & Auth', screens: [1, 2, 3, 4] },
    { name: 'Dashboard & Navigation', screens: [5, 6, 7, 8] },
    { name: 'Sales', screens: [9, 10, 11, 12, 13] },
    { name: 'Customers & Accounts', screens: [14, 15, 16] },
    { name: 'Proposals & Reports', screens: [17, 18, 19, 20] },
    { name: 'Settings & States', screens: [21, 22, 23, 24, 25, 26] }
  ];

  // ---------- Flow map ----------
  // Defines navigation: which DOM selector in each screen routes to which screen index.
  // 'auto' = auto-advance after delay (ms)
  const FLOW = {
    1: { auto: { next: 2, delay: 2400 }, info: 'Brand reveal · auto-advances to onboarding', actions: [{ label: 'Skip to onboarding', target: 2 }] },
    2: { hotspots: [
        { selector: '.onb .btn-primary', target: 3, label: 'Continue to login' },
        { selector: '.onb .skip', target: 3, label: 'Skip onboarding' }
      ], info: 'Onboarding · feature highlights · tap Next to continue', actions: [{ label: 'Go to login', target: 3 }] },
    3: { hotspots: [
        { selector: '.btn-primary', target: 4, label: 'Sign in → OTP' },
        { selector: '.auth-row .link', target: 4, label: 'Forgot password (demo: OTP)' }
      ], info: 'Sign in with email or social · biometric optional', actions: [{ label: 'Sign in', target: 4 }, { label: 'Use OTP', target: 4 }] },
    4: { hotspots: [
        { selector: '.btn-primary', target: 5, label: 'Verify → Dashboard' },
        { selector: '.icon-btn', target: 3, label: 'Back to login' }
      ], info: 'Enter the 6-digit code or use biometric', actions: [{ label: 'Verify & continue', target: 5 }, { label: 'Back to login', target: 3 }] },
    5: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 6, label: 'Open menu drawer' },
        { selector: '.app-header .right .icon-pill:nth-of-type(1)', target: 7, label: 'Search' },
        { selector: '.app-header .right .icon-pill:nth-of-type(2)', target: 8, label: 'Notifications' },
        { selector: '.fab', target: 10, label: 'Create new invoice' },
        { selector: '.bottom-nav .nav-item:nth-child(2)', target: 9, label: 'Sales / Invoices' },
        { selector: '.bottom-nav .nav-item:nth-child(3)', target: 14, label: 'Customers' },
        { selector: '.bottom-nav .nav-item:nth-child(4)', target: 19, label: 'Reports' },
        { selector: '.bottom-nav .nav-item:nth-child(5)', target: 21, label: 'Settings' },
        { selector: '.quick-act:nth-child(1)', target: 10, label: 'Quick: New invoice' },
        { selector: '.quick-act:nth-child(3)', target: 12, label: 'Quick: Quotation' }
      ], info: 'Home dashboard · revenue · KPIs · quick actions', actions: [
        { label: 'Open menu', target: 6 }, { label: 'Search', target: 7 },
        { label: 'Notifications', target: 8 }, { label: 'Create invoice (FAB)', target: 10 },
        { label: 'Go to Sales', target: 9 }, { label: 'Customers tab', target: 14 },
        { label: 'Reports tab', target: 19 }, { label: 'Settings tab', target: 21 }
      ] },
    6: { hotspots: [
        { selector: '.nav-link:nth-of-type(1)', target: 5, label: 'Dashboard' },
        { selector: '.nav-link:nth-of-type(2)', target: 9, label: 'Invoices' },
        { selector: '.nav-link:nth-of-type(3)', target: 12, label: 'Quotations' },
        { selector: '.nav-link:nth-of-type(4)', target: 17, label: 'Proposals' },
        { selector: '.nav-link:nth-of-type(5)', target: 13, label: 'Credit Notes' }
      ], info: 'Side drawer · all modules', actions: [
        { label: 'Dashboard', target: 5 }, { label: 'Invoices', target: 9 },
        { label: 'Quotations', target: 12 }, { label: 'Proposals', target: 17 },
        { label: 'Credit Notes', target: 13 }, { label: 'Accounts', target: 16 }
      ] },
    7: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 5, label: 'Back to dashboard' },
        { selector: '.list-item:nth-of-type(1)', target: 15, label: 'Open customer profile' }
      ], info: 'Global search · find anything fast', actions: [
        { label: 'Back to dashboard', target: 5 }, { label: 'Tap first customer', target: 15 }
      ] },
    8: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 5, label: 'Back' },
        { selector: '.notif-item:nth-of-type(1)', target: 11, label: 'Open paid invoice' },
        { selector: '.notif-item:nth-of-type(3)', target: 12, label: 'View approved quotation' }
      ], info: 'Notifications · payments · approvals · alerts', actions: [
        { label: 'Back to dashboard', target: 5 }, { label: 'Tap payment notification', target: 11 }
      ] },
    9: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 5, label: 'Back to dashboard' },
        { selector: '.fab', target: 10, label: 'Create new invoice' },
        { selector: '.list-item:nth-of-type(1)', target: 11, label: 'Open invoice INV-2412' },
        { selector: '.app-header .right .icon-pill:nth-of-type(2)', target: 20, label: 'Open filters' },
        { selector: '.bottom-nav .nav-item:nth-child(1)', target: 5, label: 'Home' },
        { selector: '.bottom-nav .nav-item:nth-child(3)', target: 14, label: 'Customers' },
        { selector: '.bottom-nav .nav-item:nth-child(4)', target: 19, label: 'Reports' },
        { selector: '.bottom-nav .nav-item:nth-child(5)', target: 21, label: 'Settings' }
      ], info: 'Invoices list · filter by status · swipe rows', actions: [
        { label: 'Create new', target: 10 }, { label: 'Open INV-2412', target: 11 }, { label: 'Filters', target: 20 }
      ] },
    10: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 9, label: 'Cancel · back to list' },
        { selector: '[style*="bottom:0"] .btn-primary', target: 11, label: 'Send invoice → preview' },
        { selector: '[style*="bottom:0"] .btn-secondary', target: 11, label: 'Preview invoice' }
      ], info: 'Create invoice · customer + items + auto tax', actions: [
        { label: 'Send invoice', target: 11 }, { label: 'Preview', target: 11 }, { label: 'Cancel', target: 9 }
      ] },
    11: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 9, label: 'Back to list' }
      ], info: 'Invoice preview · paid in full · share / PDF', actions: [
        { label: 'Back to list', target: 9 }, { label: 'Go to customer', target: 15 }
      ] },
    12: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 5, label: 'Back to dashboard' },
        { selector: '.fab', target: 10, label: 'New quotation (demo: invoice)' },
        { selector: '.list-item:nth-of-type(4)', target: 11, label: 'Convert approved → invoice' },
        { selector: '.bottom-nav .nav-item:nth-child(1)', target: 5, label: 'Home' }
      ], info: 'Quotations · send · approve · convert', actions: [
        { label: 'New quotation', target: 10 }, { label: 'Convert approved', target: 11 }
      ] },
    13: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 6, label: 'Back to drawer' },
        { selector: '[style*="bottom:0"] .btn-primary', target: 9, label: 'Issue credit note' }
      ], info: 'Credit note · refund linked to invoice', actions: [
        { label: 'Issue credit note', target: 9 }, { label: 'Back', target: 6 }
      ] },
    14: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 6, label: 'Open drawer' },
        { selector: '.list-item:nth-of-type(1)', target: 15, label: 'Open Sharma Traders' },
        { selector: '.list-item', target: 15, label: 'Open customer profile' },
        { selector: '.bottom-nav .nav-item:nth-child(1)', target: 5, label: 'Home' },
        { selector: '.bottom-nav .nav-item:nth-child(2)', target: 9, label: 'Sales' },
        { selector: '.bottom-nav .nav-item:nth-child(4)', target: 19, label: 'Reports' },
        { selector: '.bottom-nav .nav-item:nth-child(5)', target: 21, label: 'Settings' }
      ], info: 'Customers · A–Z list · balance & status', actions: [
        { label: 'Open a customer', target: 15 }, { label: 'Back home', target: 5 }
      ] },
    15: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 14, label: 'Back to list' },
        { selector: '.profile-actions .pa:nth-child(4)', target: 10, label: 'New invoice for customer' }
      ], info: 'Customer 360° · transactions · balance · contact', actions: [
        { label: 'Back to list', target: 14 }, { label: 'New invoice', target: 10 }
      ] },
    16: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 6, label: 'Back to drawer' }
      ], info: 'Accounts · cash position · banks · transactions', actions: [
        { label: 'Back', target: 6 }, { label: 'Open reports', target: 19 }
      ] },
    17: { hotspots: [
        { selector: '.btn-primary', target: 18, label: 'Send reminder · open signature' }
      ], info: 'Proposal cover & approval tracker', actions: [
        { label: 'Open e-signature', target: 18 }, { label: 'Back to drawer', target: 6 }
      ] },
    18: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 17, label: 'Back to proposal' },
        { selector: '[style*="bottom:0"] .btn-success', target: 11, label: 'Sign → invoice issued' }
      ], info: 'E-sign · approve · audit trail', actions: [
        { label: 'Approve & sign', target: 11 }, { label: 'Back', target: 17 }
      ] },
    19: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 6, label: 'Open menu' },
        { selector: '.bottom-nav .nav-item:nth-child(1)', target: 5, label: 'Home' },
        { selector: '.bottom-nav .nav-item:nth-child(2)', target: 9, label: 'Sales' },
        { selector: '.bottom-nav .nav-item:nth-child(3)', target: 14, label: 'Customers' },
        { selector: '.bottom-nav .nav-item:nth-child(5)', target: 21, label: 'Settings' }
      ], info: 'Reports · revenue · categories · top customers', actions: [
        { label: 'Back home', target: 5 }, { label: 'Open settings', target: 21 }
      ] },
    20: { hotspots: [
        { selector: '[style*="z-index"] .btn-primary, .btn-primary', target: 9, label: 'Apply filters → back to list' },
        { selector: '.btn-secondary', target: 9, label: 'Cancel filters' }
      ], info: 'Filter bottom sheet · status · date · amount', actions: [
        { label: 'Apply filters', target: 9 }, { label: 'Cancel', target: 9 }
      ] },
    21: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 5, label: 'Back to dashboard' },
        { selector: '.card[style*="padding:18px"]', target: 22, label: 'Open my profile' },
        { selector: '.bottom-nav .nav-item:nth-child(1)', target: 5, label: 'Home' }
      ], info: 'Settings · workspace · preferences · security', actions: [
        { label: 'Open my profile', target: 22 }, { label: 'Back', target: 5 }
      ] },
    22: { hotspots: [
        { selector: '.app-header .left .icon-pill', target: 21, label: 'Back to settings' }
      ], info: 'User profile · plan card · activity', actions: [
        { label: 'Back to settings', target: 21 }, { label: 'Home', target: 5 }
      ] },
    23: { hotspots: [
        { selector: '.empty .btn-primary', target: 10, label: 'Create first invoice' },
        { selector: '.bottom-nav .nav-item:nth-child(1)', target: 5, label: 'Home' }
      ], info: 'Empty state · clear CTA · helpful guides', actions: [
        { label: 'Create first invoice', target: 10 }, { label: 'Home', target: 5 }
      ] },
    24: { auto: { next: 5, delay: 2200 }, info: 'Loading skeleton · auto-resolves to dashboard', actions: [{ label: 'Skip to dashboard', target: 5 }] },
    25: { hotspots: [
        { selector: '.err .btn-primary', target: 5, label: 'Retry → dashboard' }
      ], info: 'Offline mode · drafts saved · retry', actions: [
        { label: 'Retry', target: 5 }, { label: 'Open drafts', target: 9 }
      ] },
    26: { hotspots: [
        { selector: '.err .btn-secondary', target: 5, label: 'Go back home' }
      ], info: 'Permission denied · request access', actions: [
        { label: 'Go back', target: 5 }, { label: 'Settings', target: 21 }
      ] }
  };

  // Guided tour: ordered walkthrough of key screens
  const TOUR = [1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26];

  // ---------- State ----------
  const state = {
    screens: [],          // [{id, name, desc, html, sectionIdx, sectionName, indexInBoard}]
    currentIdx: 0,        // index into TOUR/screens by id
    currentId: 1,
    sprite: '',
    history: [],
    visited: new Set(),
    tourActive: false,
    tourTimer: null,
    autoTimer: null
  };

  // ---------- Bootstrap ----------
  init();

  async function init() {
    try {
      const res = await fetch('index.html');
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, 'text/html');

      // Extract sprite (SVG <defs>)
      const sprite = doc.querySelector('svg[width="0"]');
      if (sprite) state.sprite = sprite.outerHTML;

      // Inject sprite into prototype document so <use href="#i-x"/> works
      const spriteHost = document.getElementById('spriteHost');
      if (spriteHost && state.sprite) spriteHost.innerHTML = state.sprite;

      // Extract all 26 screens
      const wraps = doc.querySelectorAll('.device-wrap');
      wraps.forEach((w, i) => {
        const id = parseInt(w.id.replace('screen-', ''), 10) || (i + 1);
        const nameEl = w.querySelector('.device-caption .name');
        const descEl = w.querySelector('.device-caption .desc');
        const screenEl = w.querySelector('.device-screen');
        if (!screenEl) return;

        // Section lookup
        const section = SECTIONS.find(s => s.screens.includes(id));
        state.screens.push({
          id,
          name: nameEl ? nameEl.textContent.trim() : `Screen ${id}`,
          desc: descEl ? descEl.textContent.trim() : '',
          html: screenEl.innerHTML,
          sectionName: section ? section.name : 'Misc'
        });
      });

      // Sort by id to ensure order
      state.screens.sort((a, b) => a.id - b.id);

      buildFlowMap();
      goTo(1, { addToHistory: false });
      hideLoader();
      setupKeyboard();
    } catch (e) {
      console.error('Failed to load prototype:', e);
      document.getElementById('loaderTxt').textContent = 'Failed to load. Please refresh.';
    }
  }

  function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('is-hidden');
  }

  // ---------- Flow map (left rail) ----------
  function buildFlowMap() {
    const rail = document.getElementById('flowRail');
    if (!rail) return;
    rail.innerHTML = '<h2>App Flow</h2>';

    SECTIONS.forEach((section, sIdx) => {
      const groupEl = document.createElement('div');
      groupEl.className = 'flow-group';
      groupEl.innerHTML = `<div class="gh"><span class="num">0${sIdx + 1}</span> ${section.name}</div>`;

      section.screens.forEach(id => {
        const screen = state.screens.find(s => s.id === id);
        if (!screen) return;
        const item = document.createElement('div');
        item.className = 'flow-item';
        item.setAttribute('data-screen-id', id);
        item.innerHTML = `
          <span class="dot"></span>
          <span class="lbl">${screen.name}</span>
          <span class="idx">${String(id).padStart(2, '0')}</span>
        `;
        item.addEventListener('click', () => goTo(id));
        groupEl.appendChild(item);
      });

      rail.appendChild(groupEl);
    });
  }

  function refreshFlowMap() {
    document.querySelectorAll('.flow-item').forEach(el => {
      const id = parseInt(el.getAttribute('data-screen-id'), 10);
      el.classList.toggle('is-active', id === state.currentId);
      el.classList.toggle('is-visited', state.visited.has(id) && id !== state.currentId);
    });

    // Auto-scroll active into view
    const active = document.querySelector('.flow-item.is-active');
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // ---------- Render screen ----------
  function goTo(id, opts = {}) {
    const { addToHistory = true } = opts;
    const screen = state.screens.find(s => s.id === id);
    if (!screen) return;

    // Clear timers
    clearTimeout(state.autoTimer);

    // History
    if (addToHistory && state.currentId && state.currentId !== id) {
      state.history.push(state.currentId);
      if (state.history.length > 30) state.history.shift();
    }

    state.currentId = id;
    state.visited.add(id);

    // Fade animation
    const screenEl = document.getElementById('phoneScreen');
    if (screenEl) {
      screenEl.style.opacity = '0';
      setTimeout(() => {
        screenEl.innerHTML = screen.html;
        screenEl.style.opacity = '1';
        wireHotspots(screen.id);
      }, 160);
    }

    updateInfoPanel(screen);
    refreshFlowMap();
    updateStageTop(screen);

    // Auto-advance (splash, loading)
    const flow = FLOW[id];
    if (flow && flow.auto) {
      state.autoTimer = setTimeout(() => goTo(flow.auto.next), flow.auto.delay);
    }

    // Tour continuation
    if (state.tourActive) {
      clearTimeout(state.tourTimer);
      const tourPos = TOUR.indexOf(id);
      if (tourPos === -1 || tourPos === TOUR.length - 1) {
        // End of tour
        stopTour();
      } else {
        state.tourTimer = setTimeout(() => {
          if (state.tourActive) goTo(TOUR[tourPos + 1]);
        }, 2800);
      }
    }
  }

  // ---------- Hotspots ----------
  function wireHotspots(screenId) {
    const flow = FLOW[screenId];
    if (!flow || !flow.hotspots) return;

    const screenEl = document.getElementById('phoneScreen');
    if (!screenEl) return;

    flow.hotspots.forEach((hs, i) => {
      const targets = screenEl.querySelectorAll(hs.selector);
      targets.forEach(t => {
        t.style.cursor = 'pointer';
        t.style.position = t.style.position || 'relative';
        t.setAttribute('data-hotspot-id', i);
        t.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          goTo(hs.target);
        }, { once: false });
      });
      // Only attach to first match to avoid stacking on duplicates
    });

    // Add ping indicators on the *first* hotspot of each unique selector
    if (flow.hotspots.length > 0) {
      // Wait a tick for layout
      requestAnimationFrame(() => paintHotspotPings(flow.hotspots));
    }
  }

  function paintHotspotPings(hotspots) {
    const screenEl = document.getElementById('phoneScreen');
    if (!screenEl) return;
    // Remove old pings
    screenEl.querySelectorAll('.hotspot').forEach(p => p.remove());

    const seen = new Set();
    hotspots.forEach(hs => {
      if (seen.has(hs.selector)) return;
      const target = screenEl.querySelector(hs.selector);
      if (!target) return;
      seen.add(hs.selector);

      const rect = target.getBoundingClientRect();
      const containerRect = screenEl.getBoundingClientRect();
      const top = rect.top - containerRect.top + (rect.height / 2) - 9;
      const left = rect.left - containerRect.left + (rect.width / 2) - 9;

      // Skip if target is off-screen
      if (top < 0 || top > containerRect.height || left < 0 || left > containerRect.width) return;

      const ping = document.createElement('div');
      ping.className = 'hotspot';
      ping.style.top = top + 'px';
      ping.style.left = left + 'px';
      screenEl.appendChild(ping);
    });
  }

  // ---------- Info panel (right rail) ----------
  function updateInfoPanel(screen) {
    const titleEl = document.getElementById('infoTitle');
    const descEl = document.getElementById('infoDesc');
    const eyebrowEl = document.getElementById('infoEyebrow');
    const actionsEl = document.getElementById('infoActions');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (titleEl) titleEl.textContent = screen.name;
    if (descEl) {
      const flow = FLOW[screen.id];
      descEl.textContent = flow && flow.info ? flow.info : screen.desc;
    }
    if (eyebrowEl) eyebrowEl.textContent = `Step ${String(screen.id).padStart(2, '0')} · ${screen.sectionName}`;

    // Actions
    if (actionsEl) {
      const flow = FLOW[screen.id];
      const actions = (flow && flow.actions) || [];
      actionsEl.innerHTML = '';
      if (actions.length === 0) {
        actionsEl.innerHTML = '<div style="font-size:12px;color:var(--text-tertiary);padding:8px 4px">No actions on this screen.</div>';
      }
      actions.forEach(a => {
        const btn = document.createElement('button');
        btn.className = 'info-action';
        btn.innerHTML = `
          <span class="ic"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
          <span>${a.label}</span>
        `;
        btn.addEventListener('click', () => goTo(a.target));
        actionsEl.appendChild(btn);
      });
    }

    // Prev / Next buttons
    const currentIdx = state.screens.findIndex(s => s.id === screen.id);
    if (prevBtn) prevBtn.disabled = currentIdx <= 0;
    if (nextBtn) nextBtn.disabled = currentIdx >= state.screens.length - 1;
  }

  function updateStageTop(screen) {
    const nameEl = document.getElementById('stageName');
    const idxEl = document.getElementById('stageIdx');
    if (nameEl) nameEl.textContent = screen.name;
    if (idxEl) idxEl.textContent = `${String(state.screens.findIndex(s => s.id === screen.id) + 1).padStart(2, '0')} / ${state.screens.length}`;
  }

  // ---------- Navigation buttons ----------
  document.getElementById('prevBtn')?.addEventListener('click', () => {
    const idx = state.screens.findIndex(s => s.id === state.currentId);
    if (idx > 0) goTo(state.screens[idx - 1].id);
  });
  document.getElementById('nextBtn')?.addEventListener('click', () => {
    const idx = state.screens.findIndex(s => s.id === state.currentId);
    if (idx < state.screens.length - 1) goTo(state.screens[idx + 1].id);
  });
  document.getElementById('backBtn')?.addEventListener('click', () => {
    if (state.history.length === 0) return;
    const prev = state.history.pop();
    goTo(prev, { addToHistory: false });
  });
  document.getElementById('restartBtn')?.addEventListener('click', () => {
    state.history = [];
    state.visited.clear();
    stopTour();
    goTo(1, { addToHistory: false });
  });

  // ---------- Tour ----------
  document.getElementById('tourBtn')?.addEventListener('click', () => {
    if (state.tourActive) stopTour();
    else startTour();
  });

  function startTour() {
    state.tourActive = true;
    document.getElementById('tourBtn')?.classList.add('is-on');
    document.getElementById('tourBtnLabel') && (document.getElementById('tourBtnLabel').textContent = 'Stop tour');
    goTo(TOUR[0], { addToHistory: false });
  }
  function stopTour() {
    state.tourActive = false;
    clearTimeout(state.tourTimer);
    document.getElementById('tourBtn')?.classList.remove('is-on');
    document.getElementById('tourBtnLabel') && (document.getElementById('tourBtnLabel').textContent = 'Start guided tour');
  }

  // ---------- Keyboard ----------
  function setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        document.getElementById('nextBtn')?.click();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        document.getElementById('prevBtn')?.click();
      } else if (e.key === 'Escape') {
        document.getElementById('backBtn')?.click();
      } else if (e.key === 'r' || e.key === 'R') {
        document.getElementById('restartBtn')?.click();
      } else if (e.key === ' ') {
        e.preventDefault();
        document.getElementById('tourBtn')?.click();
      }
    });
  }
})();
