/**
 * Check if 'featured' column exists in Supabase
 */

import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

async function checkColumn() {
  try {
    console.log('\n🔍 Checking if "featured" column exists...\n');

    // Query to check column existence
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'products'
      AND column_name = 'featured'
    `;

    if (result.length > 0) {
      console.log('✅ Column "featured" exists!');
      console.log('Details:', result[0]);

      // Check a sample product
      const sample = await sql`
        SELECT id, name, featured
        FROM products
        LIMIT 3
      `;

      console.log('\n📦 Sample products:');
      sample.forEach(p => {
        console.log(`  - ${p.name}: featured = ${p.featured}`);
      });
    } else {
      console.log('❌ Column "featured" does NOT exist!');
      console.log('Migration needed!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

checkColumn();
