/**
 * Fix LEGO Product Slug Inconsistency
 *
 * Current situation:
 * - Name: "Set de LEGO Hôtel de Ville"
 * - Slug: "set-de-lego-pont-du-port-a-l-anglais" (outdated)
 *
 * This script offers two options:
 * 1. Update slug to match current name
 * 2. Update name to match current slug
 *
 * Usage: NODE_ENV=development npx tsx scripts/fix-lego-slug.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import * as readline from 'readline';

// Load env first
config({ path: resolve(process.cwd(), '.env.local') });

import { db, products } from '../src/lib/db';
import { like, eq } from 'drizzle-orm';
import { generateSlug } from '../src/lib/validations/product';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🔧 Correction de l\'incohérence slug/nom du produit LEGO\n');

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

    console.log('📦 Produit trouvé:');
    console.log(`   ID: ${legoProduct.id}`);
    console.log(`   Nom actuel: "${legoProduct.name}"`);
    console.log(`   Slug actuel: "${legoProduct.slug}"`);
    console.log('');

    // 2. Check if there's an inconsistency
    const expectedSlug = generateSlug(legoProduct.name);
    const isInconsistent = expectedSlug !== legoProduct.slug;

    if (!isInconsistent) {
      console.log('✅ Aucune incohérence détectée - le slug correspond au nom');
      return;
    }

    console.log('⚠️  INCOHÉRENCE DÉTECTÉE:');
    console.log(`   Slug actuel: "${legoProduct.slug}"`);
    console.log(`   Slug attendu (basé sur nom): "${expectedSlug}"`);
    console.log('');

    // 3. Propose solutions
    console.log('📋 Solutions disponibles:');
    console.log('');
    console.log('1. Mettre à jour le SLUG pour correspondre au nom actuel');
    console.log(`   Nouveau slug: "${expectedSlug}"`);
    console.log('   ⚠️  ATTENTION: Cela cassera les URLs existantes et nécessite migration des images');
    console.log('');
    console.log('2. Mettre à jour le NOM pour correspondre au slug actuel');
    console.log(`   Nouveau nom: "Set de LEGO Pont du Port à l'Anglais"`);
    console.log('   ✅ Solution recommandée: pas de migration d\'images nécessaire');
    console.log('');
    console.log('3. Ne rien faire');
    console.log('');

    const choice = await question('Choisissez une option (1, 2, ou 3): ');

    if (choice === '1') {
      // Update slug to match name
      console.log('\n🔄 Mise à jour du slug...');

      // Check if new slug already exists
      const [existing] = await db
        .select()
        .from(products)
        .where(eq(products.slug, expectedSlug))
        .limit(1);

      if (existing && existing.id !== legoProduct.id) {
        console.log('❌ ERREUR: Le nouveau slug existe déjà pour un autre produit');
        return;
      }

      const confirm = await question(
        `⚠️  Êtes-vous sûr de vouloir changer le slug en "${expectedSlug}"? (oui/non): `
      );

      if (confirm.toLowerCase() !== 'oui') {
        console.log('❌ Opération annulée');
        return;
      }

      await db
        .update(products)
        .set({ slug: expectedSlug, updatedAt: new Date() })
        .where(eq(products.id, legoProduct.id));

      console.log('✅ Slug mis à jour avec succès!');
      console.log(`   Ancien: "${legoProduct.slug}"`);
      console.log(`   Nouveau: "${expectedSlug}"`);
      console.log('');
      console.log('⚠️  IMPORTANT: Vous devez maintenant:');
      console.log('   1. Migrer les images dans Supabase Storage');
      console.log(`      Ancien path: ${legoProduct.slug}/`);
      console.log(`      Nouveau path: ${expectedSlug}/`);
      console.log('   2. Mettre à jour les URLs dans le champ images du produit');
    } else if (choice === '2') {
      // Update name to match slug
      console.log('\n🔄 Mise à jour du nom...');

      // Reconstruct original name from slug
      const newName = 'Set de LEGO "Pont du Port à l\'Anglais"';

      const confirm = await question(
        `⚠️  Êtes-vous sûr de vouloir changer le nom en "${newName}"? (oui/non): `
      );

      if (confirm.toLowerCase() !== 'oui') {
        console.log('❌ Opération annulée');
        return;
      }

      await db
        .update(products)
        .set({ name: newName, updatedAt: new Date() })
        .where(eq(products.id, legoProduct.id));

      console.log('✅ Nom mis à jour avec succès!');
      console.log(`   Ancien: "${legoProduct.name}"`);
      console.log(`   Nouveau: "${newName}"`);
      console.log('');
      console.log('✅ Aucune migration d\'images nécessaire');
    } else {
      console.log('ℹ️  Aucune modification effectuée');
    }
  } catch (error: any) {
    console.error('\n❌ ERREUR:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    rl.close();
  }
}

main()
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    rl.close();
    process.exit(1);
  });
