const fs = require('fs');

const realUrls = JSON.parse(fs.readFileSync('real_image_urls.json', 'utf8'));

// List of target product keywords/SKUs
const targets = [
  { sku: 'CAL27', keyword: 'LG27CAL', default: 'https://suzytoronto.com/wp-content/uploads/2026/03/PO-LG27CAL_OPT.jpg' },
  { sku: 'SM72', keyword: 'LG27_OPT2', default: 'https://suzytoronto.com/wp-content/uploads/2026/04/LG27_OPT2.jpg' },
  { sku: 'NB959', keyword: '959', default: 'https://suzytoronto.com/wp-content/uploads/2019/10/HC959_OPT.jpg' },
  { sku: 'BB867', keyword: '867', default: '' },
  { sku: 'SCT748', keyword: '748', default: '' },
  { sku: 'PRT100', keyword: '100', default: '' },
  { sku: 'LS524', keyword: '524', default: '' },
  { sku: 'CC867', keyword: '867', default: '' },
  { sku: 'MMP609', keyword: '609', default: '' },
  { sku: 'BMK229', keyword: '229', default: 'https://suzytoronto.com/wp-content/uploads/2023/04/BMK229_OPT3.png' },
  { sku: 'TAG524', keyword: '524', default: '' },
  { sku: 'KC609', keyword: '609', default: '' },
  { sku: 'NC412', keyword: '412', default: 'https://suzytoronto.com/wp-content/uploads/2019/10/NC412_OPT.jpg' }
];

const found = {};

realUrls.forEach(url => {
  targets.forEach(t => {
    if (url.includes(t.keyword) || (t.sku && url.toLowerCase().includes(t.sku.toLowerCase()))) {
      if (!found[t.sku]) found[t.sku] = [];
      found[t.sku].push(url);
    }
  });
});

console.log('Found URLs by target SKU:');
for (const [sku, urls] of Object.entries(found)) {
  const fullSize = urls.find(u => !u.match(/-\d+x\d+\./));
  console.log(`${sku} -> ${fullSize || urls[0]}`);
}
