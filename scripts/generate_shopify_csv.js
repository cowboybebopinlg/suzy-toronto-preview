const fs = require('fs');
const path = require('path');

// Helper to decode HTML entities
function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const headers = [
  "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
  "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
  "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty",
  "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price",
  "Variant Requires Shipping", "Variant Taxable", "Variant Barcode", "Image Src", "Image Position",
  "Image Alt Text", "Gift Card", "SEO Title", "SEO Description",
  "Google Shopping / Google Product Category", "Google Shopping / Gender", "Google Shopping / Age Group",
  "Google Shopping / MPN", "Google Shopping / Condition", "Google Shopping / Custom Label 0",
  "Variant Image", "Variant Weight Unit", "Cost per item", "Status"
];

function makeRow(obj) {
  return headers.map(h => escapeCSV(obj[h] !== undefined ? obj[h] : '')).join(',');
}

function determineProductType(categories, title = '', description = '') {
  const combined = (title + ' ' + description).toLowerCase();

  if (categories && categories.length > 0) {
    const catNames = categories.map(c => c.name.toLowerCase());
    
    if (catNames.some(c => c.includes('greeting card'))) return 'Greeting Cards';
    if (catNames.some(c => c.includes('coaster'))) return 'Drink Coasters';
    if (catNames.some(c => c.includes('mouse pad') || c.includes('snack mat'))) return 'Mouse Pads & Mats';
    if (catNames.some(c => c.includes('t-shirt') || c.includes('sweatshirt'))) return 'Apparel';
    if (catNames.some(c => c.includes('tumbler') || c.includes('can cooler'))) return 'Tumblers & Drinkware';
    if (catNames.some(c => c.includes('key chain'))) return 'Key Chains';
    if (catNames.some(c => c.includes('magnet'))) return 'Magnets';
    if (catNames.some(c => c.includes('bag tag') || c.includes('luggage tag'))) return 'Luggage Tags';
    if (catNames.some(c => c.includes('bookmark'))) return 'Bookmarks';
    if (catNames.some(c => c.includes('note card'))) return 'Note Cards';
    if (catNames.some(c => c.includes('memo pad') || c.includes('sticky tingle'))) return 'Stationery & Notepads';
    if (catNames.some(c => c.includes('backpack') || c.includes('tote'))) return 'Bags & Totes';
    if (catNames.some(c => c.includes('calendar') || c.includes('planner'))) return 'Calendars & Planners';
    if (catNames.some(c => c.includes('book'))) return 'Books';
    if (catNames.some(c => c.includes('canvas'))) return 'Canvas Wall Art';
    if (catNames.some(c => c.includes('print'))) return 'Art Prints';
    if (catNames.some(c => c.includes('sticker'))) return 'Stickers';
  }

  // Fallback to title and description keywords
  if (combined.includes('vneck') || combined.includes('t-shirt') || combined.includes('tee') || combined.includes('sweatshirt') || combined.includes('sparkle-ls')) return 'Apparel';
  if (combined.includes('tumbler') || combined.includes('can cooler') || combined.includes('mug')) return 'Tumblers & Drinkware';
  if (combined.includes('calendar') || combined.includes('planner')) return 'Calendars & Planners';
  if (combined.includes('coaster')) return 'Drink Coasters';
  if (combined.includes('mouse pad') || combined.includes('snack mat')) return 'Mouse Pads & Mats';
  if (combined.includes('notebook') || combined.includes('notepad') || combined.includes('pass-along') || combined.includes('card')) return 'Stationery & Cards';
  if (combined.includes('canvas') || combined.includes('print')) return 'Art Prints';

  if (categories && categories.length > 0) {
    return categories[0].name;
  }

  return 'Gifts & Novelties';
}

function main() {
  const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products_raw.json'), 'utf8'));
  const variations = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/variations.json'), 'utf8'));

  const rows = [headers.join(',')];
  let totalVariantsExported = 0;
  let totalImagesExported = 0;

  for (const p of products) {
    const handle = p.slug;
    const title = decodeHtml(p.name);
    const bodyHtml = decodeHtml(p.description || p.short_description || '').replace(/[\r\n]+/g, ' ').trim();
    
    // Vendor
    const isKukana = (p.categories || []).some(c => c.slug.includes('kukana') || c.name.toLowerCase().includes('kukana'));
    const vendor = isKukana ? 'Kukana' : 'Suzy Toronto';

    // Type
    const type = determineProductType(p.categories, title, bodyHtml);

    // Tags
    const tagsSet = new Set();
    tagsSet.add(vendor);
    if (p.categories) {
      p.categories.forEach(c => {
        const decoded = decodeHtml(c.name).replace(/,/g, '');
        if (decoded) tagsSet.add(decoded);
      });
    }
    if (p.tags) {
      p.tags.forEach(t => {
        const decoded = decodeHtml(t.name).replace(/,/g, '');
        if (decoded) tagsSet.add(decoded);
      });
    }
    const tags = Array.from(tagsSet).join(', ');

    // Pricing
    let defaultPrice = '0.00';
    let defaultRegularPrice = '';
    if (p.prices) {
      defaultPrice = (p.prices.price / 100).toFixed(2);
      if (p.prices.regular_price && p.prices.regular_price !== p.prices.price) {
        defaultRegularPrice = (p.prices.regular_price / 100).toFixed(2);
      }
    }

    const images = p.images || [];
    const isVariable = p.type === 'variable' && p.variations && p.variations.length > 0;

    // Build variant entries
    let variantEntries = [];

    if (!isVariable) {
      variantEntries.push({
        option1Name: 'Title',
        option1Value: 'Default Title',
        option2Name: '',
        option2Value: '',
        option3Name: '',
        option3Value: '',
        sku: p.sku || '',
        price: defaultPrice,
        comparePrice: defaultRegularPrice,
        inStock: p.is_in_stock
      });
    } else {
      // Determine Option Names from p.attributes
      const optNames = (p.attributes || []).filter(a => a.has_variations).map(a => decodeHtml(a.name));
      const opt1Name = optNames[0] || 'Size';
      const opt2Name = optNames[1] || '';
      const opt3Name = optNames[2] || '';

      p.variations.forEach(vSummary => {
        const vDetail = variations[vSummary.id];
        let opt1Val = '';
        let opt2Val = '';
        let opt3Val = '';

        if (vSummary.attributes && vSummary.attributes.length > 0) {
          opt1Val = decodeHtml(vSummary.attributes[0]?.value || '');
          opt2Val = decodeHtml(vSummary.attributes[1]?.value || '');
          opt3Val = decodeHtml(vSummary.attributes[2]?.value || '');
        } else if (vDetail && vDetail.variation_desc) {
          // Parse "Number of Girls: 3 – girls"
          const parts = vDetail.variation_desc.split(',');
          opt1Val = decodeHtml(parts[0]?.split(':')[1] || parts[0] || '').trim();
          if (parts[1]) opt2Val = decodeHtml(parts[1]?.split(':')[1] || parts[1] || '').trim();
          if (parts[2]) opt3Val = decodeHtml(parts[2]?.split(':')[1] || parts[2] || '').trim();
        }

        variantEntries.push({
          option1Name: opt1Name,
          option1Value: opt1Val || 'Default',
          option2Name: opt2Name,
          option2Value: opt2Val,
          option3Name: opt3Name,
          option3Value: opt3Val,
          sku: vDetail?.sku || p.sku || '',
          price: vDetail?.price || defaultPrice,
          comparePrice: (vDetail?.regular_price && vDetail?.regular_price !== vDetail?.price) ? vDetail.regular_price : defaultRegularPrice,
          inStock: vDetail ? vDetail.is_in_stock : p.is_in_stock
        });
      });
    }

    // Merge variants and images into rows
    const numRows = Math.max(variantEntries.length, images.length);

    for (let i = 0; i < numRows; i++) {
      const v = variantEntries[i]; // may be undefined if more images than variants
      const img = images[i];      // may be undefined if more variants than images

      const isFirstRow = (i === 0);

      const rowData = {
        "Handle": handle,
        "Title": isFirstRow ? title : '',
        "Body (HTML)": isFirstRow ? bodyHtml : '',
        "Vendor": isFirstRow ? vendor : '',
        "Type": isFirstRow ? type : '',
        "Tags": isFirstRow ? tags : '',
        "Published": isFirstRow ? 'TRUE' : '',

        // Variant fields (only present if there is a variant entry for this row)
        "Option1 Name": v ? v.option1Name : '',
        "Option1 Value": v ? v.option1Value : '',
        "Option2 Name": v ? v.option2Name : '',
        "Option2 Value": v ? v.option2Value : '',
        "Option3 Name": v ? v.option3Name : '',
        "Option3 Value": v ? v.option3Value : '',
        "Variant SKU": v ? v.sku : '',
        "Variant Grams": v ? (p.weight ? Math.round(parseFloat(p.weight) * 453.592) : '') : '',
        "Variant Inventory Tracker": v ? 'shopify' : '',
        "Variant Inventory Qty": v ? (v.inStock ? '100' : '0') : '',
        "Variant Inventory Policy": v ? 'continue' : '',
        "Variant Fulfillment Service": v ? 'manual' : '',
        "Variant Price": v ? v.price : '',
        "Variant Compare At Price": v ? v.comparePrice : '',
        "Variant Requires Shipping": v ? 'TRUE' : '',
        "Variant Taxable": v ? 'TRUE' : '',
        "Variant Barcode": '',

        // Image fields
        "Image Src": img ? img.src : '',
        "Image Position": img ? (i + 1) : '',
        "Image Alt Text": img ? (img.alt || title) : '',

        "Gift Card": isFirstRow ? 'FALSE' : '',
        "SEO Title": isFirstRow ? `${title} | ${vendor}` : '',
        "SEO Description": isFirstRow ? `${title} from ${vendor}. Free shipping on qualifying orders.` : '',
        "Variant Image": '',
        "Variant Weight Unit": v ? 'lb' : '',
        "Cost per item": '',
        "Status": 'active'
      };

      rows.push(makeRow(rowData));
      if (v) totalVariantsExported++;
      if (img) totalImagesExported++;
    }
  }

  const outPath = path.join(__dirname, '../suzy_toronto_shopify_import_full.csv');
  fs.writeFileSync(outPath, rows.join('\n'), 'utf8');

  console.log(`\n=== SHOPIFY IMPORT CSV GENERATION COMPLETE ===`);
  console.log(`- Total CSV Rows: ${rows.length - 1} (+1 header)`);
  console.log(`- Total Products Processed: ${products.length}`);
  console.log(`- Total Variants: ${totalVariantsExported}`);
  console.log(`- Total Images Mapped: ${totalImagesExported}`);
  console.log(`- Output File: ${outPath} (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

main();
