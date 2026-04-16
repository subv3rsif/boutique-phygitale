/**
 * Script de test pour diagnostiquer le problème du produit LEGO
 * Usage: npx tsx scripts/test-lego-product.ts
 */

import { db, products } from '../src/lib/db';
import { eq, like } from 'drizzle-orm';

async function main() {
  console.log('🔍 Recherche du produit LEGO...\n');

  try {
    // Find product by name pattern
    const legoProducts = await db
      .select()
      .from(products)
      .where(like(products.name, '%LEGO%'));

    if (legoProducts.length === 0) {
      console.log('❌ Aucun produit LEGO trouvé dans la base de données');
      return;
    }

    console.log(`✅ ${legoProducts.length} produit(s) LEGO trouvé(s):\n`);

    for (const product of legoProducts) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`ID: ${product.id}`);
      console.log(`Slug: ${product.slug}`);
      console.log(`Name: ${product.name}`);
      console.log(`Description: ${product.description?.substring(0, 50)}...`);
      console.log(`Active: ${product.active}`);
      console.log(`Featured: ${product.featured}`);
      console.log(`Tags: ${JSON.stringify(product.tags)}`);
      console.log(`Badges: ${JSON.stringify(product.badges)}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Test serialization (what happens when it's sent as JSON)
      try {
        const serialized = JSON.stringify(product);
        console.log('✅ Sérialization JSON réussie');
        console.log(`Taille: ${serialized.length} caractères\n`);

        // Test parsing it back
        const parsed = JSON.parse(serialized);
        console.log('✅ Parsing JSON réussi');
        console.log(`Nom après parsing: ${parsed.name}\n`);
      } catch (e: any) {
        console.error('❌ ERREUR lors de la sérialization/parsing JSON:');
        console.error(e.message);
      }
    }
  } catch (error: any) {
    console.error('❌ ERREUR lors de la requête DB:');
    console.error(error.message);
    console.error(error.stack);
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
