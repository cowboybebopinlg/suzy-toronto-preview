const domain = 'suzy-toronto-fpkxqg4y.myshopify.com';
const apiKey = '18a8a9a8a034e0aca2194e08cdc4edd0';

async function testAll() {
  console.log('Testing apiKey:', apiKey);
  
  // 1. Storefront GraphQL
  const res1 = await fetch(`https://${domain}/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': apiKey
    },
    body: JSON.stringify({ query: '{ shop { name } }' })
  });
  console.log('1. Storefront API with X-Shopify-Storefront-Access-Token:', res1.status);

  // 2. Admin API
  const res2 = await fetch(`https://${domain}/admin/api/2024-04/shop.json`, {
    headers: {
      'X-Shopify-Access-Token': apiKey
    }
  });
  console.log('2. Admin API with X-Shopify-Access-Token:', res2.status);

  // 3. Storefront API with key query param or header
  const res3 = await fetch(`https://${domain}/api/2024-04/graphql.json?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ shop { name } }' })
  });
  console.log('3. Storefront API query param ?key=:', res3.status);
}

testAll().catch(console.error);
