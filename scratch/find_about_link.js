const fs = require('fs');

const home = fs.readFileSync('home_page.html', 'utf8');

// Look for links in the navigation or footer
const links = home.match(/href=["']([^"']+)["']/gi) || [];
const uniqueLinks = [...new Set(links.map(l => l.replace(/^href=["']|["']$/g, '')))];

console.log('All links on home page:');
console.log(uniqueLinks.filter(l => l.includes('suzytoronto.com')));
