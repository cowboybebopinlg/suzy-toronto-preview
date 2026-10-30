const fs = require('fs');
const lines = fs.readFileSync('suzy_toronto_shopify_import_full.csv', 'utf8').split('\n');
const header = lines[0].split(',');
console.log('Headers:', header.slice(0, 10));

let kukanaCount = 0;
let kukanaVendors = new Set();
let kukanaTypes = new Set();
let kukanaTags = new Set();

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  if (line.includes('Kukana') || line.includes('kukana')) {
    kukanaCount++;
    // parse CSV fields roughly
    const match = line.match(/^("([^"]|"")*"|[^,]*),/);
    // Let's inspect some sample lines
    if (kukanaCount <= 3) {
      console.log('Sample Kukana line snippet:', line.substring(0, 200));
    }
  }
}
console.log('Kukana row occurrences:', kukanaCount);
