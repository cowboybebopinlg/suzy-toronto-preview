const fs = require('fs');
const cats = JSON.parse(fs.readFileSync('./data/categories.json', 'utf8'));

console.log('Total categories:', cats.length);
const roots = cats.filter(c => c.parent === 0);
console.log('\n--- ROOT CATEGORIES ---');
roots.forEach(r => {
  const children = cats.filter(c => c.parent === r.id);
  console.log(`[${r.id}] ${r.name} (${r.count} items, ${children.length} subcategories)`);
  children.forEach(ch => {
    console.log(`    - [${ch.id}] ${ch.name} (${ch.count})`);
  });
});

console.log('\n--- KUKANA CATEGORIES ---');
const kukanaCats = cats.filter(c => c.name.toLowerCase().includes('kukan') || c.slug.toLowerCase().includes('kukan'));
kukanaCats.forEach(c => {
  console.log(`[${c.id}] ${c.name} (parent: ${c.parent}, count: ${c.count})`);
});

const prods = JSON.parse(fs.readFileSync('./data/products_raw.json', 'utf8'));
console.log('\nTotal products:', prods.length);
const kukanaProds = prods.filter(p => 
  (p.name && p.name.toLowerCase().includes('kukan')) ||
  (p.categories && p.categories.some(c => c.name.toLowerCase().includes('kukan') || c.slug.toLowerCase().includes('kukan')))
);
console.log('Products matching Kukana:', kukanaProds.length);
