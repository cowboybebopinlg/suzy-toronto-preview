const fs = require('fs');

async function catalogSummary() {
  console.log('Fetching live catalog stats...');
  
  // 1. Total products count from header
  const prodRes = await fetch('https://suzytoronto.com/wp-json/wc/store/v1/products?per_page=1', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const totalProducts = prodRes.headers.get('x-wp-total');

  // 2. Total pages count
  const pagesRes = await fetch('https://suzytoronto.com/wp-json/wp/v2/pages?per_page=1', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const totalPages = pagesRes.headers.get('x-wp-total');

  // 3. Total blog posts count
  const postsRes = await fetch('https://suzytoronto.com/wp-json/wp/v2/posts?per_page=1', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const totalPosts = postsRes.headers.get('x-wp-total');

  // 4. Categories count
  let cats = [];
  for (let p = 1; p <= 3; p++) {
    const res = await fetch(`https://suzytoronto.com/wp-json/wp/v2/product_cat?per_page=100&page=${p}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) break;
    cats.push(...await res.json());
  }

  // 5. Tags count
  let tags = [];
  for (let p = 1; p <= 3; p++) {
    const res = await fetch(`https://suzytoronto.com/wp-json/wp/v2/product_tag?per_page=100&page=${p}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) break;
    tags.push(...await res.json());
  }

  console.log({
    totalProducts,
    totalPages,
    totalPosts,
    totalCategories: cats.length,
    totalTags: tags.length
  });

  // Top categories
  const topCats = cats.sort((a,b) => b.count - a.count).slice(0, 20).map(c => ({
    name: c.name,
    count: c.count,
    slug: c.slug
  }));
  console.log('Top 20 Categories:', topCats);
}

catalogSummary().catch(console.error);
