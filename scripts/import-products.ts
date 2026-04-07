// scripts/import-products.ts
import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Load .env.local FIRST
config({ path: '.env.local' });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found after loading .env.local');
  console.error('   Make sure DATABASE_URL is defined in .env.local');
  process.exit(1);
}

console.log('✅ DATABASE_URL loaded');

// Now import db (after env vars are set)
async function importProducts() {
  const { db } = await import('../src/lib/db');
  const { products } = await import('../src/lib/db/schema-products');

  const productsData = JSON.parse(readFileSync('/tmp/products_import.json', 'utf8'));

  console.log('🚀 Import de', productsData.length, 'produits...\n');

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ product: string; error: string }> = [];

  for (const product of productsData) {
    try {
      // Parse tags string to array
      const tagsArray = product.tags ? product.tags.split(',').map((t: string) => t.trim()) : [];

      await db.insert(products).values({
        slug: product.slug,
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        shippingCents: product.shippingCents,
        stockQuantity: product.stockQuantity,
        stockAlertThreshold: product.stockAlertThreshold,
        tags: tagsArray,
        active: product.active,
        payfipProductCode: product.payfipProductCode,
        images: [],
      });

      successCount++;
      console.log(`✅ ${product.name} (${product.tags})`);
    } catch (err: any) {
      errorCount++;
      errors.push({ product: product.name, error: err.message });
      console.log(`❌ ${product.name}: ${err.message.substring(0, 80)}`);
    }
  }

  console.log('\n📊 Résultat de l\'import:');
  console.log(`   ✅ Succès: ${successCount}/${productsData.length}`);
  console.log(`   ❌ Erreurs: ${errorCount}/${productsData.length}`);

  if (errors.length > 0 && errors.length <= 10) {
    console.log('\n⚠️  Détails des erreurs:');
    errors.forEach(e => {
      console.log(`   - ${e.product}:`);
      console.log(`     ${e.error.substring(0, 150)}`);
    });
  }
}

importProducts()
  .then(() => {
    console.log('\n✅ Import terminé !');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erreur fatale:', err);
    process.exit(1);
  });
