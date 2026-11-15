import 'dotenv/config';

interface ShopCategory {
  name: string;
  description: string;
}

const API_URL = 'http://localhost:3001/';

// Add your Super Admin JWT access token here
const ADMIN_TOKEN = 'ACCESS_TOKEN'

interface ShopCategory {
  name: string;
  description: string;
}

const shopCategories: ShopCategory[] = [
  {
    name: 'Fashion & Clothing',
    description:
      "Shops selling men's, women's, and children's clothing, footwear, and fashion accessories.",
  },
  {
    name: 'Beauty & Personal Care',
    description:
      'Shops selling skincare, cosmetics, makeup, perfumes, and personal care products.',
  },
  {
    name: 'Home & Furniture',
    description:
      'Shops selling furniture, home decor, kitchenware, and household essentials.',
  },
  {
    name: 'Grocery & Supermarket',
    description:
      'Shops selling groceries, fresh produce, packaged foods, and daily essentials.',
  },
  {
    name: 'Sports & Fitness',
    description:
      'Shops selling sports equipment, gym accessories, fitness products, and sportswear.',
  },
  {
    name: 'Health & Pharmacy',
    description:
      'Shops selling healthcare products, medical supplies, and pharmacy items.',
  },
  {
    name: 'Books & Stationery',
    description:
      'Shops selling books, notebooks, office supplies, and educational materials.',
  },
  {
    name: 'Toys & Baby Products',
    description:
      "Shops selling toys, baby clothing, feeding products, and children's essentials.",
  },
  {
    name: 'Jewelry & Accessories',
    description:
      'Shops selling jewelry, watches, handbags, and fashion accessories.',
  },
  {
    name: 'Automotive',
    description:
      'Shops selling car and motorcycle accessories, spare parts, and automotive products.',
  },
  {
    name: 'Food & Beverages',
    description:
      'Shops selling snacks, beverages, bakery items, and specialty foods.',
  },
  {
    name: 'Pet Supplies',
    description:
      'Shops selling pet food, toys, grooming products, and pet accessories.',
  },
  {
    name: 'Hardware & Tools',
    description:
      'Shops selling construction materials, hardware, tools, and DIY supplies.',
  },
  {
    name: 'Gifts & Crafts',
    description:
      'Shops selling gift items, handmade products, decorations, and crafts.',
  },
  {
    name: 'Other',
    description:
      "Shops that don't fit into the available marketplace categories.",
  },
];

async function seedShopCategories() {
  let created = 0;
  let skipped = 0;
  let failed = 0;

  console.log('Starting shop categories seed...\n');

  for (const category of shopCategories) {
    try {
      const response = await fetch(`${API_URL}api/v1/admin/shop-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `access_token=${ADMIN_TOKEN}`,
        },
        body: JSON.stringify(category),
      });

      const responseBody = await response.text();

      if (response.status === 409) {
        skipped++;
        console.log(`Skipped: ${category.name} (already exists)`);
        continue;
      }

      if (!response.ok) {
        failed++;
        console.error(
          `Failed: ${category.name}`,
          response.status,
          responseBody,
        );
        continue;
      }

      created++;
      console.log(`Created: ${category.name}`);
    } catch (error) {
      failed++;
      console.error(`Error creating ${category.name}:`, error);
    }
  }

  console.log('\n========== SEED SUMMARY ==========');
  console.log(`Total: ${shopCategories.length}`);
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log('==================================');
}

seedShopCategories().catch((error) => {
  console.error('Shop categories seed failed:', error);
});
