const fs = require('fs');
const path = require('path');

const headers = [
  "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
  "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
  "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty",
  "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price",
  "Variant Requires Shipping", "Variant Taxable", "Variant Barcode", "Image Src", "Image Position",
  "Image Alt Text", "Gift Card", "SEO Title", "SEO Description",
  "Google Shopping / Google Product Category", "Google Shopping / Gender", "Google Shopping / Age Group",
  "Google Shopping / MPN", "Google Shopping / AdWords Grouping", "Google Shopping / AdWords Labels",
  "Google Shopping / Condition", "Google Shopping / Custom Label 0", "Google Shopping / Custom Label 1",
  "Google Shopping / Custom Label 2", "Google Shopping / Custom Label 3", "Google Shopping / Custom Label 4",
  "Variant Image", "Variant Weight Unit", "Variant Tax Code", "Cost per item",
  "Price / International", "Compare At Price / International", "Status"
];

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function makeRow(obj) {
  return headers.map(h => escapeCSV(obj[h] !== undefined ? obj[h] : ''));
}

const rows = [];

// 1. 2027 Calendar Large
rows.push(makeRow({
  "Handle": "2027-calendar-pre-order-large-12x12",
  "Title": '2027 Calendar (PRE-ORDER) - LARGE 12"x12" - Next Chapter of My Life: Adventure',
  "Body (HTML)": '<p>Celebrate another year of wild, wacky, and wonderful inspiration with Suzy Toronto\'s official <strong>2027 Wall Calendar</strong>!</p><ul><li><strong>Size:</strong> 12" x 12" (opens to 12" x 24")</li><li><strong>Features:</strong> Full-color whimsical artwork, uplifting monthly stories, and spacious date grids.</li><li><strong>Material:</strong> Premium heavy gloss cardstock with reinforced metal spiral wire hanger.</li></ul><p><em>Note: This is a Pre-Order item. Expected release and shipping date is October 2026. Pre-orders ship separately when inventory arrives.</em></p>',
  "Vendor": "Suzy Toronto",
  "Type": "Calendars & Planners",
  "Tags": "2027 Calendar, Pre-Order, Planners, Ships October, Wall Calendar, Gifts",
  "Published": "TRUE",
  "Option1 Name": "Title",
  "Option1 Value": "Default Title",
  "Variant SKU": "CAL27-PO",
  "Variant Grams": "450",
  "Variant Inventory Tracker": "shopify",
  "Variant Inventory Qty": "100",
  "Variant Inventory Policy": "continue",
  "Variant Fulfillment Service": "manual",
  "Variant Price": "20.95",
  "Variant Requires Shipping": "TRUE",
  "Variant Taxable": "TRUE",
  "Image Src": "https://suzytoronto.com/wp-content/uploads/2026/03/PO-LG27CAL_OPT.jpg",
  "Image Position": "1",
  "Image Alt Text": "2027 Large Wall Calendar Pre-Order",
  "Gift Card": "FALSE",
  "SEO Title": "2027 Suzy Toronto Wall Calendar | Pre-Order Today",
  "SEO Description": "Pre-order the official 2027 Suzy Toronto 12x12 wall calendar featuring inspirational artwork and monthly stories.",
  "Variant Weight Unit": "lb",
  "Status": "active"
}));

// 2. 2027 Calendar Small
rows.push(makeRow({
  "Handle": "2027-calendar-small-mini-7-5x7-5",
  "Title": '2027 Calendar SMALL/MINI 7.5"x7.5" - "The World is Ready for Your Magic"',
  "Body (HTML)": '<p>Bring daily joy to compact spaces with the <strong>2027 Suzy Toronto Mini Wall Calendar</strong>.</p><ul><li><strong>Size:</strong> 7.5" x 7.5" (opens to 7.5" x 15")</li><li><strong>Features:</strong> 12 months of vibrant illustrations and empowering affirmations perfect for offices, cubicles, or kitchens.</li><li><strong>Quality:</strong> Printed on eco-friendly glossy stock.</li></ul><p><em>Pre-Order Item: Ships October 2026.</em></p>',
  "Vendor": "Suzy Toronto",
  "Type": "Calendars & Planners",
  "Tags": "2027 Calendar, Pre-Order, Mini Calendar, Ships October, Desktop Gifts",
  "Published": "TRUE",
  "Option1 Name": "Title",
  "Option1 Value": "Default Title",
  "Variant SKU": "SM72",
  "Variant Grams": "250",
  "Variant Inventory Tracker": "shopify",
  "Variant Inventory Qty": "150",
  "Variant Inventory Policy": "continue",
  "Variant Fulfillment Service": "manual",
  "Variant Price": "12.95",
  "Variant Requires Shipping": "TRUE",
  "Variant Taxable": "TRUE",
  "Image Src": "https://suzytoronto.com/wp-content/uploads/2026/04/LG27_OPT2.jpg",
  "Image Position": "1",
  "Image Alt Text": "2027 Small Mini Calendar Pre-Order",
  "Gift Card": "FALSE",
  "SEO Title": "2027 Mini Wall Calendar | Suzy Toronto",
  "SEO Description": "Compact 7.5x7.5 2027 mini wall calendar by Suzy Toronto. Pre-order now for October shipping.",
  "Variant Weight Unit": "lb",
  "Status": "active"
}));

// 3-8. Journal Variants
const journalTitle = "Wonderful Wacky Words God Wants Us to Remember - Notebook / Journal";
const journalDesc = '<p>Capture your prayers, daily thoughts, creative ideas, and spiritual insights in this beautifully bound Suzy Toronto journal.</p><ul><li><strong>Features:</strong> Full-color hard cover with signature wacky typography and heartfelt message.</li><li><strong>Customization Available:</strong> Add personalized NameDrop printing to the cover for just +$5.00!</li></ul>';
const journalHandle = "wonderful-wacky-words-god-wants-us-to-remember-notebook-journal";
const journalTags = "Notebooks, Journals, Faith, Personalization, NameDrop, Gift Ideas";
const journalImg = "https://suzytoronto.com/wp-content/uploads/2019/10/HC959_OPT.jpg";

const notebookVariants = [
  { size: '5" x 7"', paper: 'Lined', nameDrop: 'Standard', sku: 'NB959-5X7-L', price: '15.00', weight: '300', pos: '1' },
  { size: '5" x 7"', paper: 'Lined', nameDrop: 'Custom NameDrop (+$5)', sku: 'NB959-5X7-L-ND', price: '20.00', weight: '300', pos: '2' },
  { size: '6" x 9"', paper: 'Lined', nameDrop: 'Standard', sku: 'NB959-6X9-L', price: '18.00', weight: '400', pos: '3' },
  { size: '6" x 9"', paper: 'Lined', nameDrop: 'Custom NameDrop (+$5)', sku: 'NB959-6X9-L-ND', price: '23.00', weight: '400', pos: '4' },
  { size: '8.5" x 11"', paper: 'Lined', nameDrop: 'Standard', sku: 'NB959-8X11-L', price: '22.00', weight: '550', pos: '5' },
  { size: '8.5" x 11"', paper: 'Lined', nameDrop: 'Custom NameDrop (+$5)', sku: 'NB959-8X11-L-ND', price: '27.00', weight: '550', pos: '6' }
];

notebookVariants.forEach((v, idx) => {
  rows.push(makeRow({
    "Handle": journalHandle,
    "Title": idx === 0 ? journalTitle : '',
    "Body (HTML)": idx === 0 ? journalDesc : '',
    "Vendor": "Suzy Toronto",
    "Type": "Journals & Notebooks",
    "Tags": idx === 0 ? journalTags : '',
    "Published": "TRUE",
    "Option1 Name": "Size",
    "Option1 Value": v.size,
    "Option2 Name": "Paper Type",
    "Option2 Value": v.paper,
    "Option3 Name": "Personalization",
    "Option3 Value": v.nameDrop,
    "Variant SKU": v.sku,
    "Variant Grams": v.weight,
    "Variant Inventory Tracker": "shopify",
    "Variant Inventory Qty": "50",
    "Variant Inventory Policy": "deny",
    "Variant Fulfillment Service": "manual",
    "Variant Price": v.price,
    "Variant Requires Shipping": "TRUE",
    "Variant Taxable": "TRUE",
    "Image Src": journalImg,
    "Image Position": v.pos,
    "Image Alt Text": idx === 0 ? "Wonderful Wacky Words Journal" : '',
    "Gift Card": "FALSE",
    "SEO Title": idx === 0 ? "Wonderful Wacky Words Journal | Suzy Toronto" : '',
    "SEO Description": idx === 0 ? "Inspiring spiral notebook journal by Suzy Toronto. Available in multiple sizes and lined or blank paper with custom NameDrop option." : '',
    "Variant Weight Unit": "lb",
    "Status": "active"
  }));
});

// 9. Buggy Buddy
rows.push(makeRow({
  "Handle": "in-a-world-where-you-can-be-anything-be-kind-buggy-buddy",
  "Title": "In a world where you can be anything... Be Kind - Buggy Buddy with key ring, chain & clip",
  "Body (HTML)": '<p>Never lose your shopping cart quarter or keys again! The signature <strong>Suzy Toronto Buggy Buddy</strong> attaches securely to your purse, diaper bag, or keychain.</p><ul><li><strong>Includes:</strong> Sturdy metal swivel clip, heavy-duty key ring, and durable pouch.</li><li><strong>Message:</strong> <em>"In a world where you can be anything... Be Kind."</em></li><li><strong>Dimensions:</strong> 3.5" x 2.5"</li></ul>',
  "Vendor": "Suzy Toronto",
  "Type": "Buggy Buddies",
  "Tags": "Buggy Buddy, Keychain, Be Kind, Purse Accessories, Stocking Stuffer",
  "Published": "TRUE",
  "Option1 Name": "Title",
  "Option1 Value": "Default Title",
  "Variant SKU": "BB867",
  "Variant Grams": "60",
  "Variant Inventory Tracker": "shopify",
  "Variant Inventory Qty": "200",
  "Variant Inventory Policy": "deny",
  "Variant Fulfillment Service": "manual",
  "Variant Price": "7.95",
  "Variant Requires Shipping": "TRUE",
  "Variant Taxable": "TRUE",
  "Image Src": "https://suzytoronto.com/wp-content/uploads/2019/09/C867_Be-Kind_OPT.jpg",
  "Image Position": "1",
  "Image Alt Text": "Be Kind Buggy Buddy Keychain Clip",
  "Gift Card": "FALSE",
  "SEO Title": "Be Kind Buggy Buddy Keychain | Suzy Toronto",
  "SEO Description": "Suzy Toronto Buggy Buddy with swivel clip and key ring featuring 'In a world where you can be anything... Be Kind'.",
  "Variant Weight Unit": "lb",
  "Status": "active"
}));

// 10. Can Cooler
rows.push(makeRow({
  "Handle": "stainless-steel-multifunctional-16oz-can-cooler-crazy-brave-and-wicked-strong",
  "Title": "Stainless Steel Multifunctional 16oz Can Cooler - Crazy Brave and Wicked Strong",
  "Body (HTML)": '<p>Keep your drinks icy cold while staying motivated! This 4-in-1 stainless steel can cooler holds standard 12oz cans, slim cans, beer bottles, or functions as a 16oz travel tumbler with included lid.</p><ul><li><strong>Material:</strong> Double-wall vacuum insulated stainless steel.</li><li><strong>Design:</strong> Vibrant full-color Suzy Toronto illustration with non-fade finish.</li><li><strong>Care:</strong> Hand wash recommended. Fits standard car cup holders.</li></ul>',
  "Vendor": "Suzy Toronto",
  "Type": "Drinkware",
  "Tags": "Drinkware, Can Cooler, Tumbler, Stainless Steel, Inspirational, Fitness",
  "Published": "TRUE",
  "Option1 Name": "Title",
  "Option1 Value": "Default Title",
  "Variant SKU": "SCT748",
  "Variant Grams": "320",
  "Variant Inventory Tracker": "shopify",
  "Variant Inventory Qty": "75",
  "Variant Inventory Policy": "deny",
  "Variant Fulfillment Service": "manual",
  "Variant Price": "19.95",
  "Variant Requires Shipping": "TRUE",
  "Variant Taxable": "TRUE",
  "Image Src": "https://suzytoronto.com/wp-content/uploads/2025/09/PLN2026_OPT.jpg",
  "Image Position": "1",
  "Image Alt Text": "Crazy Brave Stainless Steel Can Cooler",
  "Gift Card": "FALSE",
  "SEO Title": "Crazy Brave & Wicked Strong 16oz Stainless Can Cooler",
  "SEO Description": "Multifunctional 16oz stainless steel can cooler and tumbler by Suzy Toronto.",
  "Variant Weight Unit": "lb",
  "Status": "active"
}));

// 11. Art Print
rows.push(makeRow({
  "Handle": "gathering-of-the-goddesses-8x10-matted-art-print",
  "Title": 'Gathering of the Goddesses (with story on front) - 8 x 10 Matted "Gifty" Art Print',
  "Body (HTML)": '<p>Celebrate sisterhood and friendship with Suzy Toronto\'s famous <strong>"Gathering of the Goddesses"</strong> art print.</p><ul><li><strong>Size:</strong> 8" x 10" double-matted print (fits standard 8x10 frame).</li><li><strong>Details:</strong> Features Suzy\'s heartwarming story printed directly on the front border. Ready to gift or frame!</li><li><strong>Packaging:</strong> Sealed in clear protective sleeve with backing board.</li></ul>',
  "Vendor": "Suzy Toronto",
  "Type": "Art Prints",
  "Tags": "Art Print, Matted Print, Sisterhood, Goddesses, 8x10, Wall Decor",
  "Published": "TRUE",
  "Option1 Name": "Title",
  "Option1 Value": "Default Title",
  "Variant SKU": "PRT100",
  "Variant Grams": "200",
  "Variant Inventory Tracker": "shopify",
  "Variant Inventory Qty": "120",
  "Variant Inventory Policy": "deny",
  "Variant Fulfillment Service": "manual",
  "Variant Price": "14.95",
  "Variant Requires Shipping": "TRUE",
  "Variant Taxable": "TRUE",
  "Image Src": "https://suzytoronto.com/wp-content/uploads/2019/09/C914_Gathering-of-the-Goddesses_OPT-2.jpg",
  "Image Position": "1",
  "Image Alt Text": "Gathering of the Goddesses Matted Print",
  "Gift Card": "FALSE",
  "SEO Title": "Gathering of the Goddesses 8x10 Matted Print | Suzy Toronto",
  "SEO Description": "8x10 matted art print featuring Suzy Toronto's 'Gathering of the Goddesses' illustration and story.",
  "Variant Weight Unit": "lb",
  "Status": "active"
}));

// 12. Post-It Notes
rows.push(makeRow({
  "Handle": "pretending-to-be-a-normal-person-sticky-tingles-post-it-notes",
  "Title": 'Pretending to be a Normal Person Day After Day is Exhausting - "Sticky Tingles" 3M Post-it Notes',
  "Body (HTML)": '<p>Add humor to your workday with genuine 3M Post-it Notes featuring Suzy Toronto\'s whimsical art.</p><ul><li><strong>Count:</strong> 50 self-adhesive sticky notes per pad.</li><li><strong>Quality:</strong> Genuine 3M Post-it adhesive backing that holds firm without leaving residue.</li><li><strong>Dimensions:</strong> 3" x 4"</li></ul>',
  "Vendor": "Suzy Toronto",
  "Type": "Stationery & Post-It Notes",
  "Tags": "Post-It Notes, Sticky Tingles, Office Supplies, Humorous Gifts, Stationery",
  "Published": "TRUE",
  "Option1 Name": "Title",
  "Option1 Value": "Default Title",
  "Variant SKU": "LS524",
  "Variant Grams": "45",
  "Variant Inventory Tracker": "shopify",
  "Variant Inventory Qty": "300",
  "Variant Inventory Policy": "deny",
  "Variant Fulfillment Service": "manual",
  "Variant Price": "4.95",
  "Variant Requires Shipping": "TRUE",
  "Variant Taxable": "TRUE",
  "Image Src": "https://suzytoronto.com/wp-content/uploads/2023/04/BMK524_OPT3.png",
  "Image Position": "1",
  "Image Alt Text": "Pretending to be Normal Post-It Notes",
  "Gift Card": "FALSE",
  "SEO Title": "Pretending to be Normal Sticky Notes | Suzy Toronto",
  "SEO Description": "Humorous 50-sheet 3M Post-It note pad by Suzy Toronto.",
  "Variant Weight Unit": "lb",
  "Status": "active"
}));

// 13. Car Coasters
rows.push(makeRow({
  "Handle": "in-a-world-where-you-can-be-anything-be-kind-car-cup-coaster-2-pack",
  "Title": "In a world where you can be anything... Be Kind - Car Cup Coaster (2 pack)",
  "Body (HTML)": '<p>Protect your car\'s cup holders in style! ABSORBENT ceramic coasters soak up condensation and leaks while displaying cheerful art.</p><ul><li><strong>Quantity:</strong> Pack of 2 matching car coasters.</li><li><strong>Size:</strong> Standard 2.56" diameter with convenient finger notch for easy removal and cleaning.</li><li><strong>Material:</strong> Absorbent stone ceramic with durable graphic printing.</li></ul>',
  "Vendor": "Suzy Toronto",
  "Type": "Coasters",
  "Tags": "Car Coasters, Coasters, Car Accessories, Be Kind, Gift Pack",
  "Published": "TRUE",
  "Option1 Name": "Title",
  "Option1 Value": "Default Title",
  "Variant SKU": "CC867",
  "Variant Grams": "90",
  "Variant Inventory Tracker": "shopify",
  "Variant Inventory Qty": "180",
  "Variant Inventory Policy": "deny",
  "Variant Fulfillment Service": "manual",
  "Variant Price": "7.95",
  "Variant Requires Shipping": "TRUE",
  "Variant Taxable": "TRUE",
  "Image Src": "https://suzytoronto.com/wp-content/uploads/2019/09/C867_Be-Kind_OPT.jpg",
  "Image Position": "1",
  "Image Alt Text": "Be Kind Car Cup Coasters 2 Pack",
  "Gift Card": "FALSE",
  "SEO Title": "Be Kind Absorbent Car Cup Coasters (2-Pack) | Suzy Toronto",
  "SEO Description": "Set of 2 absorbent stone car cup holder coasters with finger notch by Suzy Toronto.",
  "Variant Weight Unit": "lb",
  "Status": "active"
}));

// 14. Magnetic Memo Pad (Expanded MMP)
rows.push(makeRow({
  "Handle": "dont-let-anyone-dull-your-sparkle-magnetic-memo-pad",
  "Title": "Don't Let Anyone Dull Your Sparkle - Magnetic Memo Pad",
  "Body (HTML)": '<p>Keep grocery lists, daily reminders, and happy notes right on your refrigerator!</p><ul><li><strong>Includes:</strong> Heavy-duty magnetic strip on the back.</li><li><strong>Count:</strong> 60 lined pages with full-color artwork header.</li><li><strong>Size:</strong> 4.25" x 8.5"</li></ul>',
  "Vendor": "Suzy Toronto",
  "Type": "Stationery & Memo Pads",
  "Tags": "Magnetic Memo Pad, Memo Pad, Kitchen Accessories, Sparkle, Stationery",
  "Published": "TRUE",
  "Option1 Name": "Title",
  "Option1 Value": "Default Title",
  "Variant SKU": "MMP609",
  "Variant Grams": "110",
  "Variant Inventory Tracker": "shopify",
  "Variant Inventory Qty": "140",
  "Variant Inventory Policy": "deny",
  "Variant Fulfillment Service": "manual",
  "Variant Price": "7.95",
  "Variant Requires Shipping": "TRUE",
  "Variant Taxable": "TRUE",
  "Image Src": "https://suzytoronto.com/wp-content/uploads/2022/10/MMP891_OPT3.png",
  "Image Position": "1",
  "Image Alt Text": "Don't Let Anyone Dull Your Sparkle Magnetic Memo Pad",
  "Gift Card": "FALSE",
  "SEO Title": "Don't Let Anyone Dull Your Sparkle Magnetic Memo Pad | Suzy Toronto",
  "SEO Description": "60-page magnetic memo pad for fridge and kitchen by Suzy Toronto.",
  "Variant Weight Unit": "lb",
  "Status": "active"
}));

// 15. Bookmark (Expanded BMK)
rows.push(makeRow({
  "Handle": "kindred-spirits-forever-friends-bookmark",
  "Title": "Kindred Spirits... Forever Friends - Bookmark",
  "Body (HTML)": '<p>Never lose your place in your favorite book! Includes Suzy\'s full poem on the back and a silky tassel attachment.</p><ul><li><strong>Material:</strong> Heavy laminated cardstock with rounded corners.</li><li><strong>Extra Feature:</strong> Includes matching tassel and heart charm.</li><li><strong>Size:</strong> 2.5" x 7"</li></ul>',
  "Vendor": "Suzy Toronto",
  "Type": "Bookmarks",
  "Tags": "Bookmark, Reading, Friendship, Kindred Spirits, Gifts Under $5",
  "Published": "TRUE",
  "Option1 Name": "Title",
  "Option1 Value": "Default Title",
  "Variant SKU": "BMK229",
  "Variant Grams": "15",
  "Variant Inventory Tracker": "shopify",
  "Variant Inventory Qty": "400",
  "Variant Inventory Policy": "deny",
  "Variant Fulfillment Service": "manual",
  "Variant Price": "3.95",
  "Variant Requires Shipping": "TRUE",
  "Variant Taxable": "TRUE",
  "Image Src": "https://suzytoronto.com/wp-content/uploads/2023/04/BMK229_OPT3.png",
  "Image Position": "1",
  "Image Alt Text": "Kindred Spirits Bookmark with Tassel",
  "Gift Card": "FALSE",
  "SEO Title": "Kindred Spirits Forever Friends Bookmark | Suzy Toronto",
  "SEO Description": "Laminated bookmark with tassel featuring Suzy Toronto's Kindred Spirits artwork and story.",
  "Variant Weight Unit": "lb",
  "Status": "active"
}));

// 16. Luggage Tag (Expanded TAG)
rows.push(makeRow({
  "Handle": "this-is-not-your-bag-luggage-bag-tag",
  "Title": "This is NOT Your Bag! - Luggage Bag Tag",
  "Body (HTML)": '<p>Spot your luggage instantly on the airport carousel with this bold and hilarious bag tag!</p><ul><li><strong>Material:</strong> Durable thick flex-PVC vinyl with clear ID window on back.</li><li><strong>Includes:</strong> Heavy-duty clear plastic attachment loop.</li><li><strong>Size:</strong> 4.25" x 2.75"</li></ul>',
  "Vendor": "Suzy Toronto",
  "Type": "Travel Accessories",
  "Tags": "Luggage Bag Tag, Travel Accessories, Bag Tag, Humorous Gifts",
  "Published": "TRUE",
  "Option1 Name": "Title",
  "Option1 Value": "Default Title",
  "Variant SKU": "TAG524",
  "Variant Grams": "40",
  "Variant Inventory Tracker": "shopify",
  "Variant Inventory Qty": "220",
  "Variant Inventory Policy": "deny",
  "Variant Fulfillment Service": "manual",
  "Variant Price": "8.95",
  "Variant Requires Shipping": "TRUE",
  "Variant Taxable": "TRUE",
  "Image Src": "https://suzytoronto.com/wp-content/uploads/2019/09/TAG533_OPT.jpg",
  "Image Position": "1",
  "Image Alt Text": "This is NOT Your Bag Luggage Tag",
  "Gift Card": "FALSE",
  "SEO Title": "This is NOT Your Bag Luggage Bag Tag | Suzy Toronto",
  "SEO Description": "Durable vinyl luggage tag by Suzy Toronto featuring 'This is NOT Your Bag!'.",
  "Variant Weight Unit": "lb",
  "Status": "active"
}));

// 17. Keychain (Expanded KC)
rows.push(makeRow({
  "Handle": "dont-let-anyone-dull-your-sparkle-key-chain",
  "Title": "Don't Let Anyone Dull Your Sparkle - Key Chain",
  "Body (HTML)": '<p>Carry inspiration everywhere you go with this vibrant acrylic keyring featuring Suzy Toronto\'s classic \'Sparkle\' artwork.</p><ul><li><strong>Material:</strong> Double-sided acrylic with sturdy steel key ring and clip.</li><li><strong>Size:</strong> 2.5" diameter graphic emblem.</li></ul>',
  "Vendor": "Suzy Toronto",
  "Type": "Keychains & Accessories",
  "Tags": "Key Chain, Accessories, Sparkle, Gift Ideas",
  "Published": "TRUE",
  "Option1 Name": "Title",
  "Option1 Value": "Default Title",
  "Variant SKU": "KC609",
  "Variant Grams": "35",
  "Variant Inventory Tracker": "shopify",
  "Variant Inventory Qty": "160",
  "Variant Inventory Policy": "deny",
  "Variant Fulfillment Service": "manual",
  "Variant Price": "7.95",
  "Variant Requires Shipping": "TRUE",
  "Variant Taxable": "TRUE",
  "Image Src": "https://suzytoronto.com/wp-content/uploads/2022/04/KC511-OPT.jpg",
  "Image Position": "1",
  "Image Alt Text": "Don't Let Anyone Dull Your Sparkle Key Chain",
  "Gift Card": "FALSE",
  "SEO Title": "Don't Let Anyone Dull Your Sparkle Key Chain | Suzy Toronto",
  "SEO Description": "Acrylic keychain with metal ring by Suzy Toronto.",
  "Variant Weight Unit": "lb",
  "Status": "active"
}));

// 18. Note Cards
rows.push(makeRow({
  "Handle": "from-the-bottom-of-my-wild-wacky-heart-thanks-a-bunch-note-cards-8-pack",
  "Title": "From the bottom of my wild wacky heart. Thanks a Bunch - Note Cards (8 Pack)",
  "Body (HTML)": '<p>Send heartfelt thanks with Suzy Toronto\'s whimsical note card set.</p><ul><li><strong>Quantity:</strong> 8 folded note cards & 8 matching envelopes.</li><li><strong>Interior:</strong> Blank inside for your personalized message.</li><li><strong>Size:</strong> 4.25" x 5.5" (A2 size)</li></ul>',
  "Vendor": "Suzy Toronto",
  "Type": "Greeting Cards & Note Cards",
  "Tags": "Note Cards, Greeting Cards, Gratitude, Cards 8-Pack, Stationery",
  "Published": "TRUE",
  "Option1 Name": "Title",
  "Option1 Value": "Default Title",
  "Variant SKU": "NC412",
  "Variant Grams": "180",
  "Variant Inventory Tracker": "shopify",
  "Variant Inventory Qty": "90",
  "Variant Inventory Policy": "deny",
  "Variant Fulfillment Service": "manual",
  "Variant Price": "9.95",
  "Variant Requires Shipping": "TRUE",
  "Variant Taxable": "TRUE",
  "Image Src": "https://suzytoronto.com/wp-content/uploads/2019/10/NC412_OPT.jpg",
  "Image Position": "1",
  "Image Alt Text": "Thanks a Bunch Note Cards 8 Pack",
  "Gift Card": "FALSE",
  "SEO Title": "Thanks a Bunch 8-Pack Note Cards | Suzy Toronto",
  "SEO Description": "Set of 8 blank folded thank-you note cards with envelopes by Suzy Toronto.",
  "Variant Weight Unit": "lb",
  "Status": "active"
}));

const headerLine = headers.map(h => escapeCSV(h)).join(',');
const contentLines = rows.map(r => r.join(','));
const csvString = [headerLine, ...contentLines].join('\n');

const outputPath = path.join(__dirname, 'suzy_toronto_shopify_import.csv');
fs.writeFileSync(outputPath, csvString, 'utf8');
console.log('Successfully written strict RFC 4180 CSV with verified image URLs to:', outputPath);
