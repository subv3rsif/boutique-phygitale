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
  const useMock = process.env.PAYFIP_USE_MOCK === 'true';

  // DEBUG: Log environment variable value
  console.log('🔍 DEBUG - PAYFIP_USE_MOCK value:', process.env.PAYFIP_USE_MOCK);
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
 * Lazy-loaded singleton PayFiP service instance
 * Call this function to get the PayFiP service (avoids initialization during build)
 */
let _payfipService: PayFipService | null = null;

export function getPayFipService(): PayFipService {
  if (!_payfipService) {
    _payfipService = createPayFipService();
  }
  return _payfipService;
}
