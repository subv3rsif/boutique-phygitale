/**
 * Test Server-Side Rendering of LEGO product edit page
 * Simulates what happens when the edit page loads
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load env first
config({ path: resolve(process.cwd(), '.env.local') });

import { getProductById } from '../src/lib/products';

async function main() {
  console.log('🧪 Test: SSR rendering du produit LEGO\n');

  const LEGO_PRODUCT_ID = '7e7aee03-068f-4cce-a609-de3b7dc61b89';

  try {
    // Simulate what the edit page does
    console.log('1. Fetching product by ID...');
    const product = await getProductById(LEGO_PRODUCT_ID);

    if (!product) {
      console.log('❌ Product not found (would trigger notFound())');
      return;
    }

    console.log('✅ Product fetched successfully\n');

    // 2. Test serialization (Server → Client boundary)
    console.log('2. Testing JSON serialization (Server → Client)...');
    try {
      const serialized = JSON.stringify(product);
      console.log(`✅ Serialization OK (${serialized.length} bytes)\n`);

      // Try parsing back
      const parsed = JSON.parse(serialized);
      console.log('✅ Deserialization OK\n');

      // 3. Check for non-serializable values
      console.log('3. Checking for problematic values...');
      const issues: string[] = [];

      Object.entries(product).forEach(([key, value]) => {
        if (value === undefined) {
          issues.push(`${key}: undefined (not JSON serializable)`);
        }
        if (typeof value === 'function') {
          issues.push(`${key}: function (not JSON serializable)`);
        }
        if (value instanceof Date) {
          // Dates are serializable but might lose timezone info
          console.log(`ℹ️  ${key}: Date object (will be stringified)`);
        }
        if (value === null) {
          console.log(`ℹ️  ${key}: null`);
        }
      });

      if (issues.length > 0) {
        console.log('\n⚠️  Problèmes détectés:');
        issues.forEach((issue) => console.log(`   - ${issue}`));
      } else {
        console.log('✅ Aucun problème de sérialization détecté\n');
      }

      // 4. Test what ProductForm receives
      console.log('4. Simulating ProductForm props...');
      const formProps = {
        mode: 'edit' as const,
        product: parsed,
      };

      console.log('✅ Form props created successfully\n');

      // 5. Check specific fields that might be problematic
      console.log('5. Checking potentially problematic fields:');
      console.log(`   - tags: ${JSON.stringify(product.tags)}`);
      console.log(`   - badges: ${JSON.stringify(product.badges)}`);
      console.log(`   - images: ${product.images?.length || 0} items`);
      console.log(`   - sizes: ${product.sizes?.length || 0} items`);
      console.log('');

    } catch (serErr: any) {
      console.error('❌ SERIALIZATION ERROR:');
      console.error(serErr.message);
      throw serErr;
    }

    console.log('✅ Tous les tests passés - le produit devrait se charger correctement');

  } catch (error: any) {
    console.error('\n❌ ERREUR:');
    console.error(`Message: ${error.message}`);
    if (error.stack) {
      console.error(`Stack:\n${error.stack}`);
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
