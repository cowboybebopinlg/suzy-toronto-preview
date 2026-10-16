const fs = require('fs');

const html = fs.readFileSync('home_page.html', 'utf8');

// Search for colors in home_page.html
const hexes = html.match(/#[0-9a-fA-F]{6}\b/g) || [];
const counts = {};
hexes.forEach(h => {
  const l = h.toLowerCase();
  counts[l] = (counts[l] || 0) + 1;
});
console.log('Hexes in home_page.html:', Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 20));

// Look for style elements or elementor styles
const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
console.log('Style blocks:', styleMatches.length);
styleMatches.forEach((s, idx) => {
  console.log(`--- Style block ${idx} (length ${s.length}) ---`);
  if (s.length < 2000) console.log(s);
  else console.log(s.slice(0, 1000));
});
