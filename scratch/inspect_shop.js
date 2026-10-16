const https = require('https');
const fs = require('fs');

const url = 'https://suzytoronto.com/shop/';
https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('shop_page.html', data);
    console.log('Saved shop page. Size:', data.length);
    const imgMatches = data.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
    console.log('Found img tags:', imgMatches.slice(0, 15));
  });
});
