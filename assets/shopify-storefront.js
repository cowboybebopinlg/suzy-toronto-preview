/**
 * Shopify Storefront API Integration for Suzy Toronto
 * Store: suzy-toronto-fpkxqg4y.myshopify.com
 *
 * Architecture & SOLID Principles:
 * - Single Responsibility:
 *     - SecuritySanitizer: sanitizes HTML (XSS prevention), escapes search syntax, maps friendly errors.
 *     - CartService: manages cart items, quantities, pricing, pre-order detection, and checkout payload construction.
 *     - ShopifyClient: encapsulates Shopify GraphQL communication and mutation handling.
 *     - StorefrontUI / ShopifyStore: orchestrates DOM interactions, modal displays, and UI event binding.
 * - Open/Closed:
 *     - CartService accepts custom storage adapters (LocalStorage, MemoryStorage, SessionStorage).
 *     - ShopifyClient accepts custom fetch functions and configuration for test mocks and extensions.
 * - Liskov Substitution:
 *     - Storage adapters adhere to the standard Web Storage interface (getItem, setItem, removeItem, clear).
 * - Interface Segregation:
 *     - Focused, decoupled classes that can be tested and used independently of the browser DOM.
 * - Dependency Inversion:
 *     - StorefrontUI depends on CartService and ShopifyClient abstractions rather than hardcoded global states.
 */

const SHOPIFY_CONFIG = {
  domain: 'suzy-toronto-fpkxqg4y.myshopify.com',
  storefrontAccessToken: 'ef81f1a19ceb3edb260bca217766dd48',
  apiVersion: '2024-04'
};

// ==========================================
// 1. SECURITY SANITIZER (SRP: Input/Output Security)
// ==========================================
class SecuritySanitizer {
  /**
   * Strips executable script tags, styles, object/embed/applet tags,
   * inline event handlers (onerror, onload, onclick, etc.), and
   * dangerous pseudo-protocols (javascript:, vbscript:) from HTML.
   */
  static sanitizeHtml(dirtyHtml) {
    if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

    // 1. Strip dangerous tags
    let clean = dirtyHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '');

    // 2. Remove inline event handlers (e.g. onclick="...", onerror=...)
    clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

    // 3. Neutralize javascript: and vbscript: URIs in href and src
    clean = clean.replace(
      /(href|src)\s*=\s*(?:["']\s*(?:javascript|vbscript):[^"']*["']|(?:javascript|vbscript):[^\s>]+)/gi,
      '$1="#"'
    );

    return clean;
  }

  /**
   * Sanitizes search query string to prevent Lucene query syntax injection
   * or malformed GraphQL queries when user inputs special search characters.
   */
  static sanitizeSearchQuery(query) {
    if (!query || typeof query !== 'string') return '';
    return query
      .replace(/[\+\-\&\|\!\(\)\{\}\[\]\^\"~*?:\\\/<>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Provides safe, user-friendly error messages rather than leaking raw stack traces.
   */
  static formatErrorMessage(error) {
    if (!error) return 'An unexpected error occurred. Please try again.';
    const msg = error.message || String(error);
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    if (msg.includes('GraphQL') || msg.includes('Shopify API')) {
      return 'Unable to communicate with Shopify. Please refresh or try again in a few moments.';
    }
    return msg;
  }
}

// ==========================================
// 2. STORAGE ADAPTERS (LSP & OCP: Web Storage Interface)
// ==========================================
class MemoryStorageAdapter {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

class LocalStorageAdapter {
  getItem(key) {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  }
  setItem(key, value) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    } catch {}
  }
  removeItem(key) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    } catch {}
  }
}

// ==========================================
// 3. CART SERVICE (SRP: Cart Domain Logic & Fulfillment Attributes)
// ==========================================
class CartService {
  constructor(storageAdapter = null, storageKey = 'suzy_shopify_cart') {
    this.storage = storageAdapter || (typeof localStorage !== 'undefined' ? new LocalStorageAdapter() : new MemoryStorageAdapter());
    this.storageKey = storageKey;
    this.items = [];
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = this.storage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.items = Array.isArray(parsed) ? parsed : [];
      } else {
        this.items = [];
      }
    } catch {
      this.items = [];
    }
  }

  saveToStorage() {
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch {}
  }

  addItem(item) {
    if (!item || !item.variantId) {
      throw new Error('Item variantId is required');
    }
    const qty = Math.max(1, parseInt(item.qty || item.quantity || 1, 10));
    const existing = this.items.find(i => i.variantId === item.variantId);
    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push({
        variantId: item.variantId,
        title: item.title || 'Product',
        price: parseFloat(item.price) || 0,
        img: item.img || '',
        isPreorder: Boolean(item.isPreorder),
        qty: qty
      });
    }
    this.saveToStorage();
    return this.items;
  }

  updateQuantity(variantId, delta) {
    const item = this.items.find(i => i.variantId === variantId);
    if (!item) return this.items;
    item.qty += delta;
    if (item.qty <= 0) {
      this.items = this.items.filter(i => i.variantId !== variantId);
    }
    this.saveToStorage();
    return this.items;
  }

  removeItem(variantId) {
    this.items = this.items.filter(i => i.variantId !== variantId);
    this.saveToStorage();
    return this.items;
  }

  clear() {
    this.items = [];
    this.saveToStorage();
  }

  getTotalQuantity() {
    return this.items.reduce((acc, item) => acc + (item.qty || 0), 0);
  }

  getSubtotal() {
    const total = this.items.reduce((acc, item) => acc + ((item.price || 0) * (item.qty || 0)), 0);
    return Math.round(total * 100) / 100;
  }

  hasPreorder() {
    return this.items.some(i => i.isPreorder);
  }

  hasInStock() {
    return this.items.some(i => !i.isPreorder);
  }

  isSplitShippingRequired() {
    return this.hasPreorder() && this.hasInStock();
  }

  getCheckoutPayload() {
    const lines = this.items.map(item => {
      const lineAttrs = [];
      if (item.isPreorder) {
        lineAttrs.push({ key: 'FulfillmentType', value: 'Pre-Order (Ships October)' });
      }
      return {
        merchandiseId: item.variantId,
        quantity: item.qty,
        attributes: lineAttrs.length > 0 ? lineAttrs : undefined
      };
    });

    const cartAttrs = [];
    let note = '';
    if (this.isSplitShippingRequired()) {
      cartAttrs.push({ key: 'OrderType', value: 'Split-Shipping' });
      cartAttrs.push({ key: 'PreOrderFulfillment', value: 'October 2026 Release' });
      note = 'Order contains both in-stock items and pre-order calendars/items. In-stock items will ship immediately; pre-order items will ship upon release in October.';
    } else if (this.hasPreorder()) {
      cartAttrs.push({ key: 'OrderType', value: 'Pre-Order' });
      cartAttrs.push({ key: 'PreOrderFulfillment', value: 'October 2026 Release' });
      note = 'All items are pre-orders shipping in October.';
    }

    return {
      lines,
      attributes: cartAttrs.length > 0 ? cartAttrs : undefined,
      note: note || undefined
    };
  }
}

// ==========================================
// 4. SHOPIFY CLIENT (SRP & DIP: API Communication)
// ==========================================
class ShopifyClient {
  constructor(config = SHOPIFY_CONFIG, fetchFn = null) {
    this.domain = config.domain;
    this.token = config.storefrontAccessToken;
    this.apiVersion = config.apiVersion || '2024-04';
    this.endpoint = `https://${this.domain}/api/${this.apiVersion}/graphql.json`;
    this.fetch = fetchFn || (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : null);
  }

  async query(queryString, variables = {}) {
    if (!this.fetch) {
      throw new Error('No fetch implementation available');
    }

    const response = await this.fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': this.token
      },
      body: JSON.stringify({ query: queryString, variables })
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    if (json.errors && json.errors.length > 0) {
      console.error('GraphQL Errors:', json.errors);
      throw new Error(json.errors[0]?.message || 'GraphQL error');
    }
    return json.data;
  }

  async getProducts({ first = 24, after = null, query = '' } = {}) {
    const gql = `
      query getProducts($first: Int!, $after: String, $query: String) {
        products(first: $first, after: $after, query: $query) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              title
              handle
              description
              descriptionHtml
              productType
              vendor
              tags
              availableForSale
              featuredImage {
                url
                altText
              }
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 20) {
                edges {
                  node {
                    id
                    title
                    sku
                    availableForSale
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                    }
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.query(gql, { first, after, query: query || null });
    return {
      products: data.products.edges.map(e => ({ ...e.node, cursor: e.cursor })),
      pageInfo: data.products.pageInfo
    };
  }

  async getProductByHandle(handle) {
    const gql = `
      query getProductByHandle($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          description
          descriptionHtml
          productType
          vendor
          tags
          availableForSale
          featuredImage {
            url
            altText
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          options {
            name
            values
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                }
                selectedOptions {
                  name
                  value
                }
                image {
                  url
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.query(gql, { handle });
    return data.product;
  }

  /**
   * Creates a checkout via Shopify cartCreate mutation.
   * Fixes QuickBuy merchandiseId parameter mismatch and forwards pre-order line & cart attributes.
   */
  async createCheckout(cartInput) {
    const gql = `
      mutation cartCreate($input: CartInput) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    let payload;
    if (cartInput && typeof cartInput.getCheckoutPayload === 'function') {
      payload = cartInput.getCheckoutPayload();
    } else if (Array.isArray(cartInput)) {
      payload = {
        lines: cartInput.map(item => ({
          merchandiseId: item.merchandiseId || item.variantId || item.id,
          quantity: item.qty || item.quantity || 1,
          attributes: item.attributes || (item.isPreorder ? [{ key: 'FulfillmentType', value: 'Pre-Order (Ships October)' }] : undefined)
        }))
      };
    } else if (cartInput && cartInput.lines) {
      payload = cartInput;
    } else {
      throw new Error('Invalid cart input provided to createCheckout');
    }

    const data = await this.query(gql, { input: payload });
    if (data.cartCreate.userErrors && data.cartCreate.userErrors.length > 0) {
      throw new Error(data.cartCreate.userErrors[0].message);
    }
    return data.cartCreate.cart;
  }
}

// Attach client to window if in browser
if (typeof window !== 'undefined') {
  window.shopifyClient = new ShopifyClient();
}

// ==========================================
// 5. ANALYTICS SERVICE (SRP: E-Commerce Tracking & Marketing Instrumentation)
// ==========================================
class AnalyticsService {
  /**
   * Pushes e-commerce events to Google Tag Manager / GA4 dataLayer
   * and dispatches a custom DOM event ('suzy:analytics') for Meta Pixel,
   * Klaviyo, Pinterest, or custom analytics subscribers (OCP).
   */
  static track(eventName, data = {}) {
    if (typeof window === 'undefined') return;

    // 1. Google Tag Manager / GA4 dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...data
    });

    // 2. Custom DOM event for decoupled third-party marketing tags
    try {
      window.dispatchEvent(new CustomEvent('suzy:analytics', {
        detail: { event: eventName, ...data }
      }));
    } catch {}
  }

  static trackViewItem(product, variant) {
    if (!product || !variant) return;
    const price = parseFloat(variant.price?.amount || 0);
    this.track('view_item', {
      ecommerce: {
        currency: variant.price?.currencyCode || 'USD',
        value: price,
        items: [{
          item_id: variant.id,
          item_name: product.title,
          item_category: product.productType || 'Gifts',
          item_variant: variant.title !== 'Default Title' ? variant.title : undefined,
          price: price,
          quantity: 1
        }]
      }
    });
  }

  static trackAddToCart(item) {
    if (!item) return;
    this.track('add_to_cart', {
      ecommerce: {
        currency: 'USD',
        value: (item.price || 0) * (item.qty || 1),
        items: [{
          item_id: item.variantId,
          item_name: item.title,
          price: item.price || 0,
          quantity: item.qty || 1
        }]
      }
    });
  }

  static trackRemoveFromCart(item) {
    if (!item) return;
    this.track('remove_from_cart', {
      ecommerce: {
        currency: 'USD',
        value: (item.price || 0) * (item.qty || 1),
        items: [{
          item_id: item.variantId,
          item_name: item.title,
          price: item.price || 0,
          quantity: item.qty || 1
        }]
      }
    });
  }

  static trackBeginCheckout(items, subtotal) {
    this.track('begin_checkout', {
      ecommerce: {
        currency: 'USD',
        value: subtotal || 0,
        items: (items || []).map(item => ({
          item_id: item.variantId || item.merchandiseId,
          item_name: item.title || 'Product',
          price: item.price || 0,
          quantity: item.qty || item.quantity || 1
        }))
      }
    });
  }

  static trackSearch(searchTerm, resultCount) {
    this.track('search', {
      search_term: searchTerm,
      result_count: resultCount
    });
  }
}

// Expose on window if in browser
if (typeof window !== 'undefined') {
  window.AnalyticsService = AnalyticsService;
}

// ==========================================
// 6. STOREFRONT UI CONTROLLER (ShopifyStore)
// ==========================================
const ShopifyStore = {
  products: [],
  pageInfo: { hasNextPage: false, endCursor: null },
  currentQuery: '',
  isLoading: false,
  activeProduct: null,
  selectedVariant: null,
  _searchRequestId: 0,
  cartService: null,

  async init() {
    this.cartService = new CartService();
    this.checkPostCheckoutReturn();
    this.updateCartUI();
    await this.fetchAndRenderProducts(true);
    this.setupListeners();
  },

  checkPostCheckoutReturn() {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('checkout_complete') === 'true' || params.get('order_status') || params.get('step') === 'thank_you') {
        this.cartService.clear();
        if (typeof showToast === 'function') {
          showToast('Thank you for your order! Your cart has been completed.');
        }
      }
    } catch {}
  },

  setupListeners() {
    if (typeof document === 'undefined') return;

    // Synchronized debounced search handlers
    const setupDebouncedInput = (elemId, syncElemId) => {
      const input = document.getElementById(elemId);
      if (!input) return;

      let timer;
      input.addEventListener('input', (e) => {
        const val = e.target.value;
        const other = document.getElementById(syncElemId);
        if (other && other.value !== val) other.value = val;

        clearTimeout(timer);
        timer = setTimeout(() => {
          this.handleSearch(val);
        }, 350);
      });
    };

    setupDebouncedInput('site-search', 'mobile-site-search');
    setupDebouncedInput('mobile-site-search', 'site-search');
  },

  async fetchAndRenderProducts(reset = false) {
    if (this.isLoading && !reset) return;
    this.isLoading = true;

    const currentReq = ++this._searchRequestId;
    const grid = document.getElementById('product-grid');
    const counter = document.getElementById('results-counter');

    if (reset) {
      this.products = [];
      this.pageInfo = { hasNextPage: false, endCursor: null };
      if (grid) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
            <div style="display: inline-block; width: 44px; height: 44px; border: 4px solid #E8E2D9; border-top-color: var(--suzy-magenta); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
            <p style="margin-top: 16px; font-weight: 600; color: var(--suzy-purple);">Connecting live to Shopify catalog...</p>
          </div>
          <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        `;
      }
    }

    try {
      const res = await window.shopifyClient.getProducts({
        first: 24,
        after: reset ? null : this.pageInfo.endCursor,
        query: this.currentQuery
      });

      // Discard stale out-of-order search responses
      if (currentReq !== this._searchRequestId) return;

      if (reset) {
        this.products = res.products;
      } else {
        this.products.push(...res.products);
      }
      this.pageInfo = res.pageInfo;

      this.renderGrid();

      if (counter) {
        const queryText = this.currentQuery
          ? ` matching "${this.currentQuery.replace(/product_type:|tag:|vendor:|title:\*/g, '').replace(/\*/g, '').trim()}"`
          : '';
        counter.textContent = `Showing ${this.products.length} products${queryText} (Live from Shopify)`;
      }
    } catch (err) {
      if (currentReq !== this._searchRequestId) return;
      console.error('Error loading Shopify products:', err);
      const friendlyMsg = SecuritySanitizer.formatErrorMessage(err);
      if (grid && reset) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #FFF5F5; border: 1px solid #FED7D7; border-radius: 12px;">
            <p style="color: #C53030; font-weight: 700;">Unable to connect to live Shopify store.</p>
            <p style="color: #742A2A; font-size: 15px; margin-top: 6px;">${friendlyMsg}</p>
            <button class="btn-primary" onclick="ShopifyStore.fetchAndRenderProducts(true)" style="margin-top: 16px;">Try Again</button>
          </div>
        `;
      }
    } finally {
      if (currentReq === this._searchRequestId) {
        this.isLoading = false;
      }
    }
  },

  renderGrid() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    if (this.products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <p style="font-size: 20px; font-weight: 700; color: var(--suzy-purple);">No products found</p>
          <p style="color: var(--suzy-text-muted); margin-top: 8px;">Try clearing your search filter or selecting another category.</p>
          <button class="btn-primary" onclick="ShopifyStore.filterCategory('all')" style="margin-top: 20px;">View All Products</button>
        </div>
      `;
      return;
    }

    const cardsHtml = this.products.map(p => {
      const minPrice = parseFloat(p.priceRange.minVariantPrice.amount);
      const maxPrice = parseFloat(p.priceRange.maxVariantPrice.amount);
      const priceDisplay = minPrice === maxPrice 
        ? `$${minPrice.toFixed(2)}` 
        : `$${minPrice.toFixed(2)} – $${maxPrice.toFixed(2)}`;

      const imgUrl = p.featuredImage?.url || (p.images?.edges[0]?.node?.url) || 'https://suzytoronto.com/wp-content/uploads/2026/03/PO-LG27CAL_OPT.jpg';
      const firstVariant = p.variants?.edges[0]?.node;
      const isPreorder = (p.title + ' ' + (p.tags || []).join(' ')).toLowerCase().includes('pre-order') || p.title.includes('2027');
      const badgeHtml = isPreorder 
        ? `<span class="card-badge preorder">Pre-Order (Ships Oct)</span>` 
        : (p.vendor === 'Kukana' ? `<span class="card-badge" style="background:var(--suzy-teal); color:#fff;">Kukana Collection</span>` : '');

      const hasMultipleVariants = p.variants?.edges?.length > 1;
      const isAvailable = p.availableForSale;

      return `
        <article class="product-card" data-id="${p.handle}" data-category="${p.productType}">
          ${badgeHtml}
          <div class="card-img-wrapper" onclick="ShopifyStore.openModal('${p.handle}')" style="cursor: pointer;">
            <img src="${imgUrl}" alt="${p.featuredImage?.altText || p.title}" loading="lazy">
          </div>
          <div class="card-body">
            <div class="card-category">${p.productType || p.vendor || 'Suzy Toronto'}</div>
            <h3 class="card-title" onclick="ShopifyStore.openModal('${p.handle}')" style="cursor: pointer;">${p.title}</h3>
            <div class="card-price-row">
              <span class="card-price">${priceDisplay}</span>
              <span class="card-sku">${firstVariant?.sku ? 'SKU: ' + firstVariant.sku : ''}</span>
            </div>
            
            <button class="btn-primary" onclick="ShopifyStore.openModal('${p.handle}')" ${!isAvailable ? 'disabled style="opacity:0.6;"' : ''}>
              <span>${!isAvailable ? 'Sold Out' : (hasMultipleVariants ? 'Select Options & Buy' : 'Quick View & Order')}</span>
            </button>
            
            <div class="express-checkout-box">
              <span class="express-label">1-Tap Live Checkout</span>
              <div class="express-buttons">
                <button class="express-btn btn-shoppay" onclick="ShopifyStore.quickBuy('${firstVariant?.id}')" ${!isAvailable ? 'disabled style="opacity:0.5;"' : ''}>Shop Pay</button>
                <button class="express-btn btn-applepay" onclick="ShopifyStore.quickBuy('${firstVariant?.id}')" ${!isAvailable ? 'disabled style="opacity:0.5;"' : ''}>Apple Pay</button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    const loadMoreBtn = this.pageInfo.hasNextPage ? `
      <div id="load-more-container" style="grid-column: 1 / -1; text-align: center; margin: 40px 0 20px;">
        <button id="btn-load-more" class="btn-cta-gold" onclick="ShopifyStore.loadMore()" style="padding: 14px 36px; font-size: 18px; border-radius: 30px; box-shadow: 0 4px 15px rgba(194, 24, 91, 0.2);">
          <span>Load More Products (${this.products.length}+)</span>
          <svg class="pika-icon" viewBox="0 0 24 24" style="width:20px;height:20px;margin-left:8px;" aria-hidden="true"><use href="assets/icons/pika-duo-solid.svg#arrow-right"></use></svg>
        </button>
      </div>
    ` : '';

    grid.innerHTML = cardsHtml + loadMoreBtn;
  },

  async loadMore() {
    const btn = document.getElementById('btn-load-more');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Loading more products...</span>';
    }
    await this.fetchAndRenderProducts(false);
  },

  categoryQueryMap: {
    'all': '',
    'brand:suzy': 'vendor:"Suzy Toronto"',
    'brand:kukana': 'vendor:Kukana OR tag:Kukana',
    'Calendars & Planners': 'product_type:"Calendars & Planners" OR tag:"2027 Calendar"',
    'Art Prints': 'product_type:*Art Prints* OR tag:*Art Print*',
    'Greeting Cards': 'product_type:*Greeting* OR tag:*Greeting*',
    'Coasters': 'product_type:*Coaster* OR tag:*Coaster*',
    'Mouse Pads': 'product_type:*Mouse* OR tag:*Mouse*',
    'Key Chains': 'product_type:*Key* OR product_type:"Buggy Buddies" OR tag:*Keychain*',
    'Magnets': 'product_type:"Magnets" OR tag:"Magnets"',
    'Apparel': 'product_type:"Apparel" OR tag:*T-shirt*',
    'Luggage Tags': 'product_type:*Tag* OR tag:*Bag Tag*',
    'Note Cards': 'product_type:"Note Cards" OR tag:"Note Cards"',
    'Bookmarks': 'product_type:"Bookmarks" OR tag:"Bookmarks"',
    'Memo Pads': 'product_type:*Stationery* OR product_type:*Memo* OR tag:*post-it* OR tag:*Memo*',
    'Drawstring Backpacks': 'product_type:*Bags* OR product_type:*Backpack* OR tag:*Backpack*',
    'Drinkware': 'product_type:*Drink* OR product_type:*Tumbler* OR tag:*Stainless*',
    'Journals & Notebooks': 'product_type:*Journal* OR tag:*Notebook*',
    'Canvas Wall Art': 'product_type:*Canvas* OR tag:*Canvas*',
    'Recipe Cards': 'product_type:*Recipe* OR tag:*Recipe*',
    'Stationery & Post-It Notes': 'tag:*post-it* OR product_type:*Sticky* OR tag:*Sticker*',
    'Books': 'product_type:"Books" OR tag:"Books"',
    
    // Themed Collections
    'col:quilt': 'tag:*Quilt* OR product_type:*Quilt*',
    'col:tingleboots': 'tag:*TingleBoots* OR product_type:*TingleBoots*',
    'col:mermaids': 'tag:*Divas* OR tag:*Mermaid* OR product_type:*Mermaid*',
    'col:goddesses': 'tag:*Goddesses* OR tag:*Wonderful Wacky Women*',
    'col:american': 'tag:*American* OR tag:*PROUD to be an AMERICAN*',
    'col:christmas': 'tag:*Christmas*',
    'col:chocolate': 'tag:*Chocolate*',
    'col:pickleball': 'tag:*Pickleball*',
    'col:pink-ribbon': 'tag:*Pink Ribbon*',
    'col:pets': 'tag:*Pets* OR tag:*Dog* OR tag:*Cat*',
    'col:irish': 'tag:*Irish* OR tag:*Celtic*',
    'col:birthday': 'tag:*Birthday*',
    'col:valentines': 'tag:*Valentine* OR title:*Valentine*',

    // Recipients
    'rec:friend': 'tag:*Friend* OR product_type:*Friend*',
    'rec:mother': 'tag:*Mother* OR tag:*Mom*',
    'rec:daughter': 'tag:*Daughter*',
    'rec:sister': 'tag:*Sister*',
    'rec:father': 'tag:*Father* OR tag:*Dad*',
    'rec:son': 'tag:*Son*',
    'rec:grandchildren': 'tag:*Grandchildren* OR tag:*Granddaughter*',
    'rec:husband': 'tag:*Husband* OR tag:*Mighty Men*',
    'rec:family': 'tag:*Extended Family*',

    // Kukana sub-brand categories
    'kukana:all': 'vendor:Kukana OR tag:Kukana',
    'kukana:cards': '(vendor:Kukana OR tag:Kukana) AND (product_type:*Greeting* OR tag:*greeting*)',
    'kukana:prints': '(vendor:Kukana OR tag:Kukana) AND (product_type:*Prints* OR tag:*Prints* OR tag:*Easel*)',
    'kukana:snack-mats': '(vendor:Kukana OR tag:Kukana) AND (product_type:*Mouse* OR tag:*Snack Mats*)',
    'kukana:coasters': '(vendor:Kukana OR tag:Kukana) AND (product_type:*Coasters* OR tag:*Coasters*)',
    'kukana:notecards': '(vendor:Kukana OR tag:Kukana) AND (product_type:*Note Cards* OR tag:*Note Cards*)',
    'kukana:memopads': '(vendor:Kukana OR tag:Kukana) AND (product_type:*Memo* OR tag:*Memo*)',
    'kukana:uplifting': '(vendor:Kukana OR tag:Kukana) AND (tag:*Encouraging* OR tag:*Uplifting*)',
    'kukana:gifts': '(vendor:Kukana OR tag:Kukana) AND (tag:*Gifts* OR tag:*Friend* OR tag:*Sister* OR tag:*Mom*)',
  },

  filterBrand(brandKey) {
    document.querySelectorAll('.brand-pill').forEach(btn => btn.classList.remove('active'));
    const activePill = document.getElementById(`pill-brand-${brandKey}`);
    if (activePill) activePill.classList.add('active');

    const spotlight = document.getElementById('kukana-spotlight');
    const select = document.getElementById('category-select');

    if (brandKey === 'kukana') {
      if (spotlight) spotlight.style.display = 'block';
      if (select) select.value = 'brand:kukana';
      this.currentQuery = 'vendor:Kukana OR tag:Kukana';
      if (typeof showToast === 'function') showToast('Showing Keepers by Kukana (148 products)');
    } else if (brandKey === 'suzy') {
      if (spotlight) spotlight.style.display = 'none';
      if (select) select.value = 'brand:suzy';
      this.currentQuery = 'vendor:"Suzy Toronto"';
      if (typeof showToast === 'function') showToast('Showing Suzy Toronto Brand (1,310 products)');
    } else {
      if (spotlight) spotlight.style.display = 'none';
      if (select) select.value = 'all';
      this.currentQuery = '';
      if (typeof showToast === 'function') showToast('Showing All Collections (1,458 products)');
    }

    this.fetchAndRenderProducts(true);
    const catalog = document.getElementById('catalog');
    if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
  },

  filterCategory(category) {
    const select = document.getElementById('category-select');
    if (select) select.value = category;

    document.querySelectorAll('.brand-pill').forEach(btn => btn.classList.remove('active'));
    const spotlight = document.getElementById('kukana-spotlight');

    if (category === 'brand:kukana' || (category && category.startsWith('kukana:'))) {
      const pill = document.getElementById('pill-brand-kukana');
      if (pill) pill.classList.add('active');
      if (spotlight) spotlight.style.display = 'block';
    } else if (category === 'brand:suzy') {
      const pill = document.getElementById('pill-brand-suzy');
      if (pill) pill.classList.add('active');
      if (spotlight) spotlight.style.display = 'none';
    } else {
      const pill = document.getElementById('pill-brand-all');
      if (pill) pill.classList.add('active');
      if (spotlight) spotlight.style.display = 'none';
    }

    this.currentQuery = this.categoryQueryMap[category] !== undefined
      ? this.categoryQueryMap[category]
      : (category && category.startsWith('tag:') ? category : (category ? `product_type:"${category}"` : ''));

    this.fetchAndRenderProducts(true);
    const cleanLabel = (category || 'All').replace(/brand:|col:|rec:|kukana:/g, '').replace(/-/g, ' ');
    if (typeof showToast === 'function') showToast(`Filtering: ${cleanLabel}`);
    const catalog = document.getElementById('catalog');
    if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
  },

  filterTheme(themeTag) {
    this.currentQuery = `tag:"${themeTag}"`;
    const select = document.getElementById('category-select');
    if (select) select.value = '';

    document.querySelectorAll('.brand-pill').forEach(btn => btn.classList.remove('active'));
    const pill = document.getElementById('pill-brand-all');
    if (pill) pill.classList.add('active');
    const spotlight = document.getElementById('kukana-spotlight');
    if (spotlight) spotlight.style.display = 'none';

    this.fetchAndRenderProducts(true);
    if (typeof showToast === 'function') showToast(`Showing theme: ${themeTag}`);
    const catalog = document.getElementById('catalog');
    if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
  },

  handleSearch(text) {
    if (typeof navigateTo === 'function') navigateTo('shop');
    const safeQuery = SecuritySanitizer.sanitizeSearchQuery(text);
    if (!safeQuery) {
      this.currentQuery = '';
    } else {
      this.currentQuery = `title:*${safeQuery}* OR tag:*${safeQuery}* OR product_type:*${safeQuery}*`;
    }
    this.fetchAndRenderProducts(true);
  },

  scrollModalDown(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const content = modal.querySelector('.modal-content');
    if (content) {
      content.scrollBy({ top: 280, behavior: 'smooth' });
    }
  },

  async openModal(handle) {
    const modal = document.getElementById('product-modal');
    const body = document.getElementById('modal-body-content');
    if (!modal || !body) return;

    modal.classList.add('active');
    body.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #E8E2D9; border-top-color: var(--suzy-magenta); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="margin-top: 14px; color: var(--suzy-purple); font-weight:600;">Loading product details from Shopify...</p>
      </div>
    `;

    try {
      const p = await window.shopifyClient.getProductByHandle(handle);
      if (!p) throw new Error('Product not found in Shopify');

      this.activeProduct = p;
      this.selectedVariant = p.variants?.edges[0]?.node;
      AnalyticsService.trackViewItem(p, this.selectedVariant);

      const images = p.images?.edges?.map(e => e.node.url) || [p.featuredImage?.url];
      const mainImg = images[0] || '';

      const thumbsHtml = images.length > 1 ? `
        <div style="display: flex; gap: 8px; margin-top: 12px; overflow-x: auto; padding-bottom: 6px;">
          ${images.map((img, idx) => `
            <img src="${img}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid ${idx === 0 ? 'var(--suzy-magenta)' : '#E8E2D9'};" onclick="document.getElementById('modal-main-img').src='${img}'">
          `).join('')}
        </div>
      ` : '';

      // Variant selector
      let optionsHtml = '';
      if (p.variants?.edges?.length > 1) {
        optionsHtml = `
          <div style="margin: 18px 0;">
            <label style="display: block; font-weight: 700; font-size: 15px; margin-bottom: 6px; color: var(--suzy-purple);">
              Select Option / Size:
            </label>
            <select id="modal-variant-select" onchange="ShopifyStore.handleVariantChange(this.value)" style="width: 100%; height: 48px; font-size: 16px; border-radius: 8px; border: 2px solid var(--suzy-border); padding: 0 12px; font-weight: 600; background: #fff;">
              ${p.variants.edges.map(v => `
                <option value="${v.node.id}" ${v.node.id === this.selectedVariant.id ? 'selected' : ''}>
                  ${v.node.title} — $${parseFloat(v.node.price.amount).toFixed(2)} ${v.node.availableForSale ? '' : '(Sold Out)'}
                </option>
              `).join('')}
            </select>
          </div>
        `;
      }

      const isPreorder = (p.title + ' ' + (p.tags || []).join(' ')).toLowerCase().includes('pre-order') || p.title.includes('2027');
      const splitNotice = isPreorder ? `
        <div class="split-shipping-notice" style="margin-top: 16px;">
          <span><svg class="pika-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="assets/icons/pika-duo-solid.svg#truck-default"></use></svg></span>
          <div>
            <strong>Pre-Order Item (Ships October):</strong><br>
            In-stock items purchased in the same cart ship immediately via Split Shipping.
          </div>
        </div>
      ` : '';

      const isKukana = p.vendor === 'Kukana' || (p.tags || []).includes('Kukana');
      const brandBadgeHtml = isKukana 
        ? `<span style="color: var(--suzy-teal); font-weight:800; text-transform:uppercase; font-size:13px; letter-spacing: 0.06em; background: #E8F8F5; border: 1px solid #A3E4D7; padding: 4px 12px; border-radius: 12px; display: inline-block; margin-bottom: 6px;">🌺 KEEPERS BY KUKANA &bull; ${p.productType || 'Art Gifts'}</span>`
        : `<span style="color: var(--suzy-magenta); font-weight:700; text-transform:uppercase; font-size:13px; letter-spacing: 0.05em; background: #FFF0F5; padding: 4px 10px; border-radius: 12px; display: inline-block; margin-bottom: 6px;">${p.vendor || 'Suzy Toronto'} &bull; ${p.productType || 'Art Gifts'}</span>`;

      // XSS sanitized description
      const safeDescHtml = SecuritySanitizer.sanitizeHtml(p.descriptionHtml) || `<p>${p.description || ''}</p>`;

      const isAvail = this.selectedVariant?.availableForSale !== false;

      body.innerHTML = `
        <div>
          <img id="modal-main-img" src="${mainImg}" class="modal-img" alt="${p.title}" style="border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          ${thumbsHtml}
        </div>
        <div>
          ${brandBadgeHtml}
          <h2 style="font-family: var(--font-heading); font-size: 24px; color: var(--suzy-purple); margin: 4px 0 10px 0; line-height: 1.3;">${p.title}</h2>
          
          <div id="modal-price-display" style="font-size: 28px; font-weight: 800; color: var(--suzy-magenta); margin-bottom: 12px;">
            $${parseFloat(this.selectedVariant.price.amount).toFixed(2)}
          </div>
          
          <!-- Product Description with Explicit Scroll Affordance -->
          <div class="modal-desc-box">
            <div class="modal-desc-header">
              <span class="modal-desc-title">Product Details &amp; Sentiment</span>
              <span id="desc-scroll-badge" class="modal-desc-badge">
                <svg class="pika-icon" viewBox="0 0 24 24"><use href="assets/icons/pika-duo-solid.svg#arrow-down"></use></svg>
                Scroll to read full text
              </span>
            </div>
            <div id="modal-desc-scroll" class="modal-desc-content">
              ${safeDescHtml}
            </div>
          </div>

          ${optionsHtml}
          ${splitNotice}

          <div style="display: flex; gap: 12px; align-items: center; margin-top: 20px;">
            <button id="modal-add-btn" class="btn-primary" onclick="ShopifyStore.addCurrentToCart()" style="flex: 1; height: 50px;" ${!isAvail ? 'disabled style="opacity:0.6;"' : ''}>
              <span>${!isAvail ? 'Sold Out' : `Add to Cart &mdash; <span id="modal-btn-price">$${parseFloat(this.selectedVariant.price.amount).toFixed(2)}</span>`}</span>
            </button>
          </div>

          <div class="express-checkout-box" style="margin-top: 16px;">
            <span class="express-label">Instant 1-Tap Checkout via Shopify</span>
            <div class="express-buttons">
              <button id="modal-quick-shoppay" class="express-btn btn-shoppay" onclick="ShopifyStore.quickBuy(ShopifyStore.selectedVariant.id)" ${!isAvail ? 'disabled style="opacity:0.5;"' : ''}>Shop Pay</button>
              <button id="modal-quick-applepay" class="express-btn btn-applepay" onclick="ShopifyStore.quickBuy(ShopifyStore.selectedVariant.id)" ${!isAvail ? 'disabled style="opacity:0.5;"' : ''}>Apple Pay</button>
            </div>
          </div>
        </div>
      `;

      // Setup Scroll Affordances for Modal Content & Description Box
      const contentEl = modal.querySelector('.modal-content');
      const cueEl = document.getElementById('product-modal-scroll-cue');
      if (contentEl && cueEl) {
        const updateModalCue = () => {
          if (contentEl.scrollHeight > contentEl.clientHeight + 25) {
            if (contentEl.scrollTop + contentEl.clientHeight >= contentEl.scrollHeight - 35) {
              cueEl.classList.remove('visible');
            } else {
              cueEl.classList.add('visible');
            }
          } else {
            cueEl.classList.remove('visible');
          }
        };
        setTimeout(updateModalCue, 120);
        contentEl.onscroll = updateModalCue;
      }

      const descScroll = document.getElementById('modal-desc-scroll');
      const descBadge = document.getElementById('desc-scroll-badge');
      if (descScroll && descBadge) {
        const updateDescBadge = () => {
          if (descScroll.scrollHeight <= descScroll.clientHeight + 10) {
            descBadge.style.display = 'none';
          } else {
            descBadge.style.display = 'inline-flex';
            if (descScroll.scrollTop + descScroll.clientHeight >= descScroll.scrollHeight - 15) {
              descBadge.style.opacity = '0';
            } else {
              descBadge.style.opacity = '1';
            }
          }
        };
        setTimeout(updateDescBadge, 120);
        descScroll.onscroll = updateDescBadge;
      }

    } catch (err) {
      console.error(err);
      const friendlyMsg = SecuritySanitizer.formatErrorMessage(err);
      body.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center;">
          <p style="color: #C53030; font-weight: 700;">Error loading product.</p>
          <p style="color: var(--suzy-text-muted);">${friendlyMsg}</p>
          <button class="btn-primary" onclick="closeModal('product-modal')" style="margin-top: 16px;">Close</button>
        </div>
      `;
    }
  },

  handleVariantChange(variantId) {
    if (!this.activeProduct) return;
    const v = this.activeProduct.variants.edges.find(e => e.node.id === variantId)?.node;
    if (!v) return;

    this.selectedVariant = v;
    const priceFormatted = `$${parseFloat(v.price.amount).toFixed(2)}`;
    
    const priceDisplay = document.getElementById('modal-price-display');
    if (priceDisplay) priceDisplay.textContent = priceFormatted;

    const addBtn = document.getElementById('modal-add-btn');
    const shopPayBtn = document.getElementById('modal-quick-shoppay');
    const applePayBtn = document.getElementById('modal-quick-applepay');

    if (!v.availableForSale) {
      if (addBtn) {
        addBtn.disabled = true;
        addBtn.innerHTML = '<span>Sold Out</span>';
        addBtn.style.opacity = '0.6';
      }
      if (shopPayBtn) { shopPayBtn.disabled = true; shopPayBtn.style.opacity = '0.5'; }
      if (applePayBtn) { applePayBtn.disabled = true; applePayBtn.style.opacity = '0.5'; }
    } else {
      if (addBtn) {
        addBtn.disabled = false;
        addBtn.innerHTML = `<span>Add to Cart &mdash; <span id="modal-btn-price">${priceFormatted}</span></span>`;
        addBtn.style.opacity = '1';
      }
      if (shopPayBtn) { shopPayBtn.disabled = false; shopPayBtn.style.opacity = '1'; }
      if (applePayBtn) { applePayBtn.disabled = false; applePayBtn.style.opacity = '1'; }
    }

    if (v.image?.url) {
      const mainImg = document.getElementById('modal-main-img');
      if (mainImg) mainImg.src = v.image.url;
    }
  },

  addCurrentToCart() {
    if (!this.activeProduct || !this.selectedVariant) return;

    const v = this.selectedVariant;
    const p = this.activeProduct;

    if (!v.availableForSale) {
      if (typeof showToast === 'function') showToast('Sorry, this variant is currently sold out.');
      return;
    }

    const item = {
      variantId: v.id,
      title: p.title + (v.title !== 'Default Title' ? ` - ${v.title}` : ''),
      price: parseFloat(v.price.amount),
      img: v.image?.url || p.featuredImage?.url || '',
      isPreorder: (p.title + ' ' + (p.tags || []).join(' ')).toLowerCase().includes('pre-order') || p.title.includes('2027'),
      qty: 1
    };

    this.cartService.addItem(item);
    this.updateCartUI();
    AnalyticsService.trackAddToCart(item);

    if (typeof closeModal === 'function') closeModal('product-modal');
    if (typeof showToast === 'function') showToast(`Added "${item.title.slice(0, 30)}..." to Cart!`);
    if (typeof openCart === 'function') openCart();
  },

  async quickBuy(variantId) {
    if (!variantId) return;
    if (typeof showToast === 'function') showToast('Redirecting directly to 1-Tap Shopify Checkout...');
    try {
      const checkoutPrice = this.selectedVariant?.price?.amount ? parseFloat(this.selectedVariant.price.amount) : 0;
      AnalyticsService.trackBeginCheckout([{ merchandiseId: variantId, quantity: 1, price: checkoutPrice }], checkoutPrice);

      const checkout = await window.shopifyClient.createCheckout([{ merchandiseId: variantId, quantity: 1 }]);
      if (checkout && checkout.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
      }
    } catch (err) {
      console.error('Quick buy failed:', err);
      const friendlyMsg = SecuritySanitizer.formatErrorMessage(err);
      if (typeof showToast === 'function') showToast('Error redirecting to checkout: ' + friendlyMsg);
    }
  },

  async checkout() {
    if (this.cartService.items.length === 0) {
      if (typeof showToast === 'function') showToast('Your cart is empty!');
      return;
    }

    if (typeof showToast === 'function') showToast('Connecting to secure Shopify checkout...');
    try {
      AnalyticsService.trackBeginCheckout(this.cartService.items, this.cartService.getSubtotal());

      // Passes full CartService instance to createCheckout with pre-order attributes
      const checkout = await window.shopifyClient.createCheckout(this.cartService);
      if (checkout && checkout.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const friendlyMsg = SecuritySanitizer.formatErrorMessage(err);
      if (typeof showToast === 'function') showToast('Checkout error: ' + friendlyMsg);
    }
  },

  updateCartUI() {
    if (!this.cartService) return;

    const totalQty = this.cartService.getTotalQuantity();
    const subtotal = this.cartService.getSubtotal();
    const cartItems = this.cartService.items;

    const badge = document.getElementById('cart-badge-count');
    if (badge) badge.textContent = totalQty;

    const mobileCount = document.getElementById('mobile-bar-cart-count');
    if (mobileCount) mobileCount.textContent = totalQty;

    const subtotalEl = document.getElementById('cart-subtotal-val');
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

    const itemsContainer = document.getElementById('cart-drawer-items');
    if (!itemsContainer) return;

    const splitNoticeBox = document.getElementById('cart-split-notice-box');
    if (splitNoticeBox) {
      splitNoticeBox.style.display = this.cartService.isSplitShippingRequired() ? 'flex' : 'none';
    }

    if (cartItems.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <span style="font-size: 48px;"><svg class="pika-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="assets/icons/pika-duo-solid.svg#purse-bag"></use></svg></span>
          <p style="font-weight: 700; margin-top: 10px;">Your cart is empty!</p>
          <p style="font-size: 15px; margin-top: 4px;">Explore our calendars, gifts, and apparel.</p>
        </div>
      `;
      return;
    }

    itemsContainer.innerHTML = cartItems.map(item => `
      <div class="cart-item">
        <img src="${item.img}" class="cart-item-img" alt="${item.title}">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
          <div class="cart-item-qty-ctrl">
            <button class="qty-btn" aria-label="Decrease quantity" onclick="ShopifyStore.changeCartQty('${item.variantId}', -1)"><svg class="pika-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="assets/icons/pika-duo-solid.svg#minus-square"></use></svg></button>
            <span style="font-weight: 700; font-size: 15px;">${item.qty}</span>
            <button class="qty-btn" aria-label="Increase quantity" onclick="ShopifyStore.changeCartQty('${item.variantId}', 1)"><svg class="pika-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="assets/icons/pika-duo-solid.svg#plus-square"></use></svg></button>
            <button class="cart-remove-btn" onclick="ShopifyStore.removeFromCart('${item.variantId}')">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  },

  changeCartQty(variantId, delta) {
    this.cartService.updateQuantity(variantId, delta);
    this.updateCartUI();
  },

  removeFromCart(variantId) {
    const item = this.cartService.items.find(i => i.variantId === variantId);
    if (item) AnalyticsService.trackRemoveFromCart(item);
    this.cartService.removeItem(variantId);
    this.updateCartUI();
    if (typeof showToast === 'function') showToast('Item removed from cart');
  }
};

// Expose on window in browser environment
if (typeof window !== 'undefined') {
  window.ShopifyStore = ShopifyStore;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => window.ShopifyStore.init());
    } else {
      window.ShopifyStore.init();
    }
  }
}

// CommonJS export for Node.js unit testing suite
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SecuritySanitizer,
    MemoryStorageAdapter,
    LocalStorageAdapter,
    CartService,
    ShopifyClient,
    AnalyticsService,
    ShopifyStore,
    SHOPIFY_CONFIG
  };
}
