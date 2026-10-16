const fs = require('fs');
const https = require('https');

const html = fs.readFileSync('shop_page.html', 'utf8');

// Find all stylesheet links
const cssRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
let match;
const cssUrls = [];
while ((match = cssRegex.exec(html)) !== null) {
  cssUrls.push(match[1]);
}

console.log('Found CSS URLs:', cssUrls.filter(u => u.includes('theme') || u.includes('style') || u.includes('custom') || u.includes('ocean')));

function fetchCss(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  for (const url of cssUrls) {
    if (url.includes('custom') || url.includes('theme') || url.includes('oceanwp') || url.includes('elementor/css/global')) {
      console.log('Fetching:', url);
      const css = await fetchCss(url);
      
      // Look for hex colors with 6 digits
      const hexes = css.match(/#[0-9a-fA-F]{6}\b/g) || [];
      const counts = {};
      hexes.forEach(h => counts[h.toLowerCase()] = (counts[h.toLowerCase()] || 0) + 1);
      console.log('Colors in', url.split('/').pop().split('?')[0], Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 10));
    }
  }
}

run();
