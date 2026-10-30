const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Mobile CSS to inject before </style>
const mobileCss = `
    /* ===================================================
       MOBILE & RESPONSIVE NAVIGATION STYLES
       =================================================== */
    .mobile-menu-toggle {
      display: none;
      background: transparent;
      border: 1px solid var(--suzy-border);
      width: 44px;
      height: 44px;
      border-radius: 8px;
      cursor: pointer;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 5px;
      padding: 9px;
      color: var(--suzy-purple);
      transition: all 0.15s ease;
      flex-shrink: 0;
    }

    .mobile-menu-toggle:hover, .mobile-menu-toggle:focus {
      background: #fdf2f8;
      border-color: var(--suzy-magenta);
    }

    .hamburger-bar {
      display: block;
      width: 22px;
      height: 2.5px;
      background: var(--suzy-purple);
      border-radius: 2px;
      transition: all 0.25s ease;
    }

    .mobile-search-toggle {
      display: none;
      background: #faf8f5;
      border: 1px solid var(--suzy-border);
      width: 42px;
      height: 42px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      align-items: center;
      justify-content: center;
      color: var(--suzy-text);
      transition: all 0.15s ease;
      flex-shrink: 0;
    }

    .mobile-search-toggle:hover, .mobile-search-toggle:focus {
      background: #fdf2f8;
      border-color: var(--suzy-magenta);
    }

    /* Expandable Mobile Search Bar */
    .mobile-search-bar {
      display: none;
      padding: 10px 16px 14px 16px;
      background: #ffffff;
      border-top: 1px solid var(--suzy-border);
      border-bottom: 2px solid #fdf2f8;
      animation: slideDownSearch 0.2s ease-out;
    }

    .mobile-search-bar.active {
      display: block;
    }

    @keyframes slideDownSearch {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .mobile-search-inner {
      position: relative;
      display: flex;
      align-items: center;
    }

    .mobile-search-input {
      width: 100%;
      height: 46px;
      padding: 0 44px 0 40px;
      border-radius: 24px;
      border: 1.5px solid var(--suzy-border);
      font-size: 16px;
      background: #faf8f5;
      color: var(--suzy-text);
      font-family: var(--font-body);
    }

    .mobile-search-input:focus {
      outline: none;
      border-color: var(--suzy-magenta);
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(194, 24, 91, 0.15);
    }

    .mobile-search-close {
      position: absolute;
      right: 10px;
      background: transparent;
      border: none;
      font-size: 18px;
      color: var(--suzy-text-muted);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Mobile Navigation Drawer */
    .mobile-drawer-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      z-index: 3000;
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    .mobile-drawer-overlay.active {
      display: block;
      opacity: 1;
    }

    .mobile-nav-drawer {
      position: fixed;
      top: 0;
      left: -350px;
      width: 320px;
      max-width: 86vw;
      height: 100%;
      height: 100dvh;
      background: #ffffff;
      z-index: 3001;
      box-shadow: 8px 0 30px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      overflow-y: auto;
    }

    .mobile-nav-drawer.active {
      left: 0;
    }

    .mobile-drawer-header {
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--suzy-border);
      background: #FAF8F5;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .mobile-drawer-logo {
      height: 38px;
      width: auto;
    }

    .mobile-drawer-close {
      background: #ffffff;
      border: 1px solid var(--suzy-border);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--suzy-text);
      transition: background 0.15s ease;
    }

    .mobile-drawer-close:hover {
      background: #fdf2f8;
      color: var(--suzy-magenta);
    }

    .mobile-drawer-body {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .mobile-nav-hero-link {
      background: linear-gradient(135deg, #fdf2f8 0%, #fff 100%);
      border: 1.5px solid #f472b6;
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 17px;
      color: var(--suzy-purple);
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(194, 24, 91, 0.08);
      min-height: 48px;
    }

    .mobile-arrow {
      font-size: 20px;
      color: var(--suzy-magenta);
    }

    .mobile-accordion-item {
      border: 1px solid var(--suzy-border);
      border-radius: 12px;
      overflow: hidden;
      background: #ffffff;
    }

    .mobile-accordion-header {
      width: 100%;
      background: #faf8f5;
      border: none;
      padding: 14px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 16px;
      color: var(--suzy-text);
      cursor: pointer;
      text-align: left;
      min-height: 48px;
    }

    .acc-chevron {
      font-size: 14px;
      color: var(--suzy-text-muted);
      transition: transform 0.2s ease;
    }

    .mobile-accordion-item.open .acc-chevron {
      transform: rotate(180deg);
      color: var(--suzy-magenta);
    }

    .mobile-accordion-content {
      display: none;
      padding: 6px 10px 10px 10px;
      background: #ffffff;
    }

    .mobile-accordion-item.open .mobile-accordion-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .mobile-accordion-content a {
      padding: 11px 12px;
      font-size: 15px;
      font-weight: 600;
      color: var(--suzy-text);
      text-decoration: none;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.15s ease;
      min-height: 44px;
    }

    .mobile-accordion-content a:hover, .mobile-accordion-content a:active {
      background: #fdf2f8;
      color: var(--suzy-magenta);
      font-weight: 700;
      padding-left: 16px;
    }

    .mobile-drawer-footer {
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px dashed var(--suzy-border);
    }

    .mobile-drawer-contact {
      background: #faf8f5;
      padding: 14px;
      border-radius: 10px;
      font-size: 14px;
      text-align: center;
      color: var(--suzy-text-muted);
    }

    /* Mobile Floating Bottom Bar */
    .mobile-bottom-bar {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: #ffffff;
      border-top: 1px solid var(--suzy-border);
      box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
      z-index: 1000;
      justify-content: space-around;
      align-items: center;
      padding: 0 4px;
    }

    .bottom-bar-btn {
      background: transparent;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 700;
      color: var(--suzy-text);
      cursor: pointer;
      flex: 1;
      height: 100%;
      padding: 6px 0;
    }

    .bottom-bar-btn:active, .bottom-bar-btn.active {
      color: var(--suzy-magenta);
    }

    .bottom-icon {
      font-size: 19px;
      line-height: 1;
    }

    .cart-btn-icon-only {
      display: none;
    }

    /* ===================================================
       COMPREHENSIVE RESPONSIVE DESIGN BREAKPOINTS
       =================================================== */

    /* Tablet & Smaller Laptops (max-width: 992px) */
    @media (max-width: 992px) {
      .desktop-nav {
        display: none !important;
      }

      .mobile-menu-toggle {
        display: flex !important;
      }

      .mobile-search-toggle {
        display: flex !important;
      }

      .nav-search-box {
        display: none !important;
      }

      .nav-container {
        padding: 10px 18px;
        gap: 12px;
      }

      .brand-logo-img {
        height: 44px;
      }

      .site-header {
        top: 0;
      }
    }

    /* Tablets & Phones (max-width: 768px) */
    @media (max-width: 768px) {
      body {
        padding-bottom: 72px; /* space for mobile-bottom-bar */
      }

      .mobile-bottom-bar {
        display: flex !important;
      }

      .announcement-bar {
        padding: 9px 12px;
        font-size: 14px;
        position: relative; /* avoids fixed overlay collision */
      }

      .site-header {
        top: 0;
        position: sticky;
      }

      .shop-hero {
        padding: 28px 16px;
      }

      .shop-hero h1 {
        font-size: 28px;
        line-height: 1.25;
      }

      .shop-hero p {
        font-size: 17px;
        margin-bottom: 14px;
      }

      .hero-badges {
        gap: 8px;
      }

      .hero-badge {
        padding: 7px 14px;
        font-size: 13px;
        min-height: 40px;
        display: inline-flex;
        align-items: center;
      }

      .content-container {
        padding: 0 16px;
        margin: 20px auto;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        margin-bottom: 16px;
      }

      .section-title {
        font-size: 24px;
      }

      .category-filter {
        gap: 8px;
        margin-bottom: 18px;
        padding-bottom: 10px;
        -webkit-overflow-scrolling: touch;
      }

      .filter-chip {
        padding: 8px 14px;
        font-size: 14px;
        min-height: 44px;
      }

      .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 18px;
      }

      .card-img-wrapper {
        height: 220px;
      }

      .card-body {
        padding: 16px;
      }

      .card-title {
        font-size: 18px;
      }

      .card-price {
        font-size: 20px;
      }

      .express-checkout-box {
        padding: 8px;
        margin-top: 10px;
      }

      .express-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }

      .express-btn {
        min-height: 42px;
        font-size: 13px;
      }

      .btn-paypal {
        grid-column: span 2;
      }

      .about-hero {
        padding: 36px 16px 28px 16px;
      }

      .about-hero h1 {
        font-size: 30px;
      }

      .about-hero p {
        font-size: 17px;
      }

      .about-content-wrap {
        padding: 0 16px;
        margin: 28px auto 40px auto;
      }

      .philosophy-card {
        flex-direction: column;
        text-align: center;
        padding: 24px 18px;
        gap: 20px;
      }

      .philosophy-img {
        width: 160px;
        height: 160px;
        margin: 0 auto;
      }

      .philosophy-text h2 {
        font-size: 24px;
      }

      .philosophy-text p {
        font-size: 16px;
      }

      .team-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .team-card {
        padding: 20px;
      }

      .studio-strip-section {
        margin-bottom: 32px;
      }

      .studio-strip-img {
        height: 150px;
      }

      .studio-strip-body {
        padding: 20px 16px;
      }

      .studio-strip-body h3 {
        font-size: 22px;
      }

      .cart-drawer {
        width: 100%;
        max-width: 100vw;
      }

      .modal-overlay {
        padding: 12px;
      }

      .modal-content {
        padding: 24px 16px;
        max-height: 90dvh;
        border-radius: 14px;
      }

      .modal-grid {
        grid-template-columns: 1fr;
        gap: 18px;
      }

      .modal-img {
        max-height: 260px;
      }

      .footer-container {
        grid-template-columns: 1fr;
        gap: 28px;
      }

      .footer-bottom {
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }

      .toast {
        font-size: 14px;
        padding: 12px 18px;
        right: 16px;
        left: 16px;
        justify-content: center;
        text-align: center;
      }
    }

    /* Compact Smartphones (max-width: 480px) */
    @media (max-width: 480px) {
      .announcement-bar {
        font-size: 13px;
        flex-direction: column;
        text-align: center;
        gap: 6px;
        padding: 8px 10px;
      }

      .announcement-bar .badge {
        padding: 4px 12px;
        min-height: 30px;
        display: inline-flex;
        align-items: center;
      }

      .nav-container {
        padding: 8px 12px;
        gap: 8px;
      }

      .brand-logo-img {
        height: 38px;
      }

      .nav-cart-btn {
        padding: 0 10px;
        gap: 4px;
        font-size: 14px;
        min-width: 44px;
        justify-content: center;
      }

      .cart-btn-label {
        display: none;
      }

      .cart-btn-icon-only {
        display: inline;
      }

      .product-grid {
        grid-template-columns: 1fr;
      }

      .card-img-wrapper {
        height: 240px;
      }

      .btn-primary {
        min-height: 48px;
        font-size: 16px;
      }

      .cart-drawer-header {
        padding: 16px;
      }

      .cart-drawer-body {
        padding: 16px;
      }

      .cart-drawer-footer {
        padding: 16px;
      }
    }
`;

// Insert CSS right before </style>
html = html.replace('  </style>', mobileCss + '\n  </style>');

// 2. Upgrade Header with mobile hamburger and search toggle
const oldHeaderNav = `<nav aria-label="Main Navigation">
        <ul class="nav-menu">`;
const newHeaderNav = `<nav class="desktop-nav" aria-label="Main Navigation">
        <ul class="nav-menu">`;
html = html.replace(oldHeaderNav, newHeaderNav);

const oldNavContainerStart = `<div class="nav-container">
      <a href="javascript:void(0)" onclick="navigateTo('shop')" class="brand-logo-link" title="Suzy Toronto Home">
        <img src="https://suzytoronto.com/wp-content/uploads/2020/02/cropped-STS_LOGO-website-header2.jpg" alt="Suzy Toronto Logo" class="brand-logo-img">
      </a>`;

const newNavContainerStart = `<div class="nav-container">
      <!-- Mobile Hamburger Toggle Button -->
      <button class="mobile-menu-toggle" id="mobileMenuBtn" aria-label="Open Navigation Menu" onclick="toggleMobileNav()">
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
      </button>

      <a href="javascript:void(0)" onclick="navigateTo('shop')" class="brand-logo-link" title="Suzy Toronto Home">
        <img src="https://suzytoronto.com/wp-content/uploads/2020/02/cropped-STS_LOGO-website-header2.jpg" alt="Suzy Toronto Logo" class="brand-logo-img">
      </a>`;
html = html.replace(oldNavContainerStart, newNavContainerStart);

const oldNavActions = `<!-- Right Search & Cart Actions -->
      <div class="nav-actions">
        <div class="nav-search-box">
          <span class="nav-search-icon">🔍</span>
          <input type="text" id="site-search" class="nav-search-input" placeholder="Search gifts..." oninput="handleSearch(this.value)">
        </div>
        <button class="nav-cart-btn" onclick="openCart()">
          <span>🛒 Cart</span>
          <span id="cart-badge-count" class="cart-count-badge">0</span>
        </button>
      </div>`;

const newNavActions = `<!-- Right Search & Cart Actions -->
      <div class="nav-actions">
        <button class="mobile-search-toggle" aria-label="Toggle Search" onclick="toggleMobileSearch()">
          🔍
        </button>
        <div class="nav-search-box">
          <span class="nav-search-icon">🔍</span>
          <input type="text" id="site-search" class="nav-search-input" placeholder="Search gifts..." oninput="handleSearch(this.value); syncMobileSearch(this.value)">
        </div>
        <button class="nav-cart-btn" onclick="openCart()" aria-label="Shopping Cart">
          <span class="cart-btn-label">🛒 Cart</span>
          <span class="cart-btn-icon-only">🛒</span>
          <span id="cart-badge-count" class="cart-count-badge">0</span>
        </button>
      </div>`;
html = html.replace(oldNavActions, newNavActions);

// Insert Mobile Search Bar dropdown right after nav-container closing tag
const headerClose = `    </div>
  </header>`;

const newHeaderClose = `    </div>
    <!-- Mobile Expandable Search Bar -->
    <div class="mobile-search-bar" id="mobileSearchBar">
      <div class="mobile-search-inner">
        <span class="nav-search-icon">🔍</span>
        <input type="text" id="mobile-site-search" class="mobile-search-input" placeholder="Search gifts, planners, tumblers..." oninput="handleSearch(this.value); syncDesktopSearch(this.value)">
        <button class="mobile-search-close" onclick="toggleMobileSearch()" aria-label="Close Search">✕</button>
      </div>
    </div>
  </header>

  <!-- Mobile Drawer Backdrop & Slide-out Navigation Drawer -->
  <div class="mobile-drawer-overlay" id="mobileDrawerOverlay" onclick="closeMobileNav()"></div>
  <aside class="mobile-nav-drawer" id="mobileNavDrawer" aria-label="Mobile Navigation">
    <div class="mobile-drawer-header">
      <img src="https://suzytoronto.com/wp-content/uploads/2020/02/cropped-STS_LOGO-website-header2.jpg" alt="Suzy Toronto Logo" class="mobile-drawer-logo">
      <button class="mobile-drawer-close" onclick="closeMobileNav()" aria-label="Close Navigation">✕</button>
    </div>
    <div class="mobile-drawer-body">
      
      <!-- Quick Family Story Highlight Link -->
      <a href="javascript:void(0)" onclick="navigateTo('about'); closeMobileNav();" class="mobile-nav-hero-link">
        <span>💖 Our Family Story & Team</span>
        <span class="mobile-arrow">→</span>
      </a>

      <!-- Accordion: Shop by Product -->
      <div class="mobile-accordion-item open">
        <button class="mobile-accordion-header" onclick="toggleAccordion(this)">
          <span>🛍️ Shop by Product</span>
          <span class="acc-chevron">▾</span>
        </button>
        <div class="mobile-accordion-content">
          <a href="javascript:void(0)" onclick="navigateTo('shop', 'calendars'); closeMobileNav();">📅 2027 Calendars & Planners</a>
          <a href="javascript:void(0)" onclick="navigateTo('shop', 'art-prints'); closeMobileNav();">🖼️ 8x10 Matted Art Prints</a>
          <a href="javascript:void(0)" onclick="navigateTo('shop', 'buggy-buddies'); closeMobileNav();">🛒 Buggy Buddies Keychains</a>
          <a href="javascript:void(0)" onclick="navigateTo('shop', 'drinkware'); closeMobileNav();">☕ Stainless Tumblers & Coasters</a>
          <a href="javascript:void(0)" onclick="navigateTo('shop', 'journals'); closeMobileNav();">📓 Notebooks & Journals (+NameDrop)</a>
          <a href="javascript:void(0)" onclick="navigateTo('shop', 'stationery'); closeMobileNav();">📝 Post-It Sticky Notes & Memo Pads</a>
          <a href="javascript:void(0)" onclick="navigateTo('shop', 'bookmarks'); closeMobileNav();">📑 Bookmarks & Bag Tags</a>
        </div>
      </div>

      <!-- Accordion: Shop by Theme -->
      <div class="mobile-accordion-item open">
        <button class="mobile-accordion-header" onclick="toggleAccordion(this)">
          <span>💃 Shop by Theme</span>
          <span class="acc-chevron">▾</span>
        </button>
        <div class="mobile-accordion-content">
          <a href="javascript:void(0)" onclick="navigateToTheme('wild-women'); closeMobileNav();">💃 Wild Women & Goddesses</a>
          <a href="javascript:void(0)" onclick="navigateToTheme('sisterhood'); closeMobileNav();">👭 Kindred Spirits & Sisterhood</a>
          <a href="javascript:void(0)" onclick="navigateToTheme('faith'); closeMobileNav();">✝️ Faith & Inspiration</a>
          <a href="javascript:void(0)" onclick="navigateToTheme('office-humor'); closeMobileNav();">🏢 Work & Daily Humor</a>
          <a href="javascript:void(0)" onclick="navigateToTheme('gifts-under-10'); closeMobileNav();">🎁 Stocking Stuffers Under $10</a>
        </div>
      </div>

      <!-- Accordion: Customer Care & Help -->
      <div class="mobile-accordion-item">
        <button class="mobile-accordion-header" onclick="toggleAccordion(this)">
          <span>❓ Customer Care & FAQ</span>
          <span class="acc-chevron">▾</span>
        </button>
        <div class="mobile-accordion-content">
          <a href="javascript:void(0)" onclick="openHelpModal('preorder'); closeMobileNav();">🚚 2027 Calendar Pre-Order & Split Shipping</a>
          <a href="javascript:void(0)" onclick="openHelpModal('tracking'); closeMobileNav();">📦 Track My Order Status</a>
          <a href="javascript:void(0)" onclick="openHelpModal('returns'); closeMobileNav();">🔄 Easy Returns & Exchanges</a>
          <a href="javascript:void(0)" onclick="openHelpModal('contact'); closeMobileNav();">💬 Contact Customer Care</a>
        </div>
      </div>

      <div class="mobile-drawer-footer">
        <div class="mobile-drawer-contact">
          <strong style="color: var(--suzy-purple); font-size: 15px; display:block; margin-bottom: 4px;">Need Personal Assistance?</strong>
          <p>Family-owned & operated in Mt. Dora, FL</p>
          <button class="btn-primary" style="margin-top: 10px; font-size: 15px; min-height: 44px;" onclick="openHelpModal('contact'); closeMobileNav();">
            💬 Call or Message Us
          </button>
        </div>
      </div>

    </div>
  </aside>`;
html = html.replace(headerClose, newHeaderClose);

// 3. Add Mobile Floating Bottom Navigation Bar before </body>
const bottomBarHtml = `
  <!-- Mobile Floating Quick Bar -->
  <nav class="mobile-bottom-bar" aria-label="Mobile Navigation Quick Bar">
    <button class="bottom-bar-btn" onclick="navigateTo('shop')">
      <span class="bottom-icon">🛍️</span>
      <span>Shop</span>
    </button>
    <button class="bottom-bar-btn" onclick="toggleMobileNav()">
      <span class="bottom-icon">📑</span>
      <span>Menu</span>
    </button>
    <button class="bottom-bar-btn" onclick="navigateTo('about')">
      <span class="bottom-icon">💖</span>
      <span>Our Story</span>
    </button>
    <button class="bottom-bar-btn" onclick="openCart()">
      <span class="bottom-icon">🛒</span>
      <span>Cart (<span id="mobile-bar-cart-count">0</span>)</span>
    </button>
  </nav>
`;

html = html.replace('</body>', bottomBarHtml + '\n</body>');

// 4. Update JS functions for mobile
const jsToAdd = `
    // Mobile Navigation Controls
    function toggleMobileNav() {
      const drawer = document.getElementById('mobileNavDrawer');
      const overlay = document.getElementById('mobileDrawerOverlay');
      if (!drawer || !overlay) return;
      const isOpen = drawer.classList.contains('active');
      if (isOpen) {
        closeMobileNav();
      } else {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeMobileNav() {
      const drawer = document.getElementById('mobileNavDrawer');
      const overlay = document.getElementById('mobileDrawerOverlay');
      if (drawer) drawer.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    function toggleAccordion(btn) {
      const item = btn.closest('.mobile-accordion-item');
      if (item) {
        item.classList.toggle('open');
      }
    }

    function toggleMobileSearch() {
      const bar = document.getElementById('mobileSearchBar');
      const input = document.getElementById('mobile-site-search');
      if (bar) {
        bar.classList.toggle('active');
        if (bar.classList.contains('active') && input) {
          input.focus();
        }
      }
    }

    function syncDesktopSearch(val) {
      const desktopSearch = document.getElementById('site-search');
      if (desktopSearch) desktopSearch.value = val;
    }

    function syncMobileSearch(val) {
      const mobileSearch = document.getElementById('mobile-site-search');
      if (mobileSearch) mobileSearch.value = val;
    }
`;

// Insert JS before </script>
html = html.replace('  </script>', jsToAdd + '\n  </script>');

// Update updateCartUI to also update mobile-bar-cart-count
html = html.replace(
  "document.getElementById('cart-badge-count').textContent = totalQty;",
  `document.getElementById('cart-badge-count').textContent = totalQty;
      const mobileBarCount = document.getElementById('mobile-bar-cart-count');
      if (mobileBarCount) mobileBarCount.textContent = totalQty;`
);

fs.writeFileSync('index.html', html, 'utf8');
fs.writeFileSync('deploy/public/index.html', html, 'utf8');
fs.writeFileSync('poc_preview.html', html, 'utf8');

console.log('Successfully updated index.html, deploy/public/index.html, and poc_preview.html for mobile responsiveness!');
