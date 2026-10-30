const domain = 'suzy-toronto-fpkxqg4y.myshopify.com';
const token = 'ef81f1a19ceb3edb260bca217766dd48';

async function testCart() {
  // 1. Get a product variant ID
  const prodQuery = `
    query {
      products(first: 1) {
        edges {
          node {
            title
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const prodRes = await fetch(`https://${domain}/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({ query: prodQuery })
  });
  const prodData = await prodRes.json();
  const variant = prodData.data.products.edges[0].node.variants.edges[0].node;
  console.log('Selected variant:', variant.id, 'for product:', prodData.data.products.edges[0].node.title);

  // 2. Create a Cart
  const cartMutation = `
    mutation cartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const cartRes = await fetch(`https://${domain}/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({
      query: cartMutation,
      variables: {
        input: {
          lines: [
            {
              merchandiseId: variant.id,
              quantity: 1
            }
          ]
        }
      }
    })
  });

  const cartData = await cartRes.json();
  console.log('Cart Creation Result:', JSON.stringify(cartData, null, 2));
}

testCart().catch(console.error);
