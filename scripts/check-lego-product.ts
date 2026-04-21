/**
 * Script to check LEGO product data directly from DB
 * Usage: NODE_ENV=development npx tsx scripts/check-lego-product.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load env first
config({ path: resolve(process.cwd(), '.env.local') });

import { db, products } from '../src/lib/db';
import { like } from 'drizzle-orm';

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
      console.log(`Description: ${product.description?.substring(0, 100)}...`);
      console.log(`Active: ${product.active}`);
      console.log(`Featured: ${product.featured}`);
      console.log(`Tags: ${JSON.stringify(product.tags)}`);
      console.log(`Badges: ${JSON.stringify(product.badges)}`);
      console.log(`Images count: ${product.images?.length || 0}`);
      console.log(`Stock: ${product.stockQuantity}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Test serialization
      try {
        const serialized = JSON.stringify(product);
        console.log('✅ Sérialization JSON réussie');
        console.log(`Taille: ${serialized.length} caractères\n`);

        // Test parsing it back
        const parsed = JSON.parse(serialized);
        console.log('✅ Parsing JSON réussi');
        console.log(`Nom après parsing: ${parsed.name}\n`);

        // Check for weird characters
        const nameChars = product.name.split('').map((c, i) => ({
          char: c,
          code: c.charCodeAt(0),
          index: i,
        }));

        console.log('🔎 Analyse caractères du nom:');
        const specialChars = nameChars.filter(
          ({ code }) =>
            code < 32 || // Control characters
            (code >= 127 && code < 160) || // Extended control
            code === 34 || // Double quote
            code === 39 || // Single quote
            code > 591 // High unicode
        );

        if (specialChars.length > 0) {
          console.log('⚠️  Caractères spéciaux détectés:');
          specialChars.forEach(({ char, code, index }) => {
            console.log(
              `  Position ${index}: "${char}" (code: ${code}, hex: 0x${code.toString(16)})`
            );
          });
        } else {
          console.log('✅ Aucun caractère spécial problématique');
        }
        console.log('');
      } catch (e: any) {
        console.error('❌ ERREUR lors de la sérialization/parsing JSON:');
        console.error(e.message);
      }
    }
  } catch (error: any) {
    console.error('❌ ERREUR lors de la requête DB:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
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
