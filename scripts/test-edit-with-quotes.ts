/**
 * Test editing the LEGO product WITH QUOTES in the name
 * This reproduces the user's reported issue
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load env first
config({ path: resolve(process.cwd(), '.env.local') });

import { db, products } from '../src/lib/db';
import { like } from 'drizzle-orm';
import { updateProduct } from '../src/lib/products';
import { updateProductSchema } from '../src/lib/validations/product';

async function main() {
  console.log('🧪 Test: Modification avec guillemets dans le nom\n');

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
    console.log(`   Nom actuel: ${legoProduct.name}`);
    console.log(`   Slug actuel: ${legoProduct.slug}\n`);

    // 2. Try to update with QUOTES in the name (the reported issue)
    const newName = 'Set de LEGO "Pont du Port à l\'Anglais"';

    console.log(`🔄 Tentative de renommage vers: ${newName}\n`);

    const payload = {
      slug: legoProduct.slug, // Keep same slug
      name: newName, // NEW NAME WITH QUOTES
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

    // 3. Validate payload
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
    console.log(`   Slug final: ${updated.slug}`);

    // 5. Test serialization of updated product
    console.log('\n🧪 Test de sérialization du produit mis à jour...');
    try {
      const serialized = JSON.stringify(updated);
      console.log(`✅ Sérialization réussie (${serialized.length} bytes)`);

      const parsed = JSON.parse(serialized);
      console.log(`✅ Parsing réussi`);
      console.log(`   Nom après parsing: ${parsed.name}`);
    } catch (e: any) {
      console.error('❌ Erreur de sérialization:', e.message);
    }

  } catch (error: any) {
    console.error('\n❌ ERREUR CRITIQUE:');
    console.error(`   Type: ${error.constructor.name}`);
    console.error(`   Message: ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.stack) {
      console.error(`\n   Stack:\n${error.stack}`);
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
