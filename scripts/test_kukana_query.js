const SHOP = 'suzy-toronto-fpkxqg4y.myshopify.com';
const TOKEN = 'ef81f1a19ceb3edb260bca217766dd48';

async function testKukana() {
  const query = `
    query searchKukana($query: String!) {
      products(first: 10, query: $query) {
        totalCount: edges {
          cursor
        }
        edges {
          node {
            id
            title
            productType
            vendor
            tags
            handle
          }
        }
      }
    }
  `;

  // Test 1: query: "Kukana"
  for (const q of ['Kukana', 'tag:Kukana', 'vendor:Kukana', 'title:Kukana']) {
    const res = await fetch(`https://${SHOP}/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': TOKEN
      },
      body: JSON.stringify({ query, variables: { query: q } })
    });
    const data = await res.json();
    console.log(`Query "${q}" => found ${data.data?.products?.edges?.length || 0} products`);
    if (data.data?.products?.edges?.length > 0) {
      console.log('Sample node:', data.data.products.edges[0].node);
    }
  }
}

testKukana();
