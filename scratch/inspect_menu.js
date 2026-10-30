const fs = require('fs');

async function printMenu() {
  const res = await fetch('https://suzytoronto.com/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const menuMatch = html.match(/<ul id="menu-main-menu"[\s\S]*?<\/ul>/i);
  if (menuMatch) {
    const items = [...menuMatch[0].matchAll(/<li[^>]*class="([^"]*)"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)];
    console.log(`Found ${items.length} menu items:`);
    items.forEach(it => {
      const isSub = it[1].includes('sub-menu') || it[1].includes('menu-item-has-children');
      const text = it[3].replace(/<[^>]+>/g, '').trim();
      console.log(`- ${text.padEnd(35)} -> ${it[2]}`);
    });
  }
}

printMenu().catch(console.error);
