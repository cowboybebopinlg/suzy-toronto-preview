const SHOP = 'suzy-toronto-fpkxqg4y.myshopify.com';
const TOKEN = 'ef81f1a19ceb3edb260bca217766dd48';

async function getAllLiveTypes() {
  const query = `
    query getTypes {
      productTypes(first: 100) {
        edges {
          node
        }
      }
      productTags(first: 100) {
        edges {
          node
        }
      }
    }
  `;

  const res = await fetch(`https://${SHOP}/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN
    },
    body: JSON.stringify({ query })
  });
  const json = await res.json();
  console.log('Live Product Types in Shopify:');
  json.data?.productTypes?.edges?.forEach(e => console.log(' - ' + e.node));
  console.log('\nSample Live Tags in Shopify:');
  json.data?.productTags?.edges?.slice(0, 40).forEach(e => console.log(' - ' + e.node));
}

getAllLiveTypes();
