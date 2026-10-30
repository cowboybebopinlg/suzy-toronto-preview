const fs = require('fs');

function parseCSVLine(text) {
  let p = '', row = [''], i = 0, inQuote = false;
  for (let idx = 0; idx < text.length; idx++) {
    const l = text[idx];
    if (l === '"') {
      if (inQuote && text[idx + 1] === '"') {
        row[i] += '"';
        idx++;
      } else {
        inQuote = !inQuote;
      }
    } else if (l === ',' && !inQuote) {
      row[++i] = '';
    } else {
      row[i] += l;
    }
  }
  return row;
}

const lines = fs.readFileSync('suzy_toronto_shopify_import_full.csv', 'utf8').split('\n');
const headers = parseCSVLine(lines[0]);
console.log('Headers count:', headers.length);

const row1 = parseCSVLine(lines[1]);
console.log('Row 1 columns matched:', row1.length === headers.length, `(${row1.length}/${headers.length})`);

headers.forEach((h, idx) => {
  if (row1[idx]) {
    console.log(`  [${h}]: ${row1[idx].substring(0, 60)}`);
  }
});

const row2 = parseCSVLine(lines[2]);
console.log('\nRow 2 (Variant/Image 2):');
headers.forEach((h, idx) => {
  if (row2[idx]) {
    console.log(`  [${h}]: ${row2[idx].substring(0, 60)}`);
  }
});
