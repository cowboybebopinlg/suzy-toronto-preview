const fs = require('fs');
const lines = fs.readFileSync('suzy_toronto_shopify_import_full.csv', 'utf8').split('\n');
const types = new Map();
const allTags = new Map();

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  // parse columns
  const cols = line.split(',');
  const type = cols[4]?.replace(/"/g, '').trim();
  const tagsStr = cols[5]?.replace(/"/g, '').trim();
  
  if (type) {
    types.set(type, (types.get(type) || 0) + 1);
  }
  if (tagsStr) {
    tagsStr.split(',').forEach(t => {
      const tag = t.trim();
      if (tag) allTags.set(tag, (allTags.get(tag) || 0) + 1);
    });
  }
}

console.log('--- ALL PRODUCT TYPES IN IMPORT CSV ---');
[...types.entries()].sort((a,b) => b[1] - a[1]).forEach(([t, count]) => {
  console.log(`${t}: ${count}`);
});

console.log('\n--- TOP TAGS IN IMPORT CSV ---');
[...allTags.entries()].sort((a,b) => b[1] - a[1]).slice(0, 50).forEach(([t, count]) => {
  console.log(`${t}: ${count}`);
});
