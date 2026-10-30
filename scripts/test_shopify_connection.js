const domain = 'suzy-toronto-fpkxqg4y.myshopify.com';
const token = 'ef81f1a19ceb3edb260bca217766dd48';

async function testShopify() {
  const query = `
    query {
      shop {
        name
        description
        primaryDomain {
          url
          host
        }
      }
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            productType
            vendor
            featuredImage {
              url
            }
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
      collections(first: 10) {
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

  console.log(`Testing connection to ${domain} with token: ${token}...`);

  const res = await fetch(`https://${domain}/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({ query })
  });

  console.log('HTTP Status:', res.status);
  const data = await res.json();
  console.log('GraphQL Result:', JSON.stringify(data, null, 2));
}

testShopify().catch(console.error);
