/**
 * Simple fix: Update LEGO product slug to match generated slug from name
 * This removes the inconsistency between name and slug
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { db, products } from '../src/lib/db';
import { like, eq } from 'drizzle-orm';
import { generateSlug } from '../src/lib/validations/product';

async function main() {
  console.log('🔧 Correction automatique du slug LEGO\n');

  const [legoProduct] = await db
    .select()
    .from(products)
    .where(like(products.name, '%LEGO%'))
    .limit(1);

  if (!legoProduct) {
    console.log('❌ Produit non trouvé');
    return;
  }

  const correctSlug = generateSlug(legoProduct.name);

  console.log(`Nom: "${legoProduct.name}"`);
  console.log(`Slug actuel: "${legoProduct.slug}"`);
  console.log(`Slug correct: "${correctSlug}"`);

  if (legoProduct.slug === correctSlug) {
    console.log('\n✅ Le slug est déjà correct');
    return;
  }

  console.log('\n🔄 Mise à jour du slug...');

  await db
    .update(products)
    .set({ slug: correctSlug, updatedAt: new Date() })
    .where(eq(products.id, legoProduct.id));

  // Also update image paths
  if (legoProduct.images && legoProduct.images.length > 0) {
    const updatedImages = legoProduct.images.map((img) => ({
      ...img,
      path: img.path.replace(legoProduct.slug, correctSlug),
      url: img.url.replace(legoProduct.slug, correctSlug),
    }));

    await db
      .update(products)
      .set({ images: updatedImages })
      .where(eq(products.id, legoProduct.id));

    console.log(`✅ ${updatedImages.length} images mises à jour`);
  }

  console.log(`✅ Slug mis à jour: "${legoProduct.slug}" → "${correctSlug}"`);
  console.log('\n⚠️  NOTE: Les anciennes images dans Supabase Storage existent toujours');
  console.log(`   Ancien path: ${legoProduct.slug}/`);
  console.log(`   Nouveau path: ${correctSlug}/`);
  console.log('   Vous pouvez les déplacer manuellement ou les laisser (elles ne seront plus utilisées)');
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
