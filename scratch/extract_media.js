const fs = require('fs');

const html = fs.readFileSync('shop_page.html', 'utf8');

// Find all media= parameters in Pinterest links or img data-src or src
const matches = html.match(/media=([^&"']+)/gi) || [];
const mediaUrls = matches.map(m => decodeURIComponent(m.replace(/^media=/i, '')));

const imgMatches = html.match(/https:\/\/suzytoronto\.com\/wp-content\/uploads\/[0-9]{4}\/[0-9]{2}\/[^"'\s\>\)]+\.(jpg|jpeg|png|webp)/gi) || [];

const allUrls = [...new Set([...mediaUrls, ...imgMatches])];

console.log(`Found ${allUrls.length} actual image URLs on shop page!`);
fs.writeFileSync('real_image_urls.json', JSON.stringify(allUrls, null, 2));

// Let's also group them by product keyword/acronym
const skuMap = {};
const skus = ['LG27CAL', 'LG26', 'BMK229', 'C914', 'BMK524', 'PLN72', 'PLN2026', 'NC412', 'HC959', 'BB867', 'SCT748', 'PRT100', 'LS524', 'CC867', 'MMP609', 'TAG524', 'KC609', 'NB959'];

skus.forEach(s => {
  const matchesForSku = allUrls.filter(u => new RegExp(s, 'i').test(u));
  if (matchesForSku.length) {
    skuMap[s] = matchesForSku;
  }
});

console.log('SKU Image Mapping:');
console.log(JSON.stringify(skuMap, null, 2));
fs.writeFileSync('sku_image_map.json', JSON.stringify(skuMap, null, 2));
