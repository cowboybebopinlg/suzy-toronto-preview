const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

// Import the refactored SOLID modules from assets/shopify-storefront.js
const {
  SecuritySanitizer,
  MemoryStorageAdapter,
  LocalStorageAdapter,
  CartService,
  ShopifyClient,
  AnalyticsService,
  SHOPIFY_CONFIG
} = require('../assets/shopify-storefront.js');

describe('SecuritySanitizer (Single Responsibility: Input & Output Sanitization)', () => {
  test('sanitizeHtml removes executable script tags and contents', () => {
    const dirty = '<p>Lovely Mug</p><script>alert("XSS Attack!")</script><strong>Great Gift</strong>';
    const clean = SecuritySanitizer.sanitizeHtml(dirty);
    assert.ok(!clean.includes('<script>'), 'Must not contain opening script tag');
    assert.ok(!clean.includes('alert('), 'Must not contain script payload');
    assert.ok(clean.includes('<p>Lovely Mug</p>'), 'Must preserve safe p tag');
    assert.ok(clean.includes('<strong>Great Gift</strong>'), 'Must preserve safe strong tag');
  });

  test('sanitizeHtml removes inline event handlers', () => {
    const dirty = '<img src="mug.jpg" onerror="alert(1)" onload="fetch(\'/steal\')" alt="Mug">';
    const clean = SecuritySanitizer.sanitizeHtml(dirty);
    assert.ok(!clean.includes('onerror'), 'Must strip onerror handler');
    assert.ok(!clean.includes('onload'), 'Must strip onload handler');
    assert.ok(clean.includes('src="mug.jpg"'), 'Must keep image src');
    assert.ok(clean.includes('alt="Mug"'), 'Must keep alt attribute');
  });

  test('sanitizeHtml neutralizes javascript: URIs in links and embeds', () => {
    const dirty = '<a href="javascript:void(document.cookie)">Click Here</a>';
    const clean = SecuritySanitizer.sanitizeHtml(dirty);
    assert.ok(!clean.includes('javascript:'), 'Must neutralize javascript: pseudo-protocol');
  });

  test('sanitizeHtml handles empty, null, or undefined input safely', () => {
    assert.equal(SecuritySanitizer.sanitizeHtml(''), '');
    assert.equal(SecuritySanitizer.sanitizeHtml(null), '');
    assert.equal(SecuritySanitizer.sanitizeHtml(undefined), '');
  });

  test('sanitizeSearchQuery strips Lucene and GraphQL syntax breakers', () => {
    const dangerous = 'calendar" OR title:* AND (price:>10)';
    const clean = SecuritySanitizer.sanitizeSearchQuery(dangerous);
    assert.equal(clean, 'calendar OR title AND price 10');
    assert.ok(!clean.includes('"'), 'Must strip quotes');
    assert.ok(!clean.includes('*'), 'Must strip wildcards');
    assert.ok(!clean.includes(':'), 'Must strip colons');
    assert.ok(!clean.includes('('), 'Must strip parentheses');
  });

  test('sanitizeSearchQuery handles empty and non-string inputs', () => {
    assert.equal(SecuritySanitizer.sanitizeSearchQuery('   '), '');
    assert.equal(SecuritySanitizer.sanitizeSearchQuery(null), '');
    assert.equal(SecuritySanitizer.sanitizeSearchQuery(undefined), '');
  });

  test('formatErrorMessage returns user-friendly messages without leaking stacks', () => {
    const netErr = new Error('Failed to fetch from shopify endpoint');
    assert.equal(
      SecuritySanitizer.formatErrorMessage(netErr),
      'Network connection issue. Please check your internet connection.'
    );

    const gqlErr = new Error('GraphQL query syntax invalid');
    assert.equal(
      SecuritySanitizer.formatErrorMessage(gqlErr),
      'Unable to communicate with Shopify. Please refresh or try again in a few moments.'
    );

    const genericErr = new Error('Selected item is currently unavailable');
    assert.equal(
      SecuritySanitizer.formatErrorMessage(genericErr),
      'Selected item is currently unavailable'
    );
  });
});

describe('CartService (Single Responsibility: Cart Domain Model & Calculations)', () => {
  test('Initializes empty and loads from storage adapter', () => {
    const storage = new MemoryStorageAdapter();
    const cart = new CartService(storage, 'test_cart');
    assert.equal(cart.getTotalQuantity(), 0);
    assert.equal(cart.getSubtotal(), 0);
    assert.deepEqual(cart.items, []);
  });

  test('Adds items and increments quantity for duplicate variants', () => {
    const storage = new MemoryStorageAdapter();
    const cart = new CartService(storage, 'test_cart');

    cart.addItem({
      variantId: 'gid://shopify/ProductVariant/101',
      title: '2027 Wall Calendar',
      price: 24.95,
      isPreorder: true,
      qty: 1
    });

    assert.equal(cart.getTotalQuantity(), 1);
    assert.equal(cart.getSubtotal(), 24.95);

    // Add duplicate variant
    cart.addItem({
      variantId: 'gid://shopify/ProductVariant/101',
      title: '2027 Wall Calendar',
      price: 24.95,
      isPreorder: true,
      qty: 2
    });

    assert.equal(cart.getTotalQuantity(), 3);
    assert.equal(cart.getSubtotal(), 74.85);
    assert.equal(cart.items.length, 1, 'Duplicate variant must not create duplicate entry');
  });

  test('Throws error when adding item without variantId', () => {
    const storage = new MemoryStorageAdapter();
    const cart = new CartService(storage, 'test_cart');
    assert.throws(() => {
      cart.addItem({ title: 'Invalid Item', price: 10 });
    }, /variantId is required/);
  });

  test('Updates quantity and removes item when quantity reaches zero', () => {
    const storage = new MemoryStorageAdapter();
    const cart = new CartService(storage, 'test_cart');

    cart.addItem({
      variantId: 'gid://shopify/ProductVariant/201',
      title: 'Coffee Mug',
      price: 15.00,
      qty: 2
    });

    cart.updateQuantity('gid://shopify/ProductVariant/201', -1);
    assert.equal(cart.getTotalQuantity(), 1);

    cart.updateQuantity('gid://shopify/ProductVariant/201', -1);
    assert.equal(cart.getTotalQuantity(), 0);
    assert.equal(cart.items.length, 0, 'Item must be removed when quantity reaches zero');
  });

  test('Removes item explicitly by variantId', () => {
    const storage = new MemoryStorageAdapter();
    const cart = new CartService(storage, 'test_cart');

    cart.addItem({ variantId: 'gid://shopify/ProductVariant/301', title: 'Item 1', price: 10, qty: 1 });
    cart.addItem({ variantId: 'gid://shopify/ProductVariant/302', title: 'Item 2', price: 20, qty: 1 });
    assert.equal(cart.items.length, 2);

    cart.removeItem('gid://shopify/ProductVariant/301');
    assert.equal(cart.items.length, 1);
    assert.equal(cart.items[0].variantId, 'gid://shopify/ProductVariant/302');
  });

  test('Clears all items and syncs storage', () => {
    const storage = new MemoryStorageAdapter();
    const cart = new CartService(storage, 'test_cart');
    cart.addItem({ variantId: 'gid://shopify/ProductVariant/401', title: 'Item', price: 10, qty: 1 });
    assert.equal(cart.items.length, 1);

    cart.clear();
    assert.equal(cart.items.length, 0);
    assert.equal(storage.getItem('test_cart'), '[]');
  });

  test('Detects pre-order vs in-stock items and flags split-shipping requirement', () => {
    const storage = new MemoryStorageAdapter();
    const cart = new CartService(storage, 'test_cart');

    // Case 1: In-stock only
    cart.addItem({ variantId: 'gid://shopify/ProductVariant/501', title: 'In-stock Mug', price: 15, isPreorder: false });
    assert.equal(cart.hasPreorder(), false);
    assert.equal(cart.hasInStock(), true);
    assert.equal(cart.isSplitShippingRequired(), false);

    // Case 2: In-stock + Pre-order
    cart.addItem({ variantId: 'gid://shopify/ProductVariant/502', title: '2027 Calendar Pre-Order', price: 25, isPreorder: true });
    assert.equal(cart.hasPreorder(), true);
    assert.equal(cart.hasInStock(), true);
    assert.equal(cart.isSplitShippingRequired(), true, 'Must require split shipping for mixed carts');

    // Case 3: Pre-order only
    cart.removeItem('gid://shopify/ProductVariant/501');
    assert.equal(cart.hasPreorder(), true);
    assert.equal(cart.hasInStock(), false);
    assert.equal(cart.isSplitShippingRequired(), false, 'Pre-order only does not need split shipping');
  });

  test('Generates correct Shopify checkout payload with split shipping attributes and line attributes', () => {
    const storage = new MemoryStorageAdapter();
    const cart = new CartService(storage, 'test_cart');

    cart.addItem({
      variantId: 'gid://shopify/ProductVariant/instock1',
      title: 'Friendship Card',
      price: 4.95,
      isPreorder: false,
      qty: 2
    });

    cart.addItem({
      variantId: 'gid://shopify/ProductVariant/preorder1',
      title: '2027 Calendar',
      price: 24.95,
      isPreorder: true,
      qty: 1
    });

    const payload = cart.getCheckoutPayload();

    assert.equal(payload.lines.length, 2);
    // Line 1: in-stock
    assert.equal(payload.lines[0].merchandiseId, 'gid://shopify/ProductVariant/instock1');
    assert.equal(payload.lines[0].quantity, 2);
    assert.equal(payload.lines[0].attributes, undefined);

    // Line 2: pre-order
    assert.equal(payload.lines[1].merchandiseId, 'gid://shopify/ProductVariant/preorder1');
    assert.equal(payload.lines[1].quantity, 1);
    assert.deepEqual(payload.lines[1].attributes, [
      { key: 'FulfillmentType', value: 'Pre-Order (Ships October)' }
    ]);

    // Cart-level attributes
    assert.ok(Array.isArray(payload.attributes));
    const orderTypeAttr = payload.attributes.find(a => a.key === 'OrderType');
    assert.ok(orderTypeAttr, 'OrderType attribute must exist');
    assert.equal(orderTypeAttr.value, 'Split-Shipping');

    // Cart note
    assert.ok(payload.note && payload.note.includes('pre-order'));
  });
});

describe('ShopifyClient (Single Responsibility: Shopify Storefront API Integration)', () => {
  test('Correctly maps lines when given QuickBuy payload (merchandiseId resolution bug fix)', async () => {
    let capturedBody = null;
    const mockFetch = async (url, options) => {
      capturedBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          data: {
            cartCreate: {
              cart: {
                id: 'gid://shopify/Cart/test123',
                checkoutUrl: 'https://suzy-toronto-fpkxqg4y.myshopify.com/cart/c/test123',
                totalQuantity: 1,
                cost: { totalAmount: { amount: '24.95', currencyCode: 'USD' } }
              },
              userErrors: []
            }
          }
        })
      };
    };

    const client = new ShopifyClient(SHOPIFY_CONFIG, mockFetch);

    // QuickBuy passes an item with merchandiseId:
    const quickBuyInput = [{ merchandiseId: 'gid://shopify/ProductVariant/quick1', quantity: 1 }];
    const cart = await client.createCheckout(quickBuyInput);

    assert.equal(cart.id, 'gid://shopify/Cart/test123');
    assert.ok(capturedBody, 'Must send request body');
    const sentLines = capturedBody.variables.input.lines;
    assert.equal(sentLines.length, 1);
    assert.equal(
      sentLines[0].merchandiseId,
      'gid://shopify/ProductVariant/quick1',
      'Must map merchandiseId correctly without resolving to undefined'
    );
  });

  test('createCheckout supports CartService instance input with attributes', async () => {
    let capturedBody = null;
    const mockFetch = async (url, options) => {
      capturedBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          data: {
            cartCreate: {
              cart: {
                id: 'gid://shopify/Cart/cart456',
                checkoutUrl: 'https://checkout.shopify.com/456',
                totalQuantity: 2,
                cost: { totalAmount: { amount: '35.00', currencyCode: 'USD' } }
              },
              userErrors: []
            }
          }
        })
      };
    };

    const client = new ShopifyClient(SHOPIFY_CONFIG, mockFetch);
    const storage = new MemoryStorageAdapter();
    const cartService = new CartService(storage, 'test_key');
    cartService.addItem({ variantId: 'gid://shopify/ProductVariant/v1', title: 'Item 1', price: 10, qty: 1 });
    cartService.addItem({ variantId: 'gid://shopify/ProductVariant/v2', title: '2027 Calendar', price: 25, isPreorder: true, qty: 1 });

    const result = await client.createCheckout(cartService);
    assert.equal(result.id, 'gid://shopify/Cart/cart456');

    const input = capturedBody.variables.input;
    assert.equal(input.lines.length, 2);
    assert.equal(input.attributes[0].key, 'OrderType');
    assert.equal(input.attributes[0].value, 'Split-Shipping');
  });

  test('createCheckout throws error when Shopify returns userErrors', async () => {
    const mockFetch = async () => ({
      ok: true,
      json: async () => ({
        data: {
          cartCreate: {
            cart: null,
            userErrors: [{ field: ['lines', '0', 'merchandiseId'], message: 'The merchandise variant is out of stock' }]
          }
        }
      })
    });

    const client = new ShopifyClient(SHOPIFY_CONFIG, mockFetch);
    await assert.rejects(
      async () => {
        await client.createCheckout([{ merchandiseId: 'gid://shopify/ProductVariant/soldout', quantity: 1 }]);
      },
      /The merchandise variant is out of stock/
    );
  });

  test('createCheckout throws error on HTTP failure', async () => {
    const mockFetch = async () => ({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable'
    });

    const client = new ShopifyClient(SHOPIFY_CONFIG, mockFetch);
    await assert.rejects(
      async () => {
        await client.createCheckout([{ merchandiseId: 'gid://1', quantity: 1 }]);
      },
      /Shopify API error: 503 Service Unavailable/
    );
  });
});

describe('Variant Availability & Sold Out UI State Logic', () => {
  test('Correctly determines button state and text based on availableForSale', () => {
    const availableVariant = {
      id: 'gid://shopify/ProductVariant/avail',
      title: 'Large Mug',
      price: { amount: '18.00' },
      availableForSale: true
    };

    const soldOutVariant = {
      id: 'gid://shopify/ProductVariant/sold',
      title: 'Small Mug',
      price: { amount: '14.00' },
      availableForSale: false
    };

    const getButtonState = (variant) => {
      if (!variant.availableForSale) {
        return { disabled: true, text: 'Sold Out' };
      }
      return { disabled: false, text: `Add to Cart — $${parseFloat(variant.price.amount).toFixed(2)}` };
    };

    const availState = getButtonState(availableVariant);
    assert.equal(availState.disabled, false);
    assert.equal(availState.text, 'Add to Cart — $18.00');

    const soldState = getButtonState(soldOutVariant);
    assert.equal(soldState.disabled, true);
    assert.equal(soldState.text, 'Sold Out');
  });
});

describe('AnalyticsService (SRP: Marketing & E-Commerce Instrumentation)', () => {
  let originalWindow;

  test.beforeEach(() => {
    originalWindow = global.window;
    // Mock minimal browser environment with dataLayer and EventTarget
    global.window = {
      dataLayer: [],
      dispatchEvent: (event) => {
        if (global.window._listener) global.window._listener(event);
      }
    };
  });

  test.afterEach(() => {
    global.window = originalWindow;
  });

  test('trackViewItem pushes standard GA4 view_item event', () => {
    const product = { title: '2027 Calendar', productType: 'Calendars & Planners' };
    const variant = { id: 'gid://shopify/ProductVariant/v1', title: 'Wall Calendar', price: { amount: '24.95', currencyCode: 'USD' } };

    AnalyticsService.trackViewItem(product, variant);

    assert.equal(global.window.dataLayer.length, 1);
    const event = global.window.dataLayer[0];
    assert.equal(event.event, 'view_item');
    assert.equal(event.ecommerce.currency, 'USD');
    assert.equal(event.ecommerce.value, 24.95);
    assert.equal(event.ecommerce.items[0].item_name, '2027 Calendar');
    assert.equal(event.ecommerce.items[0].item_variant, 'Wall Calendar');
  });

  test('trackAddToCart pushes standard GA4 add_to_cart event', () => {
    const item = { variantId: 'gid://shopify/ProductVariant/v1', title: 'Friendship Card', price: 4.95, qty: 2 };
    AnalyticsService.trackAddToCart(item);

    assert.equal(global.window.dataLayer.length, 1);
    const event = global.window.dataLayer[0];
    assert.equal(event.event, 'add_to_cart');
    assert.equal(event.ecommerce.value, 9.90);
    assert.equal(event.ecommerce.items[0].quantity, 2);
  });

  test('trackRemoveFromCart pushes remove_from_cart event', () => {
    const item = { variantId: 'gid://shopify/ProductVariant/v2', title: 'Mug', price: 15.00, qty: 1 };
    AnalyticsService.trackRemoveFromCart(item);

    assert.equal(global.window.dataLayer.length, 1);
    const event = global.window.dataLayer[0];
    assert.equal(event.event, 'remove_from_cart');
    assert.equal(event.ecommerce.value, 15.00);
  });

  test('trackBeginCheckout formats items and total value for GA4', () => {
    const items = [
      { variantId: 'gid://shopify/ProductVariant/1', title: 'Item 1', price: 10, qty: 1 },
      { variantId: 'gid://shopify/ProductVariant/2', title: 'Item 2', price: 20, qty: 2 }
    ];
    AnalyticsService.trackBeginCheckout(items, 50.00);

    assert.equal(global.window.dataLayer.length, 1);
    const event = global.window.dataLayer[0];
    assert.equal(event.event, 'begin_checkout');
    assert.equal(event.ecommerce.value, 50.00);
    assert.equal(event.ecommerce.items.length, 2);
  });

  test('trackSearch logs search_term and result_count', () => {
    AnalyticsService.trackSearch('Calendar', 12);

    assert.equal(global.window.dataLayer.length, 1);
    const event = global.window.dataLayer[0];
    assert.equal(event.event, 'search');
    assert.equal(event.search_term, 'Calendar');
    assert.equal(event.result_count, 12);
  });

  test('Dispatches decoupled custom DOM event (suzy:analytics) for third-party tags', () => {
    let capturedDetail = null;
    global.window._listener = (evt) => {
      capturedDetail = evt.detail;
    };

    AnalyticsService.trackAddToCart({ variantId: 'v123', title: 'Tingleboots Card', price: 5, qty: 1 });

    assert.ok(capturedDetail, 'Must dispatch custom event');
    assert.equal(capturedDetail.event, 'add_to_cart');
    assert.equal(capturedDetail.ecommerce.items[0].item_name, 'Tingleboots Card');
  });
});

