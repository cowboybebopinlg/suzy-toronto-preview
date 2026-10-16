const fs = require('fs');

const html = fs.readFileSync('shop_page.html', 'utf8');

// Match colors
const hexes = html.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
const counts = {};
hexes.forEach(h => {
  const norm = h.toUpperCase();
  counts[norm] = (counts[norm] || 0) + 1;
});
const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
console.log('Top HEX colors in shop_page.html:');
console.log(sorted.slice(0, 30));

// Also let's check for RGB / RGBA
const rgbs = html.match(/rgba?\([^)]+\)/gi) || [];
const rgbCounts = {};
rgbs.forEach(r => {
  rgbCounts[r] = (rgbCounts[r] || 0) + 1;
});
console.log('Top RGB colors:');
console.log(Object.entries(rgbCounts).sort((a,b) => b[1] - a[1]).slice(0, 15));

// Find logo image
const logoMatches = html.match(/https:\/\/[^"'\s]+logo[^"'\s]+/gi) || [];
console.log('Logo matches:', [...new Set(logoMatches)]);

// Check buttons and links styling in inline CSS
const styleTags = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
console.log(`Found ${styleTags.length} style tags`);
styleTags.forEach((s, idx) => {
  if (s.includes('background') || s.includes('color')) {
    const lines = s.split('\n').filter(l => l.includes('color:') || l.includes('background:'));
    if (lines.length) {
      console.log(`Style tag ${idx} has ${lines.length} color rules:`, lines.slice(0, 5));
    }
  }
});
