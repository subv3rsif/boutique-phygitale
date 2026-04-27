import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * Validate REFDET format according to PayFiP specification
 * Must be 1-30 alphanumeric characters only (no special chars, no spaces)
 * Based on eopayment/payfip_ws.py pattern
 */
export function validateREFDET(refdet: string): boolean {
  return /^[A-Za-z0-9]{1,30}$/.test(refdet);
}

/**
 * Generate sequential invoice reference (REFDET)
 * Format: YYYYNNN (e.g., "2026042")
 * Strictly alphanumeric (no hyphen) per PayFiP spec
 * Thread-safe with atomic SQL increment
 */
export async function generateREFDET(): Promise<string> {
  const year = new Date().getFullYear();

  // Atomic increment using ON CONFLICT
  const result = await db.execute(sql`
    INSERT INTO invoice_sequences (year, current_number, last_updated)
    VALUES (${year}, 1, NOW())
    ON CONFLICT (year)
    DO UPDATE SET
      current_number = invoice_sequences.current_number + 1,
      last_updated = NOW()
    RETURNING current_number
  `);

  const row = result[0];
  if (!row || typeof row.current_number !== 'number') {
    throw new Error('Failed to generate REFDET: invalid database response');
  }
  const number = row.current_number;

  // Format: "2026042" (3 digits zero-padded, no hyphen)
  const refdet = `${year}${number.toString().padStart(3, '0')}`;

  // Validate before returning
  if (!validateREFDET(refdet)) {
    throw new Error(`Generated REFDET "${refdet}" does not match PayFiP specification (alphanumeric 1-30 chars)`);
  }

  console.log(`Generated REFDET: ${refdet}`);
  return refdet;
}

/**
 * Get current sequence number for a year (for debugging/admin)
 */
export async function getCurrentSequenceNumber(year: number): Promise<number> {
  // Validate year is reasonable
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error(`Invalid year: ${year}`);
  }

  const result = await db.execute(sql`
    SELECT current_number FROM invoice_sequences WHERE year = ${year}
  `);

  if (result.length === 0) {
    return 0;
  }

  const row = result[0] as { current_number: number };
  return row.current_number;
}

/**
 * Parse REFDET to extract year and number (for validation)
 * Format: YYYYNNN (no hyphen)
 */
export function parseREFDET(refdet: string): { year: number; number: number } | null {
  const match = refdet.match(/^(\d{4})(\d{3})$/);  // YYYY followed by exactly 3 digits
  if (!match) {
    return null;
  }

  return {
    year: parseInt(match[1]!, 10),
    number: parseInt(match[2]!, 10),
  };
}
