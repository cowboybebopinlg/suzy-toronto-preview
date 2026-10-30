const fs = require('fs');

async function inspectPages() {
  const urls = [
    'https://suzytoronto.com/shopping/',
    'https://suzytoronto.com/kukana-home/'
  ];

  for (const url of urls) {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    console.log(`\n================== ${url} ==================`);
    
    // Look for category links / grids
    const catLinks = [...html.matchAll(/href="(https:\/\/suzytoronto\.com\/product-category\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    console.log(`Found ${catLinks.length} category link tags`);
    const uniqueCats = new Map();
    catLinks.forEach(m => {
      const clean = m[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#8211;/g, '-').trim();
      if (clean && !uniqueCats.has(m[1])) {
        uniqueCats.set(m[1], clean);
      }
    });
    for (const [link, title] of uniqueCats.entries()) {
      console.log(`  * ${title.padEnd(45)} -> ${link}`);
    }
  }
}

inspectPages().catch(console.error);
