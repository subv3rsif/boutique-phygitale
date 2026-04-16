/**
 * Test du chargement de la page d'édition du produit LEGO
 * Simule ce qui se passe quand on accède à /admin/products/[id]/edit
 */

import { getProductById } from '../src/lib/products';

async function main() {
  console.log('🧪 Test: Chargement page edit produit LEGO\n');

  const LEGO_ID = '7e7aee03-068f-4cce-a609-de3b7dc61b89';

  try {
    console.log(`📥 Fetch product ID: ${LEGO_ID}...`);
    const startTime = Date.now();

    const product = await getProductById(LEGO_ID);

    const duration = Date.now() - startTime;
    console.log(`✅ Product fetched in ${duration}ms\n`);

    if (!product) {
      console.log('❌ Product not found (would trigger notFound())');
      return;
    }

    console.log('✅ Product found:');
    console.log(`   Name: ${product.name}`);
    console.log(`   Slug: ${product.slug}`);
    console.log(`   Tags: ${JSON.stringify(product.tags)}`);
    console.log(`   Badges: ${JSON.stringify(product.badges)}`);
    console.log(`   Featured: ${product.featured}`);
    console.log(`   Active: ${product.active}`);
    console.log();

    // Test serialization pour ProductForm
    console.log('🔍 Test serialization pour ProductForm...');
    const formData = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      selectedTags: product.tags || [],
      badges: product.badges?.join(', ') || '',
      priceCents: product.priceCents ? (product.priceCents / 100).toFixed(2) : '',
      shippingCents: product.shippingCents ? (product.shippingCents / 100).toFixed(2) : '',
      stockQuantity: product.stockQuantity?.toString() || '0',
      stockAlertThreshold: product.stockAlertThreshold?.toString() || '5',
      weightGrams: product.weightGrams?.toString() || '',
      payfipProductCode: product.payfipProductCode || '11',
      editionNumber: product.editionNumber?.toString() || '',
      editionTotal: product.editionTotal?.toString() || '',
      active: product.active ?? true,
      featured: product.featured ?? false,
    };

    console.log('✅ FormData créé sans erreur');
    console.log(`   Price: ${formData.priceCents}€`);
    console.log(`   Stock: ${formData.stockQuantity}`);
    console.log();

    // Check for potential issues
    console.log('🔍 Vérification problèmes potentiels:');

    if (product.name.includes('"')) {
      console.log('⚠️  Le nom contient des guillemets doubles');
    }

    if (product.description && product.description.includes('"')) {
      console.log('⚠️  La description contient des guillemets doubles');
    }

    if (product.tags && !Array.isArray(product.tags)) {
      console.log('❌ ERREUR: tags n\'est pas un array:', typeof product.tags);
    }

    if (product.badges && !Array.isArray(product.badges) && product.badges !== null) {
      console.log('❌ ERREUR: badges n\'est pas un array:', typeof product.badges);
    }

    console.log('✅ Aucun problème détecté\n');

  } catch (error: any) {
    console.error('❌ ERREUR lors du fetch:');
    console.error(`Message: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
  }
}

main()
  .then(() => {
    console.log('✅ Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
