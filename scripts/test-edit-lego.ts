/**
 * Test editing the LEGO product to reproduce the session close bug
 * Usage: NODE_ENV=development npx tsx scripts/test-edit-lego.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load env first
config({ path: resolve(process.cwd(), '.env.local') });

import { db, products } from '../src/lib/db';
import { like, eq } from 'drizzle-orm';
import { updateProduct } from '../src/lib/products';
import { updateProductSchema } from '../src/lib/validations/product';

async function main() {
  console.log('🧪 Test: Modification du produit LEGO\n');

  try {
    // 1. Find the LEGO product
    const [legoProduct] = await db
      .select()
      .from(products)
      .where(like(products.name, '%LEGO%'))
      .limit(1);

    if (!legoProduct) {
      console.log('❌ Produit LEGO non trouvé');
      return;
    }

    console.log('✅ Produit trouvé:');
    console.log(`   ID: ${legoProduct.id}`);
    console.log(`   Nom: ${legoProduct.name}`);
    console.log(`   Slug: ${legoProduct.slug}\n`);

    // 2. Prepare update payload (simulate what the form sends)
    const payload = {
      slug: legoProduct.slug, // Keep same slug
      name: legoProduct.name, // Keep same name
      description: legoProduct.description,
      priceCents: legoProduct.priceCents,
      shippingCents: legoProduct.shippingCents,
      stockQuantity: legoProduct.stockQuantity,
      stockAlertThreshold: legoProduct.stockAlertThreshold,
      weightGrams: legoProduct.weightGrams ?? undefined,
      tags: legoProduct.tags?.join(',') ?? undefined,
      badges: legoProduct.badges?.join(',') ?? undefined,
      payfipProductCode: legoProduct.payfipProductCode,
      editionNumber: legoProduct.editionNumber ?? undefined,
      editionTotal: legoProduct.editionTotal ?? undefined,
      active: legoProduct.active,
      featured: legoProduct.featured,
      showInCollectionPage: legoProduct.showInCollectionPage,
      sizes: legoProduct.sizes ?? [],
    };

    console.log('📤 Payload de mise à jour:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('');

    // 3. Validate payload with Zod
    console.log('🔍 Validation Zod...');
    const validation = updateProductSchema.safeParse(payload);

    if (!validation.success) {
      console.error('❌ Validation Zod échouée:');
      console.error(JSON.stringify(validation.error.issues, null, 2));
      return;
    }

    console.log('✅ Validation Zod réussie\n');

    // 4. Try to update
    console.log('💾 Tentative de mise à jour...');
    const updated = await updateProduct(legoProduct.id, validation.data);

    console.log('✅ Mise à jour réussie!');
    console.log(`   Nom final: ${updated.name}`);
    console.log(`   Slug final: ${updated.slug}\n`);
  } catch (error: any) {
    console.error('❌ ERREUR CRITIQUE:');
    console.error(`   Message: ${error.message}`);
    if (error.stack) {
      console.error(`   Stack:\n${error.stack}`);
    }
  }
}

main()
  .then(() => {
    console.log('\n✅ Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
