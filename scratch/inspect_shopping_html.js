const fs = require('fs');

async function inspectShoppingHtml() {
  const res = await fetch('https://suzytoronto.com/shopping/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  fs.writeFileSync('scratch/shopping_raw.html', html);
  console.log('Saved shopping_raw.html, length:', html.length);
  // Check for product or category links
  const links = [...html.matchAll(/<a[^>]*href="([^"]*suzytoronto\.com\/product[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)];
  console.log('Product/Category links found:', links.length);
  links.slice(0, 30).forEach(l => {
    const text = l[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(l[1], '-->', text || '[No text / Image]');
  });
}

inspectShoppingHtml().catch(console.error);
