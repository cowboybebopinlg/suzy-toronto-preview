const https = require('https');
const fs = require('fs');

const url = 'https://suzytoronto.com/wp-content/cache/autoptimize/css/autoptimize_8210708c682c5c2682b2e930e258fd94.css';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    fs.writeFileSync('autoptimize.css', data);
    console.log('Saved autoptimize.css, size:', data.length);
    
    // Find all 6-character hex colors
    const hexes = data.match(/#[0-9a-fA-F]{6}\b/g) || [];
    const counts = {};
    hexes.forEach(h => {
      const lower = h.toLowerCase();
      counts[lower] = (counts[lower] || 0) + 1;
    });
    
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    console.log('Top 30 Hex colors in live CSS:');
    console.log(sorted.slice(0, 30));

    // Search for button or ocean or custom colors
    const buttonRules = data.match(/button[^{]*\{[^}]*\}/gi) || [];
    console.log('Button rules sample:');
    console.log(buttonRules.slice(0, 5));
  });
});
