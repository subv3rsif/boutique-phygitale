/**
 * Check LEGO product images URLs
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load env first
config({ path: resolve(process.cwd(), '.env.local') });

import { db, products } from '../src/lib/db';
import { like } from 'drizzle-orm';

async function main() {
  console.log('🔍 Vérification des images du produit LEGO...\n');

  try {
    const [legoProduct] = await db
      .select()
      .from(products)
      .where(like(products.name, '%LEGO%'))
      .limit(1);

    if (!legoProduct) {
      console.log('❌ Produit LEGO non trouvé');
      return;
    }

    console.log(`Produit: ${legoProduct.name}`);
    console.log(`Nombre d'images: ${legoProduct.images?.length || 0}\n`);

    if (!legoProduct.images || legoProduct.images.length === 0) {
      console.log('ℹ️  Aucune image pour ce produit');
      return;
    }

    console.log('Images:');
    legoProduct.images.forEach((img, index) => {
      console.log(`\n${index + 1}. Image ${img.isPrimary ? '(PRIMARY)' : ''}`);
      console.log(`   URL: ${img.url}`);
      console.log(`   Path: ${img.path}`);
      console.log(`   Order: ${img.order}`);

      // Check for potential issues
      const issues: string[] = [];

      if (!img.url) {
        issues.push('⚠️  URL is empty or null');
      } else {
        if (!img.url.startsWith('http://') && !img.url.startsWith('https://')) {
          if (!img.url.startsWith('/')) {
            issues.push('⚠️  URL is not absolute and does not start with /');
          }
        }
      }

      if (!img.path) {
        issues.push('⚠️  Path is empty or null');
      }

      if (typeof img.order !== 'number') {
        issues.push('⚠️  Order is not a number');
      }

      if (typeof img.isPrimary !== 'boolean') {
        issues.push('⚠️  isPrimary is not a boolean');
      }

      if (issues.length > 0) {
        console.log('   Issues:');
        issues.forEach((issue) => console.log(`     ${issue}`));
      } else {
        console.log('   ✅ No issues detected');
      }
    });

    // Test JSON serialization of images
    console.log('\n🧪 Test de sérialization des images...');
    try {
      const serialized = JSON.stringify(legoProduct.images);
      console.log(`✅ Sérialization réussie (${serialized.length} bytes)`);

      const parsed = JSON.parse(serialized);
      console.log(`✅ Parsing réussi (${parsed.length} images)`);
    } catch (e: any) {
      console.error('❌ Erreur de sérialization:', e.message);
    }
  } catch (error: any) {
    console.error('❌ ERREUR:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

main()
  .then(() => {
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
