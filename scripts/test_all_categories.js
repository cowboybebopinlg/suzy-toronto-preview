const SHOP = 'suzy-toronto-fpkxqg4y.myshopify.com';
const TOKEN = 'ef81f1a19ceb3edb260bca217766dd48';

const map = {
  'brand:suzy': 'vendor:"Suzy Toronto"',
  'brand:kukana': 'vendor:Kukana OR tag:Kukana',
  'Calendars & Planners': 'product_type:"Calendars & Planners" OR tag:"2027 Calendar"',
  'Art Prints': 'product_type:*Art Prints* OR tag:*Art Print*',
  'Greeting Cards': 'product_type:*Greeting* OR tag:*Greeting*',
  'Coasters': 'product_type:*Coaster* OR tag:*Coaster*',
  'Mouse Pads': 'product_type:*Mouse* OR tag:*Mouse*',
  'Key Chains': 'product_type:*Key* OR product_type:"Buggy Buddies" OR tag:*Keychain*',
  'Magnets': 'product_type:"Magnets" OR tag:"Magnets"',
  'Apparel': 'product_type:"Apparel" OR tag:*T-shirt*',
  'Luggage Tags': 'product_type:*Tag* OR tag:*Bag Tag*',
  'Note Cards': 'product_type:"Note Cards" OR tag:"Note Cards"',
  'Bookmarks': 'product_type:"Bookmarks" OR tag:"Bookmarks"',
  'Memo Pads': 'product_type:*Stationery* OR product_type:*Memo* OR tag:*post-it* OR tag:*Memo*',
  'Drawstring Backpacks': 'product_type:*Bags* OR product_type:*Backpack* OR tag:*Backpack*',
  'Drinkware': 'product_type:*Drink* OR product_type:*Tumbler* OR tag:*Stainless*',
  'Journals & Notebooks': 'product_type:*Journal* OR tag:*Notebook*',
  'Canvas Wall Art': 'product_type:*Canvas* OR tag:*Canvas*',
  'Recipe Cards': 'product_type:*Recipe* OR tag:*Recipe*',
  'Stationery & Post-It Notes': 'tag:*post-it* OR product_type:*Sticky* OR tag:*Sticker*',
  'Books': 'product_type:"Books" OR tag:"Books"',
  
  // Collections
  'col:quilt': 'tag:*Quilt* OR product_type:*Quilt*',
  'col:tingleboots': 'tag:*TingleBoots* OR product_type:*TingleBoots*',
  'col:mermaids': 'tag:*Divas* OR tag:*Mermaid* OR product_type:*Mermaid*',
  'col:goddesses': 'tag:*Goddesses* OR tag:*Wonderful Wacky Women*',
  'col:american': 'tag:*American* OR tag:*PROUD to be an AMERICAN*',
  'col:christmas': 'tag:*Christmas*',
  'col:chocolate': 'tag:*Chocolate*',
  'col:pickleball': 'tag:*Pickleball*',
  'col:pink-ribbon': 'tag:*Pink Ribbon*',
  'col:pets': 'tag:*Pets* OR tag:*Dog* OR tag:*Cat*',
  'col:irish': 'tag:*Irish* OR tag:*Celtic*',
  'col:birthday': 'tag:*Birthday*',
  'col:valentines': 'tag:*Valentine*',

  // Recipients
  'rec:friend': 'tag:*Friend* OR product_type:*Friend*',
  'rec:mother': 'tag:*Mother* OR tag:*Mom*',
  'rec:daughter': 'tag:*Daughter*',
  'rec:sister': 'tag:*Sister*',
  'rec:father': 'tag:*Father* OR tag:*Dad*',
  'rec:son': 'tag:*Son*',
  'rec:grandchildren': 'tag:*Grandchildren* OR tag:*Granddaughter*',
  'rec:husband': 'tag:*Husband* OR tag:*Mighty Men*',
  'rec:family': 'tag:*Extended Family*',

  // Kukana categories
  'kukana:all': 'vendor:Kukana OR tag:Kukana',
  'kukana:cards': '(vendor:Kukana OR tag:Kukana) AND (product_type:*Greeting* OR tag:*greeting*)',
  'kukana:prints': '(vendor:Kukana OR tag:Kukana) AND (product_type:*Prints* OR tag:*Prints* OR tag:*Easel*)',
  'kukana:snack-mats': '(vendor:Kukana OR tag:Kukana) AND (product_type:*Mouse* OR tag:*Snack Mats*)',
  'kukana:coasters': '(vendor:Kukana OR tag:Kukana) AND (product_type:*Coasters* OR tag:*Coasters*)',
  'kukana:notecards': '(vendor:Kukana OR tag:Kukana) AND (product_type:*Note Cards* OR tag:*Note Cards*)',
  'kukana:memopads': '(vendor:Kukana OR tag:Kukana) AND (product_type:*Memo* OR tag:*Memo*)',
  'kukana:uplifting': '(vendor:Kukana OR tag:Kukana) AND (tag:*Encouraging* OR tag:*Uplifting*)',
  'kukana:gifts': '(vendor:Kukana OR tag:Kukana) AND (tag:*Gifts* OR tag:*Friend* OR tag:*Sister* OR tag:*Mom*)',
};

async function testAll() {
  let ok = 0;
  let empty = 0;
  for (const [key, q] of Object.entries(map)) {
    const gql = `
      query getSample($q: String) {
        products(first: 3, query: $q) {
          edges { node { title vendor } }
        }
      }
    `;
    const res = await fetch(`https://${SHOP}/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': TOKEN
      },
      body: JSON.stringify({ query: gql, variables: { q } })
    });
    const json = await res.json();
    const count = json.data?.products?.edges?.length || 0;
    if (count > 0) {
      ok++;
      console.log(`[PASS] ${key.padEnd(25)} -> ${count} items`);
    } else {
      empty++;
      console.log(`[EMPTY] ${key.padEnd(25)} -> 0 items`);
    }
  }
  console.log(`\nSummary: ${ok} passed, ${empty} empty`);
}

testAll();
