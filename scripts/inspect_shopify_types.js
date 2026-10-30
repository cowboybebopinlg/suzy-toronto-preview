const domain = 'suzy-toronto-fpkxqg4y.myshopify.com';
const token = 'ef81f1a19ceb3edb260bca217766dd48';

async function inspectTypes() {
  const query = `
    query {
      products(first: 250) {
        edges {
          node {
            productType
            tags
            vendor
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
  const types = new Set();
  const allTags = new Set();
  const vendors = new Set();

  data.data.products.edges.forEach(e => {
    if (e.node.productType) types.add(e.node.productType);
    if (e.node.vendor) vendors.add(e.node.vendor);
    if (e.node.tags) e.node.tags.forEach(t => allTags.add(t));
  });

  console.log('Sample Product Types:', Array.from(types));
  console.log('Vendors:', Array.from(vendors));
  console.log('Total unique tags sample:', allTags.size);
}

inspectTypes().catch(console.error);
