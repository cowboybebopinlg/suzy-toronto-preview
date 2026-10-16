const fs = require('fs');

const html = fs.readFileSync('shop_page.html', 'utf8');

// Header HTML
const headerMatch = html.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
if (headerMatch) {
  console.log('Header HTML sample:');
  console.log(headerMatch[1].slice(0, 1500));
} else {
  console.log('No <header> tag found, looking for #site-header or .site-header');
  const siteHeader = html.match(/<div[^>]*id="site-header"[^>]*>([\s\S]*?)<\/div>/i) || html.match(/<[^>]*class="[^"]*site-header[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/i);
  if (siteHeader) {
    console.log(siteHeader[0].slice(0, 1500));
  }
}

// Check navigation bar classes and colors
const navMatch = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i);
if (navMatch) {
  console.log('Nav sample:');
  console.log(navMatch[0].slice(0, 1000));
}

// Check inline styles or custom css in head
const customCss = html.match(/<style[^>]*id=["'][^"']*custom[^"']*["'][^>]*>([\s\S]*?)<\/style>/gi) || html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
console.log('Custom CSS blocks:', customCss ? customCss.length : 0);
if (customCss) {
  customCss.forEach(c => {
    if (c.length < 5000) console.log('CSS block:', c);
  });
}
