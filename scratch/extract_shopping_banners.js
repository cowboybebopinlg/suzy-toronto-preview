const fs = require('fs');

const html = fs.readFileSync('scratch/shopping_raw.html', 'utf8');
const links = [...html.matchAll(/<a[^>]*href="([^"]*suzytoronto\.com\/product[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)];

console.log(`Total product/cat links: ${links.length}`);
links.forEach(l => {
  const imgAlt = (l[2].match(/alt="([^"]*)"/i) || [])[1] || '';
  const imgSrc = (l[2].match(/src="([^"]*)"/i) || [])[1] || '';
  const text = l[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(`Link: ${l[1]}\n  Text: "${text}" | Alt: "${imgAlt}" | Img: "${imgSrc}"\n`);
});
