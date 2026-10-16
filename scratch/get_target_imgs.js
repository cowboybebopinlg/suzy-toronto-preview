const fs = require('fs');
const https = require('https');

const rawHtml = fs.readFileSync('shop_page.html', 'utf8');
const allLinks = [...new Set(rawHtml.match(/https:\/\/suzytoronto\.com\/product\/[^"'\s\>]+/gi) || [])];

const keywords = ['buggy', 'cooler', 'tumbler', 'matted', 'print', 'post-it', 'sticky', 'coaster', 'memo', 'magnetic', 'tag', 'key'];

const matchedLinks = allLinks.filter(l => keywords.some(k => l.toLowerCase().includes(k)));

console.log(`Found ${matchedLinks.length} target product links:`);
console.log(matchedLinks);

function fetchOg(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const og = data.match(/property="og:image"\s+content="([^"]+)"/i) || data.match(/content="([^"]+)"\s+property="og:image"/i);
        const pin = data.match(/media=(https%3A%2F%2Fsuzytoronto\.com%2Fwp-content%2Fuploads%2F[^&"']+)/i);
        let img = og ? og[1] : (pin ? decodeURIComponent(pin[1]) : '');
        resolve({ url, img });
      });
    }).on('error', () => resolve({ url, img: '' }));
  });
}

async function run() {
  for (const l of matchedLinks) {
    const res = await fetchOg(l);
    console.log(`${l} ==> ${res.img}`);
  }
}

run();
