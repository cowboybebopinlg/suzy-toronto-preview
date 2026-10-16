const fs = require('fs');

const html = fs.readFileSync('about_me.html', 'utf8');
const imgs = html.match(/src=["']([^"']+)["']/gi) || [];
const unique = [...new Set(imgs.map(i => i.replace(/^src=["']|["']$/g, '')))];

console.log('Images in about_me.html:');
console.log(unique);
