const domain = 'suzy-toronto-fpkxqg4y.myshopify.com';
const token = 'ef81f1a19ceb3edb260bca217766dd48';

async function countProducts() {
  let total = 0;
  let cursor = null;
  let allCollections = [];

  while (true) {
    const afterClause = cursor ? `, after: "${cursor}"` : '';
    const query = `
      query {
        products(first: 250${afterClause}) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              handle
              productType
              vendor
            }
          }
        }
        collections(first: 50) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
      }
    `;

    const res = await fetch(`https://${domain}/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token
      },
      body: JSON.stringify({ query })
    });

    const data = await res.json();
    if (!data.data || !data.data.products) {
      console.error('Error fetching products:', JSON.stringify(data));
      break;
    }

    const edges = data.data.products.edges;
    total += edges.length;
    allCollections = data.data.collections.edges.map(c => c.node.title);

    if (data.data.products.pageInfo.hasNextPage) {
      cursor = data.data.products.pageInfo.endCursor;
    } else {
      break;
    }
  }

  console.log(`\n=== LIVE SHOPIFY STORE SUMMARY ===`);
  console.log(`- Shop: https://${domain}`);
  console.log(`- Total Published Products: ${total}`);
  console.log(`- Collections in Shopify:`, allCollections);
}

countProducts().catch(console.error);
