const fs = require('fs');
const pages = JSON.parse(fs.readFileSync('./data/pages.json', 'utf8'));
console.log('Pages count:', pages.length);
pages.forEach(p => {
  console.log(`- [${p.id}] ${p.title.rendered} (slug: ${p.slug})`);
});
