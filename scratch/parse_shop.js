const fs = require('fs');

const html = fs.readFileSync('shop_page.html', 'utf8');

// Match product cards / items
// WooCommerce products have class "product" or "product-type-" or links like <a href="https://suzytoronto.com/product/..."
const regex = /<li[^>]*class="[^"]*product[^"]*"[\s\S]*?<\/li>/gi;
const matches = html.match(regex) || [];

console.log(`Found ${matches.length} product card HTML blocks on shop page`);

const items = [];
matches.forEach(block => {
  const titleMatch = block.match(/<h2[^>]*class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>(.*?)<\/h2>/i) || block.match(/<a[^>]*>(.*?)<\/a>/i);
  const imgMatch = block.match(/data-src="([^"]+)"/i) || block.match(/src="([^"]+)"/i);
  const linkMatch = block.match(/href="([^"]+)"/i);
  
  if (titleMatch && imgMatch) {
    items.push({
      title: titleMatch[1].replace(/<[^>]+>/g, '').trim(),
      img: imgMatch[1],
      link: linkMatch ? linkMatch[1] : ''
    });
  }
});

console.log('Sample extracted items from shop page:');
console.log(items.slice(0, 15));
fs.writeFileSync('extracted_shop_items.json', JSON.stringify(items, null, 2));
