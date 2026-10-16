const https = require('https');
const fs = require('fs');

const slugs = [
  '2027-calendar-pre-order-large-12x12',
  '2027-calendar-small-mini-7-5x7-5',
  'wonderful-wacky-words-god-wants-us-to-remember-notebook-journal',
  'in-a-world-where-you-can-be-anything-be-kind-buggy-buddy-with-key-ring-chain-clip',
  'stainless-steel-multifunctional-16oz-can-cooler-crazy-brave-and-wicked-strong',
  'gathering-of-the-goddesses-with-story-on-front-8-x-10-matted-gifty-art-print',
  'pretending-to-be-a-normal-person-day-after-day-is-exhausting-sticky-tingles-3m-post-it-notes',
  'in-a-world-where-you-can-be-anything-be-kind-car-cup-coaster-2-pack',
  'dont-let-anyone-dull-your-sparkle-magnetic-memo-pad',
  'kindred-spirits-forever-friends-bookmark',
  'this-is-not-your-bag-luggage-bag-tag',
  'dont-let-anyone-dull-your-sparkle-key-chain',
  'from-the-bottom-of-my-wild-wacky-heart-thanks-a-bunch-note-cards-8-pack'
];

function fetchPage(slug) {
  return new Promise((resolve) => {
    const url = `https://suzytoronto.com/product/${slug}/`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = data.match(/https:\/\/suzytoronto\.com\/wp-content\/uploads\/[0-9]{4}\/[0-9]{2}\/[^"'\s\>\)]+\.(jpg|jpeg|png|webp)/gi) || [];
        const unique = [...new Set(matches)].filter(u => !u.includes('-100x') && !u.includes('-150x') && !u.includes('-300x'));
        resolve({ slug, url, imgs: unique });
      });
    });
    req.on('error', err => resolve({ slug, url, imgs: [], error: err.message }));
  });
}

async function main() {
  const results = [];
  for (const s of slugs) {
    const res = await fetchPage(s);
    results.push(res);
    console.log(`[${s}] found ${res.imgs.length} images:`, res.imgs[0]);
  }
  fs.writeFileSync('img_results.json', JSON.stringify(results, null, 2));
}

main();
