const fs = require('fs');
const https = require('https');

const rawHtml = fs.readFileSync('shop_page.html', 'utf8');

// Search for product page links in shop_page.html
const productLinks = rawHtml.match(/https:\/\/suzytoronto\.com\/product\/[^"'\s\>]+/gi) || [];
const uniqueProductLinks = [...new Set(productLinks)].filter(l => !l.includes('page/') && !l.includes('cart') && !l.includes('checkout'));

console.log(`Found ${uniqueProductLinks.length} product links on shop page.`);

function fetchProductPageImg(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const pinMatch = data.match(/media=(https%3A%2F%2Fsuzytoronto\.com%2Fwp-content%2Fuploads%2F[^&"']+)/i);
        const ogMatch = data.match(/property="og:image"\s+content="([^"]+)"/i) || data.match(/content="([^"]+)"\s+property="og:image"/i);
        let img = '';
        if (ogMatch) img = ogMatch[1];
        else if (pinMatch) img = decodeURIComponent(pinMatch[1]);
        resolve({ url, img });
      });
    }).on('error', () => resolve({ url, img: '' }));
  });
}

async function run() {
  const map = {};
  for (const p of uniqueProductLinks) {
    const slug = p.replace('https://suzytoronto.com/product/', '').replace(/\/$/, '');
    const res = await fetchProductPageImg(p);
    if (res.img) {
      map[slug] = res.img;
      console.log(`Matched: ${slug} -> ${res.img}`);
    }
  }
  fs.writeFileSync('all_slug_image_map.json', JSON.stringify(map, null, 2));
}

run();
