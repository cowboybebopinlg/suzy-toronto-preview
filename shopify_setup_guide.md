# Suzy Toronto Modernization — Shopify OS 2.0 Architecture & Setup Guide

This guide details the step-by-step setup, accessibility parameters, restructured navigation, and checkout configurations for migrating **Suzy Toronto** from WooCommerce to Shopify OS 2.0.

---

## 1. Recommended Free OS 2.0 Theme: **Sense** (or **Dawn**)

### **Primary Recommendation: Sense (Free OS 2.0 Theme)**
- **Why Sense is the ideal choice for Suzy Toronto:**
  1. **Built for Visual Storytelling:** Features soft card gradients, high-impact banner sections, and curved image cards that complement Suzy Toronto's bold, colorful, hand-drawn art style.
  2. **High-Legibility Layouts:** Native padding and typography options make it simple to enforce 18px+ body text and prominent high-contrast buttons out-of-the-box.
  3. **Modular OS 2.0 Drag-and-Drop Sections:** Product pages allow adding accordion tabs for story text, customer review badges, and pre-order notices without writing custom code.
  4. **Zero-Maintenance Architecture:** Maintained directly by Shopify, ensuring automatic compatibility with new Shopify Payments features, fast page loads (<1.2s), and security compliance.

*Alternative Option: **Dawn** — Ultra-clean baseline theme if a more minimalist canvas is preferred.*

---

## 2. Design Tokens for 45+ Accessibility (WCAG 2.1 AA Compliant)

Customers aged 45+ benefit significantly from enhanced typography scale, high contrast ratios, generous line height, and large interactive tap targets.

### **Typography Configuration**
- **Primary Body Font:** `Source Sans 3` (or `Open Sans`)
  - **Base Size:** `18px` (1.125rem)
  - **Line Height:** `1.5` (27px)
  - **Weight:** Regular (400) / Semi-Bold (600) for key descriptors
- **Headings & Accent Font:** `Outfit` (or `Quicksand`)
  - **H1 Size:** `36px` - `42px` (Bold 700)
  - **H2 Size:** `28px` - `32px` (Semi-Bold 600)
  - **H3 Size:** `22px` - `24px` (Medium 500)
  - **Letter Spacing:** `0.02em` for enhanced legibility

### **Brand Color Palette & Contrast Matrix (Matching Suzy Toronto Live Brand)**

| Token Name | HEX Code | Usage | Contrast vs White (#FFFFFF) | WCAG Compliance |
| :--- | :--- | :--- | :--- | :--- |
| **Signature Brand Fuchsia / Magenta** | `#C2185B` | Primary Action Buttons, Badges, CTAs | **5.4:1** | Pass (WCAG AA) |
| **Deep Royal Purple** | `#5B2C6F` | Section Headings, Titles, Nav Focus | **9.4:1** | Pass (WCAG AAA) |
| **Deep Teal / Evergreen** | `#0E6655` | Category Tags, Secondary Accents | **7.1:1** | Pass (WCAG AAA) |
| **Pre-Order Warm Amber** | `#B45309` | Pre-Order Badges, Shipping Notices | **5.2:1** | Pass (WCAG AA) |
| **Deep Charcoal Text** | `#1C2833` | All Body Copy & Product Descriptions | **14.8:1** | Pass (WCAG AAA) |
| **Warm Ivory Background** | `#FAF8F5` | Product Cards, Content Containers | Contrast vs `#1C2833` = **14.1:1** | Pass (WCAG AAA) |
| **Header / Site Foundation** | `#FFFFFF` | Store Background, Clean Header Nav | — | Clean Canvas |

> [!NOTE]
> **Brand Authenticity Note:** Suzy Toronto's signature brand presence uses a cheerful, high-energy palette anchored by her authentic scripted logo (`cropped-STS_LOGO-website-header2.jpg`), vivid fuchsia/magenta, and royal purple set against a clean white and warm ivory canvas. Avoiding dark/heavy backgrounds preserves immediate brand recognition while delivering modern WCAG AA 4.5:1+ readability for the 45+ audience.

### **Interactive Touch & Tap Targets**
- **Buttons & Swatches:** Minimum dimension **`48px × 48px`** (padding: `14px 28px`).
- **Form Inputs & Select Dropdowns:** Height **`52px`**, font size **`18px`** (prevents iOS auto-zoom on mobile).
- **Icon Buttons (Cart, Search, Menu):** Tappable area padded to minimum **`48px`** touch box.

---

## 3. Restructured 4-Tier Navigation Architecture

The live WooCommerce site presents over 25 fragmented category links in a crowded top bar. The modernized Shopify menu consolidates these into 4 intuitive mega-menu tiers:

```
[Suzy Toronto Navigation Header]
├── 1. Shop by Product
│   ├── 2027 Planners & Calendars (PRE-ORDER)
│   ├── 8x10 Matted Art Prints
│   ├── Buggy Buddies
│   ├── Drinkware & Can Coolers
│   ├── Notebooks & Journals
│   ├── Post-It Notes & Stationery
│   ├── Magnetic Memo Pads & Bookmarks
│   └── Greeting Cards & Note Cards
│
├── 2. Shop by Recipient & Theme
│   ├── Wild Women & Goddesses
│   ├── Kindred Spirits & Sisterhood
│   ├── Faith, Prayer & Encouragement
│   ├── Work, Office & Daily Humor
│   └── Stocking Stuffers & Gifts Under $10
│
├── 3. Our Family Story (Dedicated Full-Page Deep Dive: /pages/our-story)
│   ├── Suzy's Journey & Philosophy (New Smyrna Beach Studio)
│   ├── The Family & Studio Team (Big Al, Chase, Rob Thimm, Launi)
│   ├── Studio Process & Archival Craftsmanship
│   └── Suzy's 100% "Hug" Guarantee
│
└── 4. Help & Order Status
    ├── Track My Order
    ├── Pre-Order Shipping Info (2027 Calendars)
    ├── Returns & Suzy's Hug Guarantee
    └── Contact Us
```

---

## 4. Split Fulfillment & Modern Payment Gateway Configuration

### **A. Accelerated Payment Gateways Setup**
1. In Shopify Admin, navigate to **Settings > Payments**.
2. Under **Shopify Payments**, click **Complete Setup** or **Manage**.
3. Enable the following express checkout options:
   - ✅ **Shop Pay** (Enables 1-click checkout for returning buyers)
   - ✅ **Apple Pay**
   - ✅ **Google Pay**
4. Under **Additional Payment Methods**, activate **PayPal Complete Payments** (allows PayPal, Venmo, and Pay in 4).

### **B. Split Shipping Configuration for Pre-Orders (2027 Calendars)**
When a customer purchases an in-stock item (e.g. *Be Kind Buggy Buddy*) alongside a pre-order item (e.g. *2027 Calendar*), Shopify can automatically split shipping at checkout:

1. **Configure Pre-Order Product Attributes:**
   - Set `Variant Inventory Policy` = `continue` (Allow customers to purchase when out of stock).
   - Add Tag: `pre-order` and `ships-october`.
2. **Enable Split Shipping at Checkout (Shopify Admin):**
   - Go to **Settings > Shipping and delivery**.
   - Scroll to **Shipment splitting**.
   - Click **Manage** and select **Split shipments at checkout**.
   - Choose default behavior: *Split shipments as items become available* or *Provide option at checkout*.
3. **Customer Messaging at Checkout:**
   - Add clear text banner on calendar product pages and cart summary:
     > *"Items in your cart with different release dates will ship separately as they arrive. In-stock items ship within 24 hours!"*

---

## 5. Summary of Zero-Maintenance Benefits
- **No Plugin Conflicts:** Eliminates WooCommerce plugin updates, database bloat, and broken Elementor layouts.
- **Fast Global CDN:** Assets served via Shopify's enterprise CDN with automatic image format optimization (WebP/AVIF).
- **1-Tap Checkout:** Up to 50% higher mobile conversion rate via Shop Pay and Apple Pay.
