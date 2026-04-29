/**
 * PayFiP Client Factory
 * Switches between Mock and Real service based on environment
 */

import type { PayFipService } from './types';
import { mockPayFipService } from './mock-service';
import { RealPayFipService } from './soap-client';

// Re-export types for convenience
export type { PayFipService, CreerPaiementSecuriseParams, CreerPaiementSecuriseResponse, PaymentDetails, PayFipNotification } from './types';

/**
 * Create PayFiP service instance based on environment configuration
 */
export function createPayFipService(): PayFipService {
  // DEBUG: Log ALL PayFiP-related env vars
  console.log('🔍 DEBUG - All PayFiP env vars:', {
    PAYFIP_USE_MOCK: process.env.PAYFIP_USE_MOCK,
    PAYFIP_SOAP_URL: process.env.PAYFIP_SOAP_URL ? 'SET' : 'NOT SET',
    PAYFIP_NUMCLI: process.env.PAYFIP_NUMCLI ? 'SET' : 'NOT SET',
    PAYFIP_EXER: process.env.PAYFIP_EXER ? 'SET' : 'NOT SET',
  });

  const useMock = process.env.PAYFIP_USE_MOCK === 'true';
  console.log('🔍 DEBUG - useMock computed:', useMock);

  if (useMock) {
    console.log('✅ Using Mock PayFiP Service (test mode)');
    return mockPayFipService;
  }

  // Production mode - validate credentials
  const soapUrl = process.env.PAYFIP_SOAP_URL;
  const numcli = process.env.PAYFIP_NUMCLI;
  const exer = process.env.PAYFIP_EXER;

  if (!soapUrl || !numcli || !exer) {
    throw new Error(
      'Missing PayFiP credentials. Required env vars: PAYFIP_SOAP_URL, PAYFIP_NUMCLI, PAYFIP_EXER. ' +
      'Or set PAYFIP_USE_MOCK=true for testing.'
    );
  }

  console.log('✅ Using Real PayFiP Service (production mode)');
  return new RealPayFipService({
    soapUrl,
    numcli,
    exer,
  });
}

/**
 * Get PayFiP service instance
 *
 * Note: No singleton pattern to avoid caching issues on Vercel serverless.
 * Each call creates a new service instance based on current environment variables.
 * This ensures that environment variable changes are picked up immediately.
 */
export function getPayFipService(): PayFipService {
  console.log('📞 getPayFipService() called - creating new service instance');
  return createPayFipService();
}
