const fs = require('fs');
const path = require('path');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.status === 429) {
        console.warn(`Rate limited (429) on ${url}, waiting 3s...`);
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`Fetch error on ${url}: ${err.message}. Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

async function fetchAllPages(baseUrl, perPage = 100) {
  let all = [];
  let page = 1;
  while (true) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    const url = `${baseUrl}${separator}per_page=${perPage}&page=${page}`;
    console.log(`Fetching page ${page} from ${baseUrl}...`);
    try {
      const res = await fetchWithRetry(url);
      const items = await res.json();
      if (!Array.isArray(items) || items.length === 0) break;
      all.push(...items);
      const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
      console.log(`  -> Got ${items.length} items (Total so far: ${all.length} / Total pages: ${totalPages})`);
      if (page >= totalPages) break;
      page++;
      // Polite delay between pages
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.error(`Error on page ${page}:`, e.message);
      break;
    }
  }
  return all;
}

async function main() {
  console.log('=== STARTING FULL LIVE SITE DATA EXTRACTION ===\n');

  // 1. Fetch Categories
  console.log('--- 1. Fetching Categories ---');
  const categories = await fetchAllPages('https://suzytoronto.com/wp-json/wp/v2/product_cat');
  fs.writeFileSync(path.join(__dirname, '../data/categories.json'), JSON.stringify(categories, null, 2));
  console.log(`Saved ${categories.length} categories to data/categories.json\n`);

  // 2. Fetch Tags
  console.log('--- 2. Fetching Tags ---');
  const tags = await fetchAllPages('https://suzytoronto.com/wp-json/wp/v2/product_tag');
  fs.writeFileSync(path.join(__dirname, '../data/tags.json'), JSON.stringify(tags, null, 2));
  console.log(`Saved ${tags.length} tags to data/tags.json\n`);

  // 3. Fetch CMS Pages
  console.log('--- 3. Fetching Pages ---');
  const pages = await fetchAllPages('https://suzytoronto.com/wp-json/wp/v2/pages');
  fs.writeFileSync(path.join(__dirname, '../data/pages.json'), JSON.stringify(pages, null, 2));
  console.log(`Saved ${pages.length} pages to data/pages.json\n`);

  // 4. Fetch Blog Posts
  console.log('--- 4. Fetching Blog Posts ---');
  const posts = await fetchAllPages('https://suzytoronto.com/wp-json/wp/v2/posts');
  fs.writeFileSync(path.join(__dirname, '../data/posts.json'), JSON.stringify(posts, null, 2));
  console.log(`Saved ${posts.length} posts to data/posts.json\n`);

  // 5. Fetch Products
  console.log('--- 5. Fetching All Products via Store API ---');
  const products = await fetchAllPages('https://suzytoronto.com/wp-json/wc/store/v1/products');
  fs.writeFileSync(path.join(__dirname, '../data/products_raw.json'), JSON.stringify(products, null, 2));
  console.log(`Saved ${products.length} products to data/products_raw.json\n`);

  console.log('=== DATA EXTRACTION COMPLETE ===');
  console.log(`Summary:
  - Products:   ${products.length}
  - Categories: ${categories.length}
  - Tags:       ${tags.length}
  - Pages:      ${pages.length}
  - Blog Posts: ${posts.length}
`);
}

main().catch(err => {
  console.error('Fatal error during extraction:', err);
  process.exit(1);
});
