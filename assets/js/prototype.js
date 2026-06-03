/* =========================================================
   Folio ERP — Phase 1 MVP App Runtime
   Provides in-memory state persistence and dynamic interactive 
   workflows for all 13 MVP screens.
   ========================================================= */

(function () {
  'use strict';

  // ---------- Local Storage and Theme Cache ----------
  const STORAGE_KEY = 'folio-erp-theme';
  const DB_KEY = 'folio-erp-db-v1';
  const root = document.documentElement;

  // Initialize Theme
  applyTheme(localStorage.getItem(STORAGE_KEY) || 'dark');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    // Sync settings page theme toggles if present
    const floatIcon = document.getElementById('themeIconFloat');
    const toolbarIcon = document.getElementById('themeIcon');
    const sunIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>`;
    const moonIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>`;
    
    if (floatIcon) floatIcon.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
    if (toolbarIcon) toolbarIcon.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
  }

  // ---------- In-Memory State Database ----------
  const DEFAULT_DB = {
    customers: [
      { id: 1, name: 'Sharma Traders', phone: '9876543210', email: 'sharma@traders.com', gst: '22AAAAA1111A1Z0', address: 'Plot 4, Industrial Area, Sector 5, Delhi', notes: 'Net 30 payment terms', outstanding: 120000 },
      { id: 2, name: 'Rahul Mehta', phone: '9822334455', email: 'rahul@mehta.co', gst: '', address: '402, Trade Tower, Mumbai', notes: 'Premium VIP Account', outstanding: 45000 },
      { id: 3, name: 'Neha Patel', phone: '9123456789', email: 'neha@patel.com', gst: '22BBBBB1111A1Z1', address: 'Green Glen Layout, Bangalore', notes: 'Prompt payer', outstanding: 0 }
    ],
    invoices: [
      { id: 101, customerId: 1, customerName: 'Sharma Traders', date: '2026-06-02', amount: 120000, status: 'Overdue', items: [{ name: 'Enterprise Software Subscription', qty: 1, rate: 120000 }] },
      { id: 102, customerId: 2, customerName: 'Rahul Mehta', date: '2026-06-03', amount: 45000, status: 'Pending', items: [{ name: 'Consulting Service (Hours)', qty: 15, rate: 3000 }] }
    ],
    expenses: [
      { id: 1, title: 'Fuel for Delivery Truck', category: 'Fuel', amount: 2400, date: '2026-06-01', notes: 'Receipt uploaded' },
      { id: 2, title: 'Office Internet Broadband', category: 'Office', amount: 1500, date: '2026-06-01', notes: 'Monthly recurring plan' },
      { id: 3, title: 'Server Cloud Hosting', category: 'Maintenance', amount: 8900, date: '2026-06-02', notes: 'AWS instance renewal' }
    ],
    categories: ['Fuel', 'Travel', 'Salary', 'Office', 'Maintenance', 'Others'],
    bills: [
      { id: 1, vendor: 'Acma Distributors', number: 'BILL-5541', date: '2026-06-01', amount: 24500, notes: 'Raw materials supply' },
      { id: 2, vendor: 'Global Office Supplies', number: 'BILL-9821', date: '2026-06-02', amount: 3200, notes: 'Stationery and paper supply' }
    ],
    settings: {
      companyName: 'Folio Enterprise',
      companyGst: '22AAAAA1111A1Z0',
      companyAddress: '402, Trade Tower, Mumbai',
      userName: 'Rahul Mehta',
      userEmail: 'rahul@folio.com',
      userPhone: '+91 98765 43210',
      currency: 'INR',
      dateFormat: 'YYYY-MM-DD',
      isDarkMode: true
    },
    activity: [
      { id: 1, text: 'Invoice INV-102 created for Rahul Mehta', details: 'Amount: ₹45,000', date: '2h ago', type: 'invoice' },
      { id: 2, text: 'Expense Office Internet Broadband added', details: 'Amount: ₹1,500', date: '5h ago', type: 'expense' },
      { id: 3, text: 'Purchase bill BILL-5541 uploaded from Acma Distributors', details: 'Amount: ₹24,500', date: 'Yesterday', type: 'bill' }
    ]
  };

  let db = JSON.parse(localStorage.getItem(DB_KEY)) || DEFAULT_DB;

  function saveDB() {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  // ---------- App Navigation State ----------
  const state = {
    screens: [],
    currentId: 1,
    history: [],
    toastTimer: null,
    
    // Active navigation and filters
    activeInvoiceFilter: 'all',
    activeExpenseFilter: 'all',
    customerSearchQuery: '',
    invoiceSearchQuery: '',
    billSearchQuery: '',
    expenseSearchQuery: '',

    // Form Temporary states
    newInvoice: {
      customerId: null,
      items: [{ name: '', qty: 1, rate: 0 }],
      discount: 0
    },
    uploadedImage: null,
    invoiceStep: 1,

    // AI Chat history state
    chatHistory: [
      { sender: 'assistant', text: "Hello! I am your Folio AI Assistant. How can I help you manage your business today?\n\nYou can ask me about:\n• Today's sales summary\n• Pending invoices\n• Outstanding customer balances" }
    ],
    currentAttachment: null
  };

  // Helper to format currency
  function formatAmount(val) {
    const symbol = db.settings.currency === 'USD' ? '$' : db.settings.currency === 'EUR' ? '€' : '₹';
    return `${symbol} ${Number(val || 0).toLocaleString('en-IN')}`;
  }

  // ---------- Bootstrap and Screen Loading ----------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const source = document.getElementById('screensSource');
    if (!source) return;

    const wraps = source.querySelectorAll('.device-wrap');
    wraps.forEach(w => {
      const idStr = w.id.replace('screen-', '');
      const id = parseInt(idStr, 10);
      if (!id) return;
      const nameEl = w.querySelector('.device-caption .name');
      const screenEl = w.querySelector('.device-screen');
      if (!screenEl) return;

      state.screens.push({
        id,
        name: nameEl ? nameEl.textContent.trim() : 'Screen ' + id,
        html: screenEl.innerHTML
      });
    });
    state.screens.sort((a, b) => a.id - b.id);

    wireFloatingControls();
    setupKeyboard();
    goTo(1, { addToHistory: false, showToast: false });
  }

  // ---------- Navigate to Screen ----------
  function goTo(id, opts) {
    opts = opts || {};
    const addToHistory = opts.addToHistory !== false;
    const showToast = opts.showToast !== false;

    const screen = state.screens.find(s => s.id === id);
    if (!screen) return;

    if (addToHistory && state.currentId && state.currentId !== id) {
      state.history.push(state.currentId);
      if (state.history.length > 30) state.history.shift();
    }
    state.currentId = id;

    const phone = document.getElementById('phoneScreen');
    if (phone) {
      phone.innerHTML = screen.html;
      phone.classList.remove('is-changing');
      void phone.offsetWidth; // Force reflow
      phone.classList.add('is-changing');

      // Inject Global App shell wrapper items (Bottom Navigation / FAB sheet) for main views
      const tabsScreens = [2, 3, 5, 8, 10, 13, 14];
      if (tabsScreens.includes(id)) {
        injectAppShell(phone, id);
      }

      // Run dynamic renderers for interactive elements
      renderScreenContent(id, phone);
      wireScreenInteractions(id, phone);
    }

    // Update outer chrome info
    const nameEl = document.getElementById('indicatorScreen');
    if (nameEl) nameEl.textContent = screen.name;
    
    // Highlight items in screens drawer
    document.querySelectorAll('.screens-drawer .item').forEach(el => {
      const sId = parseInt(el.dataset.screenId, 10);
      el.classList.toggle('is-active', sId === id);
    });

    if (showToast) flashToast(screen.name);
  }

  // Flash a notification toast
  function flashToast(text) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('is-on');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toast.classList.remove('is-on'), 1400);
  }

  // Inject Navigation bar and FAB button structure
  function injectAppShell(phoneContainer, activeId) {
    // 1. Navigation Menu
    const navDiv = document.createElement('div');
    navDiv.className = 'bottom-nav';
    navDiv.innerHTML = `
      <a class="nav-item ${activeId === 2 ? 'is-active' : ''}" data-tab="2"><svg width="20" height="20"><use href="#i-home"/></svg><span>Dashboard</span></a>
      <a class="nav-item ${activeId === 5 ? 'is-active' : ''}" data-tab="5"><svg width="20" height="20"><use href="#i-receipt"/></svg><span>Invoices</span></a>
      <a class="nav-item ${activeId === 14 ? 'is-active' : ''}" data-tab="14"><svg width="20" height="20"><use href="#i-msg"/></svg><span>AI Chat</span></a>
      <a class="nav-item ${activeId === 13 ? 'is-active' : ''}" data-tab="13"><svg width="20" height="20"><use href="#i-settings"/></svg><span>Settings</span></a>
      <div class="home-indicator"></div>
    `;    // Append to body
    phoneContainer.appendChild(navDiv);

    // Set bottom padding for screen body to avoid nav overlap
    const body = phoneContainer.querySelector('.screen-body') || phoneContainer;
    body.style.paddingBottom = activeId === 14 ? '0px' : '80px';
  }

  // ---------- Dynamic Data Renderers ----------
  function renderScreenContent(id, container) {
    if (id === 2) {
      // Dashboard Content
      // Update values
      const totalSales = db.invoices.filter(i => i.status === 'Paid').reduce((sum, curr) => sum + curr.amount, 0);
      const pendingCount = db.invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue').length;
      const monthExpense = db.expenses.reduce((sum, curr) => sum + curr.amount, 0);
      const totalCust = db.customers.length;

      const salesEl = container.querySelector('#val-today-sales');
      const pendingEl = container.querySelector('#val-pending-invoices');
      const expenseEl = container.querySelector('#val-month-expense');
      const custEl = container.querySelector('#val-total-customers');

      if (salesEl) salesEl.textContent = formatAmount(totalSales);
      if (pendingEl) pendingEl.textContent = pendingCount;
      if (expenseEl) expenseEl.textContent = formatAmount(monthExpense);
      if (custEl) custEl.textContent = totalCust;

      // Render activities list
      const listEl = container.querySelector('#dashboard-activity-list');
      if (listEl) {
        listEl.innerHTML = db.activity.map(act => {
          let dotColor = 'tone-brand';
          let icon = 'i-doc';
          if (act.type === 'expense') { dotColor = 'tone-rose'; icon = 'i-wallet'; }
          else if (act.type === 'bill') { dotColor = 'tone-amber'; icon = 'i-doc'; }
          else if (act.type === 'customer') { dotColor = 'tone-emerald'; icon = 'i-users'; }

          return `
            <div class="activity-item" style="cursor: pointer;">
              <div class="ic ${dotColor}"><svg width="18" height="18"><use href="#${icon}"/></svg></div>
              <div class="body">
                <div class="t">${act.text}</div>
                <div class="sub">${act.details} · ${act.date}</div>
              </div>
              <svg width="14" height="14" style="color:var(--text-tertiary)"><use href="#i-chevron-right"/></svg>
            </div>
          `;
        }).join('');
      }

      // Company info
      const compName = container.querySelector('#dashboard-company-name');
      const logoAv = container.querySelector('#company-logo-avatar');
      const profileName = container.querySelector('#dashboard-user-name');
      if (compName) compName.textContent = db.settings.companyName;
      if (profileName) profileName.textContent = db.settings.userName;
      if (logoAv) {
        logoAv.textContent = db.settings.companyName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      }
    } 
    else if (id === 3) {
      // Customer List
      const listContainer = container.querySelector('#customer-list-container');
      if (listContainer) {
        const filtered = db.customers.filter(c => {
          const q = state.customerSearchQuery.toLowerCase();
          return c.name.toLowerCase().includes(q) || c.phone.includes(q);
        });

        if (filtered.length === 0) {
          listContainer.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-tertiary)">No customers found.</div>`;
        } else {
          listContainer.innerHTML = filtered.map(c => `
            <div class="list-item" data-customer-id="${c.id}" style="cursor: pointer;">
              <div class="avatar sm" style="background:var(--bg-subtle); color:var(--text-primary); border:1px solid var(--border)">
                ${c.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div class="body">
                <div class="ttl">${c.name}</div>
                <div class="sub">${c.phone} ${c.gst ? '· GST: ' + c.gst : ''}</div>
              </div>
              <div class="right">
                <div class="amt" style="${c.outstanding > 0 ? 'color: var(--amber-500)' : 'color: var(--text-secondary)'}">
                  ${formatAmount(c.outstanding)}
                </div>
                <div class="meta">Outstanding</div>
              </div>
            </div>
          `).join('');
        }
      }
    } 
    else if (id === 5) {
      // Invoice List
      const listContainer = container.querySelector('#invoice-list-container');
      if (listContainer) {
        const filtered = db.invoices.filter(inv => {
          // Filter by status pill
          if (state.activeInvoiceFilter !== 'all' && inv.status !== state.activeInvoiceFilter) return false;
          // Filter by search query
          const q = state.invoiceSearchQuery.toLowerCase();
          return `inv-${inv.id}`.includes(q) || inv.customerName.toLowerCase().includes(q);
        });

        if (filtered.length === 0) {
          listContainer.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-tertiary)">No invoices found.</div>`;
        } else {
          listContainer.innerHTML = filtered.map(inv => {
            let tone = 'tone-brand';
            if (inv.status === 'Paid') tone = 'tone-success';
            if (inv.status === 'Overdue') tone = 'tone-danger';
            if (inv.status === 'Pending') tone = 'tone-warning';

            return `
              <div class="list-item" data-invoice-id="${inv.id}" style="cursor: pointer;">
                <div class="body">
                  <div class="ttl">INV-${inv.id}</div>
                  <div class="sub">${inv.customerName} · ${inv.date}</div>
                </div>
                <div class="right">
                  <div class="amt">${formatAmount(inv.amount)}</div>
                  <span class="chip ${tone}" style="margin-top: 4px; padding: 2px 8px; font-size:10px">${inv.status}</span>
                </div>
              </div>
            `;
          }).join('');
        }
      }
    } 
    else if (id === 6) {
      // Create Invoice Step Panels
      const nextInvNum = db.invoices.length > 0 ? Math.max(...db.invoices.map(i => i.id)) + 1 : 101;
      const numEl = container.querySelector('#create-inv-number');
      if (numEl) numEl.textContent = `INV-${nextInvNum}`;

      // Step 1: Render Customer choices
      const custBox = container.querySelector('#inv-cust-list');
      if (custBox) {
        const filtered = db.customers.filter(c => {
          const q = (container.querySelector('#inv-cust-search')?.value || '').toLowerCase();
          return c.name.toLowerCase().includes(q) || c.phone.includes(q);
        });

        custBox.innerHTML = filtered.map(c => `
          <div class="card card-tight" data-select-cust="${c.id}" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:${state.newInvoice.customerId === c.id ? 'rgba(79, 140, 255, 0.1)' : 'var(--bg-card)'}; border-color:${state.newInvoice.customerId === c.id ? 'var(--brand-500)' : 'var(--border)'}">
            <div>
              <div style="font-size:13px; font-weight:600;">${c.name}</div>
              <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">${c.phone}</div>
            </div>
            <div style="font-size:12px; font-weight:600; color:var(--text-secondary)">
              ${formatAmount(c.outstanding)} Outstanding
            </div>
          </div>
        `).join('');
      }

      // Step 2: Render Items Rows
      const itemsContainer = container.querySelector('#invoice-items-list-container');
      if (itemsContainer) {
        itemsContainer.innerHTML = state.newInvoice.items.map((it, idx) => `
          <div class="item-row" data-index="${idx}">
            <input class="input item-name-inp" type="text" placeholder="Item Name" value="${it.name || ''}" />
            <input class="input item-qty-inp" type="number" placeholder="Qty" value="${it.qty || 1}" min="1" />
            <input class="input item-rate-inp" type="number" placeholder="Rate" value="${it.rate || ''}" />
            <button class="remove-item-btn" data-remove-index="${idx}"><svg width="14" height="14"><use href="#i-trash"/></svg></button>
          </div>
        `).join('');
      }

      // Step 3: Render Summary Calculation
      if (state.invoiceStep === 3) {
        const selectedCust = db.customers.find(c => c.id === state.newInvoice.customerId);
        if (selectedCust) {
          container.querySelector('#inv-summary-cust-name').textContent = selectedCust.name;
          container.querySelector('#inv-summary-cust-details').textContent = `${selectedCust.phone} · ${selectedCust.address || 'No Address'}`;
        }

        // Calculate totals
        let subtotal = 0;
        const summaryItemsContainer = container.querySelector('#inv-summary-items');
        if (summaryItemsContainer) {
          summaryItemsContainer.innerHTML = state.newInvoice.items.map(it => {
            const lineTotal = (it.qty || 0) * (it.rate || 0);
            subtotal += lineTotal;
            return `
              <div style="display:flex; justify-content:space-between; font-size:13px;">
                <span>${it.name || 'Unnamed Item'} <span style="color:var(--text-tertiary)">x${it.qty}</span></span>
                <span>${formatAmount(lineTotal)}</span>
              </div>
            `;
          }).join('');
        }

        const discInput = container.querySelector('#inv-discount-pct');
        const discPct = discInput ? parseFloat(discInput.value || 0) : 0;
        const discountAmount = subtotal * (discPct / 100);
        const taxAmount = (subtotal - discountAmount) * 0.18;
        const total = (subtotal - discountAmount) + taxAmount;

        container.querySelector('#inv-summary-subtotal').textContent = formatAmount(subtotal);
        container.querySelector('#inv-summary-tax').textContent = formatAmount(taxAmount);
        container.querySelector('#inv-summary-total').textContent = formatAmount(total);
      }
    } 
    else if (id === 7) {
      // Invoice Details Screen
      const activeInvoice = db.invoices.find(i => i.id === state.activeInvoiceId);
      if (activeInvoice) {
        container.querySelector('#invdetails-number').textContent = `INV-${activeInvoice.id}`;
        container.querySelector('#invdetails-date').textContent = `Date: ${activeInvoice.date}`;
        container.querySelector('#invdetails-cust-name').textContent = activeInvoice.customerName;

        const customer = db.customers.find(c => c.id === activeInvoice.customerId);
        if (customer) {
          container.querySelector('#invdetails-cust-details').textContent = `${customer.phone} · ${customer.email || ''}`;
        }

        // Render Status Badge
        const statusEl = container.querySelector('#invdetails-status');
        if (statusEl) {
          statusEl.textContent = activeInvoice.status;
          statusEl.className = 'chip';
          if (activeInvoice.status === 'Paid') statusEl.classList.add('tone-success');
          else if (activeInvoice.status === 'Overdue') statusEl.classList.add('tone-danger');
          else statusEl.classList.add('tone-warning');
        }

        // Render Items List
        const itemsContainer = container.querySelector('#invdetails-items-container');
        if (itemsContainer) {
          itemsContainer.innerHTML = activeInvoice.items.map(it => `
            <div style="display:flex; justify-content:space-between; font-size:13px;">
              <span>${it.name || 'Services'} <span style="color:var(--text-tertiary)">x${it.qty}</span></span>
              <span>${formatAmount(it.qty * it.rate)}</span>
            </div>
          `).join('');
        }

        // Render math summary
        const subtotal = activeInvoice.items.reduce((sum, curr) => sum + (curr.qty * curr.rate), 0);
        // Reverse calculate tax/discount from total
        const totalAmt = activeInvoice.amount;
        const discountAmt = 0; // simple mock assume zero
        const taxAmt = totalAmt - subtotal;

        container.querySelector('#invdetails-subtotal').textContent = formatAmount(subtotal);
        container.querySelector('#invdetails-discount').textContent = `-${formatAmount(discountAmt)}`;
        container.querySelector('#invdetails-tax').textContent = formatAmount(taxAmt);
        container.querySelector('#invdetails-total').textContent = formatAmount(totalAmt);

        // Hide Mark Paid button if already paid
        const markPaidBtn = container.querySelector('#invdetails-markpaid-btn');
        if (markPaidBtn) {
          markPaidBtn.style.display = activeInvoice.status === 'Paid' ? 'none' : 'block';
        }
      }
    } 
    else if (id === 8) {
      // Purchase Bills list
      const listContainer = container.querySelector('#bill-list-container');
      if (listContainer) {
        const filtered = db.bills.filter(b => {
          const q = state.billSearchQuery.toLowerCase();
          return b.vendor.toLowerCase().includes(q) || b.number.toLowerCase().includes(q);
        });

        if (filtered.length === 0) {
          listContainer.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-tertiary)">No purchase bills.</div>`;
        } else {
          listContainer.innerHTML = filtered.map(b => `
            <div class="list-item">
              <div class="body">
                <div class="ttl">${b.vendor}</div>
                <div class="sub">Bill #${b.number} · ${b.date}</div>
              </div>
              <div class="right">
                <div class="amt" style="color:var(--rose-500)">${formatAmount(b.amount)}</div>
                <div class="meta" style="font-size:10px">${b.notes || 'Unpaid'}</div>
              </div>
            </div>
          `).join('');
        }
      }
    } 
    else if (id === 10) {
      // Expense List
      // Render Category filter pills
      const filterContainer = container.querySelector('#expense-category-filters');
      if (filterContainer) {
        const categoriesList = ['all', ...db.categories];
        filterContainer.innerHTML = categoriesList.map(cat => `
          <span class="f-pill ${state.activeExpenseFilter === cat ? 'is-active' : ''}" data-category="${cat}">
            ${cat === 'all' ? 'All' : cat}
          </span>
        `).join('');
      }

      // Render Expense list
      const listContainer = container.querySelector('#expense-list-container');
      if (listContainer) {
        const filtered = db.expenses.filter(exp => {
          // Category filter
          if (state.activeExpenseFilter !== 'all' && exp.category !== state.activeExpenseFilter) return false;
          // Search query
          const q = state.expenseSearchQuery.toLowerCase();
          return exp.title.toLowerCase().includes(q) || exp.category.toLowerCase().includes(q);
        });

        if (filtered.length === 0) {
          listContainer.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-tertiary)">No expenses recorded.</div>`;
        } else {
          listContainer.innerHTML = filtered.map(exp => `
            <div class="list-item">
              <div class="body">
                <div class="ttl">${exp.title}</div>
                <div class="sub">${exp.category} · ${exp.date}</div>
              </div>
              <div class="right">
                <div class="amt" style="color:var(--rose-500)">${formatAmount(exp.amount)}</div>
                <div class="meta">${exp.notes || ''}</div>
              </div>
            </div>
          `).join('');
        }
      }
    } 
    else if (id === 11) {
      // Add Expense options select dropdown
      const selectEl = container.querySelector('#addexp-category');
      if (selectEl) {
        selectEl.innerHTML = db.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
      }
      
      // Reset simulated image upload state preview
      const preview = container.querySelector('#expense-upload-preview');
      if (preview) {
        if (state.uploadedImage) {
          preview.style.display = 'block';
          preview.querySelector('img').src = state.uploadedImage;
        } else {
          preview.style.display = 'none';
        }
      }
    } 
    else if (id === 9) {
      // Add Purchase Bill image preview
      const preview = container.querySelector('#bill-upload-preview');
      if (preview) {
        if (state.uploadedImage) {
          preview.style.display = 'block';
          preview.querySelector('img').src = state.uploadedImage;
        } else {
          preview.style.display = 'none';
        }
      }
    }
    else if (id === 12) {
      // Expense Categories List
      const listContainer = container.querySelector('#categories-list-container');
      if (listContainer) {
        listContainer.innerHTML = db.categories.map(cat => `
          <div class="category-item">
            <div style="font-size:14px; font-weight:600;">${cat}</div>
            <div class="actions">
              <button class="edit-category-btn" data-cat="${cat}"><svg width="14" height="14"><use href="#i-edit"/></svg></button>
              <button class="delete-btn delete-category-btn" data-cat="${cat}"><svg width="14" height="14"><use href="#i-trash"/></svg></button>
            </div>
          </div>
        `).join('');
      }
    }
    else if (id === 13) {
      // Settings Page
      container.querySelector('#settings-comp-name').value = db.settings.companyName;
      container.querySelector('#settings-comp-gst').value = db.settings.companyGst;
      container.querySelector('#settings-comp-address').value = db.settings.companyAddress;
      container.querySelector('#settings-profile-name').value = db.settings.userName;
      container.querySelector('#settings-profile-email').value = db.settings.userEmail;
      container.querySelector('#settings-profile-phone').value = db.settings.userPhone;
      container.querySelector('#settings-currency').value = db.settings.currency;
      container.querySelector('#settings-dateformat').value = db.settings.dateFormat;

      // Sync Logo Avatar
      const logoPreview = container.querySelector('#settings-logo-preview');
      if (logoPreview) {
        logoPreview.textContent = db.settings.companyName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      }

      // Sync Theme Toggle
      const themeToggle = container.querySelector('#settings-theme-toggle');
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (themeToggle) {
        themeToggle.classList.toggle('is-on', isDark);
        themeToggle.querySelector('.handle').style.left = isDark ? '24px' : '2px';
      }
    }
    else if (id === 14) {
      // AI Chatbot rendering
      const chatMessages = container.querySelector('#chat-messages-container');
      if (chatMessages) {
        chatMessages.innerHTML = state.chatHistory.map(msg => {
          if (msg.sender === 'user') {
            const attachHTML = msg.attachment ? `
              <div style="display:flex; align-items:center; gap:6px; background:rgba(214,175,75,0.15); border:1px solid var(--border); padding:6px 10px; border-radius:8px; margin-bottom:6px; font-size:11px; color:var(--brand-500); width:fit-content; max-width:100%; word-break:break-all;">
                <svg width="12" height="12" style="stroke:currentColor; stroke-width:2;"><use href="#i-paperclip"/></svg>
                <span>${msg.attachment}</span>
              </div>
            ` : '';
            return `
              <div class="chat-bubble user" style="display: flex; flex-direction: column; align-items: flex-start;">
                ${attachHTML}
                <div>${msg.text.replace(/\n/g, '<br>')}</div>
              </div>
            `;
          } else {
            return `
              <div class="chat-bubble assistant" style="display: flex; gap: 8px;">
                <div class="avatar-bot">AI</div>
                <div style="flex: 1;">${msg.text.replace(/\n/g, '<br>')}</div>
              </div>
            `;
          }
        }).join('');
        
        // Auto scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      // Sync attachment preview block
      const attachPreview = container.querySelector('#chat-attachment-preview');
      const attachName = container.querySelector('#chat-attachment-name');
      if (attachPreview && attachName) {
        if (state.currentAttachment) {
          attachName.textContent = state.currentAttachment;
          attachPreview.style.display = 'flex';
        } else {
          attachPreview.style.display = 'none';
        }
      }
    }
  }

  // ---------- Wire Screen Interactions ----------
  function wireScreenInteractions(id, container) {
    // 1. Back button routing
    container.querySelectorAll('.btn-back').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.history.length > 0) {
          const prev = state.history.pop();
          goTo(prev, { addToHistory: false });
        } else {
          goTo(2); // Fallback to Dashboard
        }
      });
    });

    // 2. Bottom Nav Links wiring
    container.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = parseInt(item.dataset.tab, 10);
        if (targetTab !== state.currentId) {
          goTo(targetTab);
        }
      });
    });

    // (FAB interaction code removed as FAB is deleted)

    // --- Screen Specific Interactions ---
    if (id === 1) {
      // Login submit
      container.querySelector('#login-submit')?.addEventListener('click', () => {
        goTo(2);
      });
      container.querySelector('#login-forgot')?.addEventListener('click', () => {
        flashToast('Reset link sent to registered contact info.');
      });
    } 
    else if (id === 2) {
      // Dashboard Quick Actions
      container.querySelector('#action-create-invoice')?.addEventListener('click', () => {
        state.newInvoice = { customerId: null, items: [{ name: '', qty: 1, rate: 0 }], discount: 0 };
        state.invoiceStep = 1;
        goTo(6);
      });
      container.querySelector('#action-add-customer')?.addEventListener('click', () => goTo(4));
      container.querySelector('#action-add-expense')?.addEventListener('click', () => {
        state.uploadedImage = null;
        goTo(11);
      });
      container.querySelector('#action-add-bill')?.addEventListener('click', () => {
        state.uploadedImage = null;
        goTo(9);
      });

      // KPI cards jump
      container.querySelector('#card-today-sales')?.addEventListener('click', () => {
        state.activeInvoiceFilter = 'Paid';
        goTo(5);
      });
      container.querySelector('#card-pending-invoices')?.addEventListener('click', () => {
        state.activeInvoiceFilter = 'Pending';
        goTo(5);
      });
      container.querySelector('#card-month-expense')?.addEventListener('click', () => {
        state.activeExpenseFilter = 'all';
        goTo(10);
      });
      container.querySelector('#card-total-customers')?.addEventListener('click', () => {
        goTo(3);
      });
    } 
    else if (id === 3) {
      // Customer search
      const searchInput = container.querySelector('#customer-search-input');
      if (searchInput) {
        searchInput.value = state.customerSearchQuery;
        searchInput.addEventListener('input', () => {
          state.customerSearchQuery = searchInput.value;
          renderScreenContent(3, container);
          wireScreenInteractions(3, container); // re-bind list click events
        });
      }

      // Add customer button
      container.querySelector('#custlist-add-btn')?.addEventListener('click', () => goTo(4));

      // Customer item click redirects to Invoices filtered by this client
      container.querySelectorAll('#customer-list-container .list-item').forEach(card => {
        card.addEventListener('click', () => {
          const custId = parseInt(card.dataset.customerId, 10);
          const cust = db.customers.find(c => c.id === custId);
          if (cust) {
            state.invoiceSearchQuery = cust.name;
            state.activeInvoiceFilter = 'all';
            goTo(5);
          }
        });
      });
    } 
    else if (id === 4) {
      // Add Customer save
      container.querySelector('#addcust-save-btn')?.addEventListener('click', () => {
        const name = container.querySelector('#addcust-name').value.trim();
        const phone = container.querySelector('#addcust-phone').value.trim();
        const email = container.querySelector('#addcust-email').value.trim();
        const gst = container.querySelector('#addcust-gst').value.trim();
        const address = container.querySelector('#addcust-address').value.trim();
        const notes = container.querySelector('#addcust-notes').value.trim();

        if (!name || !phone) {
          flashToast('Please enter Name and Mobile Number.');
          return;
        }

        const newCust = {
          id: db.customers.length + 1,
          name, phone, email, gst, address, notes,
          outstanding: 0
        };

        db.customers.push(newCust);
        db.activity.unshift({
          id: db.activity.length + 1,
          text: `Added new customer ${name}`,
          details: `Phone: ${phone}`,
          date: 'Just now',
          type: 'customer'
        });
        saveDB();

        flashToast('Customer saved successfully!');
        state.customerSearchQuery = '';
        goTo(3);
      });
    } 
    else if (id === 5) {
      // Invoice search
      const searchInput = container.querySelector('#invoice-search-input');
      if (searchInput) {
        searchInput.value = state.invoiceSearchQuery;
        searchInput.addEventListener('input', () => {
          state.invoiceSearchQuery = searchInput.value;
          renderScreenContent(5, container);
          wireScreenInteractions(5, container); // rebind item events
        });
      }

      // Filter status pills
      container.querySelectorAll('.filter-row .f-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          container.querySelectorAll('.filter-row .f-pill').forEach(p => p.classList.remove('is-active'));
          pill.classList.add('is-active');
          state.activeInvoiceFilter = pill.dataset.status;
          renderScreenContent(5, container);
          wireScreenInteractions(5, container);
        });
      });

      // Quick Create Button
      container.querySelector('#invlist-create-btn')?.addEventListener('click', () => {
        state.newInvoice = { customerId: null, items: [{ name: '', qty: 1, rate: 0 }], discount: 0 };
        state.invoiceStep = 1;
        goTo(6);
      });

      // Invoice item click
      container.querySelectorAll('#invoice-list-container .list-item').forEach(card => {
        card.addEventListener('click', () => {
          state.activeInvoiceId = parseInt(card.dataset.invoiceId, 10);
          goTo(7);
        });
      });
    } 
    else if (id === 6) {
      // Create Invoice Step Panels controls
      const step1Panel = container.querySelector('#invoice-step-1-panel');
      const step2Panel = container.querySelector('#invoice-step-2-panel');
      const step3Panel = container.querySelector('#invoice-step-3-panel');

      const renderStepIndicators = () => {
        container.querySelectorAll('.step-indicator .step-dot').forEach((dot, idx) => {
          const step = idx + 1;
          dot.classList.toggle('is-active', step === state.invoiceStep);
          dot.classList.toggle('is-done', step < state.invoiceStep);
        });
      };

      const showStep = (stepNum) => {
        state.invoiceStep = stepNum;
        renderStepIndicators();
        if (stepNum === 1) {
          step1Panel.style.display = 'block';
          step2Panel.style.display = 'none';
          step3Panel.style.display = 'none';
        } else if (stepNum === 2) {
          step1Panel.style.display = 'none';
          step2Panel.style.display = 'block';
          step3Panel.style.display = 'none';
        } else if (stepNum === 3) {
          step1Panel.style.display = 'none';
          step2Panel.style.display = 'none';
          step3Panel.style.display = 'block';
        }
        renderScreenContent(6, container);
        bindStepEvents();
      };

      const bindStepEvents = () => {
        // Step 1: Customer search
        const custSearch = container.querySelector('#inv-cust-search');
        if (custSearch) {
          custSearch.addEventListener('input', () => {
            renderScreenContent(6, container);
            bindStepEvents(); // re-bind choices click
          });
        }

        // Step 1: Customer Select Click
        container.querySelectorAll('#inv-cust-list [data-select-cust]').forEach(card => {
          card.addEventListener('click', () => {
            state.newInvoice.customerId = parseInt(card.dataset.selectCust, 10);
            showStep(2);
          });
        });

        // Step 2: Line items listeners
        container.querySelectorAll('.item-row').forEach(row => {
          const idx = parseInt(row.dataset.index, 10);
          
          row.querySelector('.item-name-inp').addEventListener('change', (e) => {
            state.newInvoice.items[idx].name = e.target.value;
          });
          row.querySelector('.item-qty-inp').addEventListener('change', (e) => {
            state.newInvoice.items[idx].qty = parseInt(e.target.value || 1, 10);
          });
          row.querySelector('.item-rate-inp').addEventListener('change', (e) => {
            state.newInvoice.items[idx].rate = parseFloat(e.target.value || 0);
          });

          row.querySelector('.remove-item-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (state.newInvoice.items.length > 1) {
              state.newInvoice.items.splice(idx, 1);
              showStep(2);
            } else {
              flashToast('Invoice must have at least 1 item.');
            }
          });
        });

        // Add item row button
        const addRowBtn = container.querySelector('#inv-add-line-btn');
        if (addRowBtn && addRowBtn.dataset.wired !== '1') {
          addRowBtn.dataset.wired = '1';
          addRowBtn.addEventListener('click', () => {
            state.newInvoice.items.push({ name: '', qty: 1, rate: 0 });
            showStep(2);
          });
        }

        // Step 2 buttons
        container.querySelector('#inv-step2-prev')?.addEventListener('click', () => showStep(1));
        container.querySelector('#inv-step2-next')?.addEventListener('click', () => {
          // validate items
          const valid = state.newInvoice.items.every(it => it.name.trim() !== '' && it.rate > 0);
          if (!valid) {
            flashToast('Please enter description and rate for all items.');
            return;
          }
          showStep(3);
        });

        // Step 3: Discount calculation
        const discInput = container.querySelector('#inv-discount-pct');
        if (discInput && discInput.dataset.wired !== '1') {
          discInput.dataset.wired = '1';
          discInput.addEventListener('input', () => {
            renderScreenContent(6, container);
          });
        }

        container.querySelector('#inv-step3-prev')?.addEventListener('click', () => showStep(2));
        
        // Generate PDF
        container.querySelector('#inv-pdf-btn')?.addEventListener('click', () => {
          flashToast('Invoice PDF generated and downloaded.');
        });

        // Save Invoice Submit
        const saveBtn = container.querySelector('#inv-save-btn');
        if (saveBtn && saveBtn.dataset.wired !== '1') {
          saveBtn.dataset.wired = '1';
          saveBtn.addEventListener('click', () => {
            const customer = db.customers.find(c => c.id === state.newInvoice.customerId);
            if (!customer) return;

            // Compute final amount
            let subtotal = state.newInvoice.items.reduce((sum, curr) => sum + (curr.qty * curr.rate), 0);
            const discPct = parseFloat(container.querySelector('#inv-discount-pct').value || 0);
            const discountAmount = subtotal * (discPct / 100);
            const taxAmount = (subtotal - discountAmount) * 0.18;
            const grandTotal = (subtotal - discountAmount) + taxAmount;

            const nextInvNum = db.invoices.length > 0 ? Math.max(...db.invoices.map(i => i.id)) + 1 : 101;
            const newInv = {
              id: nextInvNum,
              customerId: customer.id,
              customerName: customer.name,
              date: new Date().toISOString().split('T')[0],
              amount: grandTotal,
              status: 'Pending',
              items: [...state.newInvoice.items]
            };

            db.invoices.push(newInv);
            customer.outstanding += grandTotal;
            
            db.activity.unshift({
              id: db.activity.length + 1,
              text: `Invoice INV-${nextInvNum} created for ${customer.name}`,
              details: `Amount: ${formatAmount(grandTotal)}`,
              date: 'Just now',
              type: 'invoice'
            });
            saveDB();

            state.activeInvoiceId = nextInvNum;
            state.invoiceSearchQuery = '';
            flashToast('Invoice created successfully!');
            goTo(7);
          });
        }
      };

      // Set initial wizard steps visibility
      showStep(state.invoiceStep);
    } 
    else if (id === 7) {
      // Invoice Details Actions
      const activeInvoice = db.invoices.find(i => i.id === state.activeInvoiceId);
      if (activeInvoice) {
        // Mark Paid button click
        container.querySelector('#invdetails-markpaid-btn')?.addEventListener('click', () => {
          activeInvoice.status = 'Paid';
          // Deduct from customer's outstanding balance
          const customer = db.customers.find(c => c.id === activeInvoice.customerId);
          if (customer) {
            customer.outstanding = Math.max(0, customer.outstanding - activeInvoice.amount);
          }

          db.activity.unshift({
            id: db.activity.length + 1,
            text: `Payment received for Invoice INV-${activeInvoice.id}`,
            details: `Amount: ${formatAmount(activeInvoice.amount)} from ${activeInvoice.customerName}`,
            date: 'Just now',
            type: 'invoice'
          });
          saveDB();

          flashToast('Invoice marked as Paid!');
          renderScreenContent(7, container);
          wireScreenInteractions(7, container); // refresh buttons
        });

        // Other actions
        container.querySelector('#invdetails-pdf-btn')?.addEventListener('click', () => {
          flashToast('Downloading PDF of Invoice...');
        });
        container.querySelector('#invdetails-whatsapp-btn')?.addEventListener('click', () => {
          flashToast(`Link shared to ${activeInvoice.customerName} via WhatsApp.`);
        });
        container.querySelector('#invdetails-email-btn')?.addEventListener('click', () => {
          flashToast(`Invoice sent to registered email address.`);
        });
      }
    } 
    else if (id === 8) {
      // Purchase Bill search
      const searchInput = container.querySelector('#bill-search-input');
      if (searchInput) {
        searchInput.value = state.billSearchQuery;
        searchInput.addEventListener('input', () => {
          state.billSearchQuery = searchInput.value;
          renderScreenContent(8, container);
        });
      }

      // Add Bill button redirects
      container.querySelector('#billlist-add-btn')?.addEventListener('click', () => {
        state.uploadedImage = null;
        goTo(9);
      });
    } 
    else if (id === 9) {
      // Add Purchase Bill simulated upload triggers
      const setMockPreview = () => {
        // Mock receipt image Base64 format
        state.uploadedImage = 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60'; // generic receipt style
        renderScreenContent(9, container);
        flashToast('Bill copy uploaded successfully!');
      };

      container.querySelector('#bill-camera-trigger')?.addEventListener('click', setMockPreview);
      container.querySelector('#bill-gallery-trigger')?.addEventListener('click', setMockPreview);

      // Save Purchase Bill Submit
      container.querySelector('#addbill-save-btn')?.addEventListener('click', () => {
        const vendor = container.querySelector('#addbill-vendor').value.trim();
        const number = container.querySelector('#addbill-number').value.trim();
        const date = container.querySelector('#addbill-date').value;
        const amount = parseFloat(container.querySelector('#addbill-amount').value || 0);
        const notes = container.querySelector('#addbill-notes').value.trim();

        if (!vendor || !number || !date || !amount) {
          flashToast('Please enter all required fields.');
          return;
        }

        const newBill = {
          id: db.bills.length + 1,
          vendor, number, date, amount, notes
        };

        db.bills.unshift(newBill);
        db.activity.unshift({
          id: db.activity.length + 1,
          text: `Purchase bill ${number} uploaded from ${vendor}`,
          details: `Amount: ${formatAmount(amount)}`,
          date: 'Just now',
          type: 'bill'
        });
        saveDB();

        flashToast('Purchase bill saved successfully!');
        state.billSearchQuery = '';
        goTo(8);
      });
    } 
    else if (id === 10) {
      // Expense Search
      const searchInput = container.querySelector('#expense-search-input');
      if (searchInput) {
        searchInput.value = state.expenseSearchQuery;
        searchInput.addEventListener('input', () => {
          state.expenseSearchQuery = searchInput.value;
          renderScreenContent(10, container);
          wireScreenInteractions(10, container);
        });
      }

      // Categories list edit redirection
      container.querySelector('#explist-cat-btn')?.addEventListener('click', () => goTo(12));

      // Category filter pills clicks
      container.querySelectorAll('#expense-category-filters .f-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          state.activeExpenseFilter = pill.dataset.category;
          renderScreenContent(10, container);
          wireScreenInteractions(10, container);
        });
      });

      // Quick Add Button
      container.querySelector('#explist-add-btn')?.addEventListener('click', () => {
        state.uploadedImage = null;
        goTo(11);
      });
    } 
    else if (id === 11) {
      // Add Expense simulated receipt image upload triggers
      const setMockPreview = () => {
        state.uploadedImage = 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=500&auto=format&fit=crop&q=60'; // generic cashier bill
        renderScreenContent(11, container);
        flashToast('Receipt photo uploaded!');
      };

      container.querySelector('#expense-camera-trigger')?.addEventListener('click', setMockPreview);
      container.querySelector('#expense-gallery-trigger')?.addEventListener('click', setMockPreview);

      // Save Expense Submit
      container.querySelector('#addexp-save-btn')?.addEventListener('click', () => {
        const title = container.querySelector('#addexp-title').value.trim();
        const amount = parseFloat(container.querySelector('#addexp-amount').value || 0);
        const category = container.querySelector('#addexp-category').value;
        const date = container.querySelector('#addexp-date').value;
        const notes = container.querySelector('#addexp-notes').value.trim();

        if (!title || !amount || !category || !date) {
          flashToast('Please enter all required fields.');
          return;
        }

        const newExp = {
          id: db.expenses.length + 1,
          title, amount, category, date, notes
        };

        db.expenses.unshift(newExp);
        db.activity.unshift({
          id: db.activity.length + 1,
          text: `Expense added: ${title}`,
          details: `Amount: ${formatAmount(amount)} · Cat: ${category}`,
          date: 'Just now',
          type: 'expense'
        });
        saveDB();

        flashToast('Expense saved successfully!');
        state.expenseSearchQuery = '';
        goTo(10);
      });
    } 
    else if (id === 12) {
      // Expense Categories Edit / Add / Delete
      
      // Save Custom Category
      container.querySelector('#addcat-save-btn')?.addEventListener('click', () => {
        const nameInput = container.querySelector('#addcat-name');
        const name = nameInput.value.trim();
        if (!name) {
          flashToast('Please enter a category name.');
          return;
        }

        if (db.categories.map(c => c.toLowerCase()).includes(name.toLowerCase())) {
          flashToast('Category already exists.');
          return;
        }

        db.categories.push(name);
        saveDB();
        
        nameInput.value = '';
        flashToast('Category created!');
        renderScreenContent(12, container);
        wireScreenInteractions(12, container);
      });

      // Delete category click
      container.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const cat = btn.dataset.cat;
          // Warn if default categories are deleted
          const defaults = ['Fuel', 'Travel', 'Salary', 'Office', 'Maintenance', 'Others'];
          if (defaults.includes(cat)) {
            if (!confirm(`"${cat}" is a default category. Are you sure you want to delete it?`)) return;
          }

          db.categories = db.categories.filter(c => c !== cat);
          saveDB();

          flashToast(`Category "${cat}" deleted.`);
          renderScreenContent(12, container);
          wireScreenInteractions(12, container);
        });
      });

      // Edit category click (Prompt mock)
      container.querySelectorAll('.edit-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const oldCat = btn.dataset.cat;
          const newCat = prompt(`Edit category name:`, oldCat);
          if (newCat && newCat.trim() !== '' && newCat !== oldCat) {
            db.categories = db.categories.map(c => c === oldCat ? newCat.trim() : c);
            // update categories in expenses as well
            db.expenses.forEach(e => {
              if (e.category === oldCat) e.category = newCat.trim();
            });
            saveDB();
            flashToast(`Category updated.`);
            renderScreenContent(12, container);
            wireScreenInteractions(12, container);
          }
        });
      });
    } 
    else if (id === 13) {
      // Settings Page save listeners (trigger on change of fields to mimic auto-saving)
      const saveSettings = () => {
        db.settings.companyName = container.querySelector('#settings-comp-name').value.trim();
        db.settings.companyGst = container.querySelector('#settings-comp-gst').value.trim();
        db.settings.companyAddress = container.querySelector('#settings-comp-address').value.trim();
        db.settings.userName = container.querySelector('#settings-profile-name').value.trim();
        db.settings.userEmail = container.querySelector('#settings-profile-email').value.trim();
        db.settings.userPhone = container.querySelector('#settings-profile-phone').value.trim();
        db.settings.currency = container.querySelector('#settings-currency').value;
        db.settings.dateFormat = container.querySelector('#settings-dateformat').value;
        saveDB();
      };

      container.querySelectorAll('.input').forEach(inp => {
        inp.addEventListener('blur', saveSettings);
        inp.addEventListener('change', saveSettings);
      });

      // Theme toggle trigger
      const themeToggle = container.querySelector('#settings-theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          const currentTheme = root.getAttribute('data-theme') || 'dark';
          const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
          localStorage.setItem(STORAGE_KEY, nextTheme);
          applyTheme(nextTheme);

          // Update toggle visualization
          const isDark = nextTheme === 'dark';
          themeToggle.classList.toggle('is-on', isDark);
          themeToggle.querySelector('.handle').style.left = isDark ? '24px' : '2px';
          
          flashToast(`Theme set to ${nextTheme}`);
        });
      }

      // Logo upload simulation
      container.querySelector('#settings-logo-upload-btn')?.addEventListener('click', () => {
        const file = prompt('Enter image URL or initials for logo:', 'FE');
        if (file) {
          db.settings.companyName = file + ' Corp';
          container.querySelector('#settings-comp-name').value = db.settings.companyName;
          saveSettings();
          renderScreenContent(13, container);
          flashToast('Logo updated successfully!');
        }
      });

      // Logout triggers
      container.querySelector('#settings-logout-btn')?.addEventListener('click', () => {
        state.history = [];
        goTo(1);
      });
    }
    else if (id === 14) {
      // AI Chatbot interaction
      const input = container.querySelector('#chat-text-input');
      const sendBtn = container.querySelector('#chat-send-btn');
      const clearBtn = container.querySelector('#chat-clear-btn');

      const handleSend = (text) => {
        if (!text || text.trim() === '') return;
        const currentAttachment = state.currentAttachment;
        
        state.chatHistory.push({ 
          sender: 'user', 
          text: text, 
          attachment: currentAttachment 
        });
        
        // Reset state
        state.currentAttachment = null;
        
        renderScreenContent(14, container);

        // Simulated AI response
        const query = text.toLowerCase();
        
        // Add fake thinking bubble
        setTimeout(() => {
          let responseText = '';
          
          if (query.includes('sales') || query.includes('today')) {
            const today = new Date().toISOString().split('T')[0];
            const todayInvs = db.invoices.filter(i => i.date === today);
            const totalSales = todayInvs.reduce((sum, curr) => sum + curr.amount, 0);
            responseText = `Today's Sales Summary:\n• Invoices created today: **${todayInvs.length}**\n• Total today sales: **${formatAmount(totalSales)}**`;
          } else if (query.includes('pending') || query.includes('invoice')) {
            const pendingInvoices = db.invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue');
            if (pendingInvoices.length === 0) {
              responseText = "You have no pending invoices at the moment! All set.";
            } else {
              responseText = `You have **${pendingInvoices.length}** pending or overdue invoices:\n` + 
                pendingInvoices.map(i => `• **INV-${i.id}**: ${i.customerName} (${formatAmount(i.amount)}) - *${i.status}*`).join('\n');
            }
          } else if (query.includes('outstanding') || query.includes('customer')) {
            const outstandingCustomers = db.customers.filter(c => c.outstanding > 0);
            if (outstandingCustomers.length === 0) {
              responseText = "Outstanding client balances are fully cleared!";
            } else {
              responseText = `Here are outstanding customer balances:\n` + 
                outstandingCustomers.map(c => `• **${c.name}**: ${formatAmount(c.outstanding)} (Mobile: ${c.phone})`).join('\n');
            }
          } else if (query.includes('expense') || query.includes('cost') || query.includes('month')) {
            const monthExpense = db.expenses.reduce((sum, curr) => sum + curr.amount, 0);
            responseText = `Total expenses recorded this month: **${formatAmount(monthExpense)}** across ${db.expenses.length} transactions.`;
          } else if (query.includes('create invoice') || query.includes('new invoice')) {
            responseText = "Redirecting you to the Invoice Creation wizard...";
            setTimeout(() => {
              state.newInvoice = { customerId: null, items: [{ name: '', qty: 1, rate: 0 }], discount: 0 };
              state.invoiceStep = 1;
              goTo(6);
            }, 1000);
          } else if (query.includes('sharma') || query.includes('patel')) {
            const match = db.customers.filter(c => c.name.toLowerCase().includes('sharma') || c.name.toLowerCase().includes('patel'));
            if (match.length > 0) {
              responseText = `Found customer match:\n• **${match[0].name}**\n• Phone: ${match[0].phone}\n• Outstanding balance: ${formatAmount(match[0].outstanding)}\n• Address: ${match[0].address || 'Not specified'}`;
            } else {
              responseText = "No customers found matching that query.";
            }
          } else {
            responseText = "I'm your Folio GPT ERP assistant. Try asking me:\n\n• **Sales summary**\n• **Pending invoices**\n• **Outstanding customer balances**\n• **Total expenses**";
          }

          if (currentAttachment) {
            responseText = `[Simulated OCR Analysis of **${currentAttachment}**]\n\nI have successfully scanned and verified the attached document. Based on its content: ${responseText}`;
          }

          state.chatHistory.push({ sender: 'assistant', text: responseText });
          renderScreenContent(14, container);
          wireScreenInteractions(14, container); // re-wire events
        }, 800);
      };

      if (sendBtn && input) {
        sendBtn.onclick = () => {
          const val = input.value;
          input.value = '';
          handleSend(val);
        };

        input.onkeydown = (e) => {
          if (e.key === 'Enter') {
            const val = input.value;
            input.value = '';
            handleSend(val);
          }
        };
      }

      // Attachment drawer triggers
      const attachBtn = container.querySelector('#chat-attach-btn');
      const attachOverlay = container.querySelector('#attach-drawer-overlay');
      const attachSheet = container.querySelector('#attach-drawer-sheet');
      const attachClose = container.querySelector('#attach-drawer-close');
      const attachRemove = container.querySelector('#chat-attachment-remove');

      if (attachBtn && attachOverlay && attachSheet) {
        attachBtn.onclick = () => {
          attachOverlay.style.display = 'block';
          attachSheet.style.display = 'block';
          void attachSheet.offsetHeight; // force layout reflow
          attachOverlay.classList.add('is-open');
          attachSheet.classList.add('is-open');
        };

        const closeAttachDrawer = () => {
          attachOverlay.classList.remove('is-open');
          attachSheet.classList.remove('is-open');
          setTimeout(() => {
            attachOverlay.style.display = 'none';
            attachSheet.style.display = 'none';
          }, 250);
        };

        attachOverlay.onclick = closeAttachDrawer;
        if (attachClose) attachClose.onclick = closeAttachDrawer;

        // Attachment options selection
        container.querySelectorAll('.attach-option-btn').forEach(btn => {
          btn.onclick = () => {
            const fileName = btn.dataset.name || 'document.pdf';
            state.currentAttachment = fileName;
            
            // Sync preview block directly
            const preview = container.querySelector('#chat-attachment-preview');
            const nameSpan = container.querySelector('#chat-attachment-name');
            if (preview && nameSpan) {
              nameSpan.textContent = fileName;
              preview.style.display = 'flex';
            }
            
            closeAttachDrawer();
            flashToast(`Attached: ${fileName}`);
          };
        });
      }

      if (attachRemove) {
        attachRemove.onclick = () => {
          state.currentAttachment = null;
          const preview = container.querySelector('#chat-attachment-preview');
          if (preview) preview.style.display = 'none';
          flashToast('Attachment removed');
        };
      }

      // Voice dictation triggers
      const voiceBtn = container.querySelector('#chat-voice-btn');
      const voiceOverlay = container.querySelector('#voice-overlay');
      const voiceCloseBtn = container.querySelector('#voice-close-btn');
      const voiceStatus = container.querySelector('#voice-status');

      if (voiceBtn && voiceOverlay) {
        voiceBtn.onclick = () => {
          voiceOverlay.style.display = 'flex';
          void voiceOverlay.offsetHeight;
          voiceOverlay.classList.add('is-open');
          if (voiceStatus) voiceStatus.textContent = 'Listening...';

          // Simulate steps of speech recognition
          state.voiceTimer1 = setTimeout(() => {
            if (voiceStatus) voiceStatus.textContent = 'Processing speech...';
          }, 1500);

          state.voiceTimer2 = setTimeout(() => {
            const spokenQueries = [
              "Summarize today sales",
              "Show pending invoices",
              "Show outstanding customer balances",
              "Show month expense"
            ];
            const chosen = spokenQueries[Math.floor(Math.random() * spokenQueries.length)];
            
            voiceOverlay.classList.remove('is-open');
            setTimeout(() => {
              voiceOverlay.style.display = 'none';
            }, 250);
            
            if (input) {
              input.value = chosen;
              handleSend(chosen);
              input.value = '';
            }
          }, 3200);
        };

        if (voiceCloseBtn) {
          voiceCloseBtn.onclick = () => {
            clearTimeout(state.voiceTimer1);
            clearTimeout(state.voiceTimer2);
            voiceOverlay.classList.remove('is-open');
            setTimeout(() => {
              voiceOverlay.style.display = 'none';
            }, 250);
            flashToast('Voice input cancelled');
          };
        }
      }

      // Clear chat
      if (clearBtn) {
        clearBtn.onclick = () => {
          state.chatHistory = [
            { sender: 'assistant', text: "Chat history cleared. How can I help you manage your business today?" }
          ];
          state.currentAttachment = null;
          renderScreenContent(14, container);
          wireScreenInteractions(14, container);
        };
      }

      // Prompt chips
      container.querySelectorAll('#chat-prompt-chips .prompt-chip').forEach(chip => {
        chip.onclick = () => {
          const text = chip.dataset.prompt;
          handleSend(text);
        };
      });
    }
  }

  // ---------- Floating Screens Drawer (Slide-in) ----------
  const SECTIONS = [
    { name: 'Onboarding & Auth', screens: [1] },
    { name: 'Dashboard & Customers', screens: [2, 3, 4] },
    { name: 'Invoices & Liabilities', screens: [5, 6, 7, 8, 9] },
    { name: 'Expenses & Categories', screens: [10, 11, 12] },
    { name: 'AI Chat Assistant', screens: [14] },
    { name: 'Settings & Workspace', screens: [13] }
  ];

  function buildDrawerList() {
    const list = document.getElementById('screensList');
    if (!list) return;
    list.innerHTML = '';
    SECTIONS.forEach((section, si) => {
      const group = document.createElement('div');
      group.className = 'group';
      group.innerHTML = `<div class="gh">${String(si + 1).padStart(2, '0')} · ${section.name}</div>`;
      section.screens.forEach(sId => {
        const s = state.screens.find(x => x.id === sId);
        if (!s) return;
        const item = document.createElement('div');
        item.className = 'item';
        item.dataset.screenId = sId;
        item.innerHTML = `<span class="num">${String(sId).padStart(2, '0')}</span><span class="lbl">${s.name}</span>`;
        item.addEventListener('click', () => {
          goTo(sId);
          closeDrawer();
        });
        group.appendChild(item);
      });
      list.appendChild(group);
    });
  }

  function openDrawer() {
    buildDrawerList();
    document.getElementById('screensDrawerOverlay')?.classList.add('is-open');
    document.getElementById('screensDrawer')?.classList.add('is-open');
  }

  function closeDrawer() {
    document.getElementById('screensDrawerOverlay')?.classList.remove('is-open');
    document.getElementById('screensDrawer')?.classList.remove('is-open');
  }

  function wireFloatingControls() {
    // Sync theme icons
    const isDark = root.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'dark' : 'light');

    document.getElementById('themeBtn')?.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, nextTheme);
      applyTheme(nextTheme);
    });

    document.getElementById('themeToggle')?.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, nextTheme);
      applyTheme(nextTheme);
    });

    document.getElementById('screensBtn')?.addEventListener('click', openDrawer);
    document.getElementById('drawerClose')?.addEventListener('click', closeDrawer);
    document.getElementById('screensDrawerOverlay')?.addEventListener('click', closeDrawer);
  }

  // ---------- Keyboard Shortcuts ----------
  function setupKeyboard() {
    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      if (e.key === 'Escape') {
        if (document.getElementById('screensDrawer')?.classList.contains('is-open')) {
          closeDrawer();
          return;
        }
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
