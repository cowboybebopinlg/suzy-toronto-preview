const fs = require('fs');
const path = require('path');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function main() {
  const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products_raw.json'), 'utf8'));
  const varIds = [];
  products.forEach(p => {
    if (p.variations) {
      p.variations.forEach(v => varIds.push(v.id));
    }
  });

  console.log(`Found ${varIds.length} variation IDs across ${products.filter(p => p.type === 'variable').length} variable products.`);

  const variationsMap = {};
  const batchSize = 15;
  const total = varIds.length;

  for (let i = 0; i < total; i += batchSize) {
    const batch = varIds.slice(i, i + batchSize);
    const promises = batch.map(async (id) => {
      try {
        const res = await fetch(`https://suzytoronto.com/wp-json/wc/store/v1/products/${id}`, { headers: HEADERS });
        if (res.ok) {
          const data = await res.json();
          variationsMap[id] = {
            id: data.id,
            parent: data.parent,
            sku: data.sku,
            price: data.prices ? (data.prices.price / 100).toFixed(2) : '',
            regular_price: data.prices ? (data.prices.regular_price / 100).toFixed(2) : '',
            sale_price: data.prices ? (data.prices.sale_price / 100).toFixed(2) : '',
            is_in_stock: data.is_in_stock,
            attributes: data.attributes || [],
            variation_desc: data.variation || ''
          };
        } else {
          console.warn(`Failed to fetch variation ${id}: HTTP ${res.status}`);
        }
      } catch (err) {
        console.warn(`Error on variation ${id}:`, err.message);
      }
    });

    await Promise.all(promises);
    process.stdout.write(`Fetched ${Math.min(i + batchSize, total)} / ${total} variations...\r`);
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nSuccessfully fetched ${Object.keys(variationsMap).length} variations.`);
  fs.writeFileSync(path.join(__dirname, '../data/variations.json'), JSON.stringify(variationsMap, null, 2));
  console.log('Saved to data/variations.json');
}

main().catch(console.error);
