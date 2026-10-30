const SHOP = 'suzy-toronto-fpkxqg4y.myshopify.com';
const TOKEN = 'ef81f1a19ceb3edb260bca217766dd48';

async function checkQueries() {
  const testQueries = [
    'vendor:Kukana',
    'vendor:"Suzy Toronto"',
    'product_type:"Calendars & Planners"',
    'product_type:"Greeting Cards"',
    'product_type:"Art Prints"',
    'product_type:"Coasters"',
    'product_type:"Apparel"',
    'product_type:"Key Chains"',
    'product_type:"Magnets"',
    'product_type:"Mouse Pads"',
    'product_type:"Bookmarks"',
    'product_type:"Note Cards"',
    'product_type:"Bag Tags"',
    'tag:"Quilting"',
    'tag:"TingleBoots"',
    'tag:"Mermaids"',
    'tag:"Goddesses"',
    'tag:"American"',
    'tag:"Christmas"',
    'tag:"Chocolate"',
    'tag:"Pickleball"',
    'tag:"Pink Ribbon"',
    'tag:"Friend"',
    'tag:"Mother"',
    'tag:"Daughter"',
    'tag:"Sister"',
    'tag:"Kukana"'
  ];

  for (const q of testQueries) {
    const query = `
      query test($q: String!) {
        products(first: 5, query: $q) {
          edges {
            node {
              id
              title
              productType
              vendor
              tags
            }
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
      body: JSON.stringify({ query, variables: { q } })
    });
    const json = await res.json();
    const count = json.data?.products?.edges?.length || 0;
    console.log(`Query: ${q.padEnd(38)} => ${count} results`);
  }
}

checkQueries();
