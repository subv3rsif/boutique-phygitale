/**
 * Revert LEGO image URLs back to old slug path
 * Since we can't move files in Supabase Storage via script,
 * we need to keep URLs pointing to the old path
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { db, products } from '../src/lib/db';
import { like, eq } from 'drizzle-orm';

async function main() {
  console.log('🔄 Revert des URLs d\'images LEGO\n');

  const [legoProduct] = await db
    .select()
    .from(products)
    .where(like(products.name, '%LEGO%'))
    .limit(1);

  if (!legoProduct) {
    console.log('❌ Produit non trouvé');
    return;
  }

  const oldSlug = 'set-de-lego-pont-du-port-a-l-anglais'; // Original slug where images are stored
  const currentSlug = legoProduct.slug;

  console.log(`Slug actuel: "${currentSlug}"`);
  console.log(`Slug original (stockage images): "${oldSlug}"`);

  if (legoProduct.images && legoProduct.images.length > 0) {
    console.log(`\nImages actuelles (${legoProduct.images.length}):`);
    legoProduct.images.forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.url}`);
    });

    // Revert URLs to use old slug (where files actually exist)
    const revertedImages = legoProduct.images.map((img) => ({
      ...img,
      path: img.path.replace(currentSlug, oldSlug),
      url: img.url.replace(currentSlug, oldSlug),
    }));

    await db
      .update(products)
      .set({ images: revertedImages })
      .where(eq(products.id, legoProduct.id));

    console.log(`\n✅ ${revertedImages.length} URLs d'images revertées`);
    console.log('\nImages après revert:');
    revertedImages.forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.url}`);
    });
  } else {
    console.log('\nℹ️  Aucune image à revert');
  }
}

main()
  .then(() => {
    console.log('\n✅ Terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
