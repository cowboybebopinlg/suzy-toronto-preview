const https = require('https');
const fs = require('fs');

https.get('https://suzytoronto.com/', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    fs.writeFileSync('home_page.html', data);
    console.log('Saved home_page.html, size:', data.length);
    
    // Check custom-css or oceanwp custom css or elementor settings
    const elementorCss = data.match(/https:\/\/[^"'\s]+\/elementor\/css\/post-[^"'\s]+\.css[^"'\s]*/gi) || [];
    console.log('Elementor post CSS links:', elementorCss);
    
    // Check topbar or header styles
    const topBar = data.match(/<div[^>]*id="top-bar"[^>]*>([\s\S]*?)<\/div>/i);
    if (topBar) console.log('Top bar:', topBar[0].slice(0, 500));
  });
});
