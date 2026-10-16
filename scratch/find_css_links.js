const fs = require('fs');

const html = fs.readFileSync('shop_page.html', 'utf8');

// Find all link tags
const links = html.match(/<link[^>]+>/gi) || [];
console.log(`Found ${links.length} link tags. First 10:`);
console.log(links.slice(0, 10));

// Search for any .css references
const cssMatches = html.match(/https:\/\/[^"'\s\>]+\.css[^"'\s\>]*/gi) || [];
console.log(`Found ${cssMatches.length} css urls:`);
console.log([...new Set(cssMatches)].slice(0, 15));
