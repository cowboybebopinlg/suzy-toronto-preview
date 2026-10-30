const SHOP = 'suzy-toronto-fpkxqg4y.myshopify.com';
const TOKEN = 'ef81f1a19ceb3edb260bca217766dd48';

async function testCategoryFilters() {
  const categories = [
    { name: 'All Products', query: '' },
    { name: 'Keepers by Kukana', query: 'vendor:Kukana OR tag:Kukana' },
    { name: 'Suzy Toronto Brand', query: 'vendor:"Suzy Toronto"' },
    { name: 'Calendars & Planners', query: 'product_type:"Calendars & Planners" OR tag:"2027 Calendar"' },
    { name: 'Greeting Cards', query: 'product_type:*Greeting* OR tag:*Greeting*' },
    { name: 'Art Prints & Easels', query: 'product_type:*Art Prints* OR tag:*Art Print*' },
    { name: 'Coasters & Car Coasters', query: 'product_type:*Coaster* OR tag:*Coaster*' },
    { name: 'Drinkware & Tumblers', query: 'product_type:*Drink* OR product_type:*Tumbler* OR tag:*Stainless*' },
    { name: 'Apparel & T-Shirts', query: 'product_type:"Apparel" OR tag:*T-shirt*' },
    { name: 'Key Chains & Buggy Buddies', query: 'product_type:*Key* OR product_type:"Buggy Buddies" OR tag:*Keychain*' },
    { name: 'Magnets', query: 'product_type:"Magnets" OR tag:"Magnets"' },
    { name: 'Mouse Pads', query: 'product_type:*Mouse* OR tag:*Mouse*' },
    { name: 'Luggage Tags & Bag Tags', query: 'product_type:*Tag* OR tag:*Bag Tag*' },
    { name: 'Bookmarks', query: 'product_type:"Bookmarks" OR tag:"Bookmarks"' },
    { name: 'Memo Pads & Sticky Notes', query: 'product_type:*Stationery* OR product_type:*Memo* OR tag:*post-it*' },
    { name: 'Journals & Notebooks', query: 'product_type:*Journal* OR tag:*Notebook*' },
    { name: 'Canvas Wall Art', query: 'product_type:*Canvas* OR tag:*Canvas*' },
    { name: 'Quilt Collection', query: 'tag:*Quilt* OR product_type:*Quilt*' },
    { name: 'TingleBoots Country', query: 'tag:*TingleBoots* OR product_type:*TingleBoots*' },
    { name: 'Mermaids & Divas', query: 'tag:*Divas* OR tag:*Mermaid* OR product_type:*Mermaid*' },
    { name: 'Goddesses & Wild Women', query: 'tag:*Goddesses* OR tag:*Wonderful Wacky Women*' },
    { name: 'Pink Ribbon Sisterhood', query: 'tag:*Pink Ribbon*' },
    { name: 'Friend Gifts', query: 'tag:*Friend* OR product_type:*Friend*' },
    { name: 'Mother Gifts', query: 'tag:*Mother* OR tag:*Mom*' },
    { name: 'Daughter Gifts', query: 'tag:*Daughter*' },
    { name: 'Sister Gifts', query: 'tag:*Sister*' }
  ];

  console.log('Testing category queries:');
  for (const c of categories) {
    const gql = `
      query getCount($q: String) {
        products(first: 5, query: $q) {
          edges {
            node {
              title
              vendor
              productType
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
      body: JSON.stringify({ query: gql, variables: { q: c.query || null } })
    });
    const json = await res.json();
    const count = json.data?.products?.edges?.length || 0;
    console.log(`[${count > 0 ? 'OK' : 'EMPTY'}] ${c.name.padEnd(28)} => ${count} sample items found`);
  }
}

testCategoryFilters();
