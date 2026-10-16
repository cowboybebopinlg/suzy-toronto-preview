const https = require('https');
const fs = require('fs');

const urls = [
  'https://suzytoronto.com/about-suzy/',
  'https://suzytoronto.com/about-us/',
  'https://suzytoronto.com/our-story/',
  'https://suzytoronto.com/suzy-story/',
  'https://suzytoronto.com/meet-the-team/'
];

function fetchPage(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({ url, status: res.statusCode, data });
      });
    }).on('error', () => resolve({ url, status: 500, data: '' }));
  });
}

async function run() {
  for (const u of urls) {
    const res = await fetchPage(u);
    console.log(res.status, u, 'length:', res.data.length);
    if (res.status === 200 && res.data.length > 5000) {
      fs.writeFileSync('about_page.html', res.data);
      console.log('Saved', u, 'to about_page.html');
      break;
    }
  }
}

run();
