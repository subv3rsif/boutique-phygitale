/**
 * Real PayFiP SOAP Client (Production)
 * Connects to DGFiP Web Service via SOAP
 *
 * NOTES:
 * - This implementation uses the 'soap' package (^1.9.1)
 * - Cannot be tested without real PayFiP credentials (NUMCLI, EXER)
 * - Use PAYFIP_USE_MOCK=true for development/testing
 * - Test environment: saisie=T, production: saisie=P
 */

import soap from 'soap';
import type { PayFipService, CreerPaiementSecuriseParams, CreerPaiementSecuriseResponse, PaymentDetails } from './types';
import { PayFipSOAPError } from './errors';

export class RealPayFipService implements PayFipService {
  private readonly soapUrl: string;
  private readonly numcli: string;
  private readonly exer: string;

  constructor(config: { soapUrl: string; numcli: string; exer: string }) {
    this.soapUrl = config.soapUrl;
    this.numcli = config.numcli;
    this.exer = config.exer;

    console.log('🔶 Real PayFiP Service initialized', {
      url: this.soapUrl,
      numcli: this.numcli,
      exer: this.exer,
    });
  }

  async creerPaiementSecurise(params: CreerPaiementSecuriseParams): Promise<CreerPaiementSecuriseResponse> {
    console.log('🔶 Real PayFiP: creerPaiementSecurise called', {
      REFDET: params.REFDET,
      MONTANT: params.MONTANT,
      MEL: params.MEL,
      SAISIE: params.SAISIE,
    });

    try {
      // Create SOAP client
      const client = await soap.createClientAsync(this.soapUrl, {
        // Disable strict WSDL validation (some PayFiP WSDL may have quirks)
        disableCache: true,
      });

      // Call creerPaiementSecurise SOAP method
      const [result] = await client.creerPaiementSecuriseAsync({
        NUMCLI: params.NUMCLI,
        EXER: params.EXER,
        REFDET: params.REFDET,
        OBJET: params.OBJET,
        MONTANT: params.MONTANT,
        MEL: params.MEL,
        URLNOTIF: params.URLNOTIF,
        URLREDIRECT: params.URLREDIRECT,
        SAISIE: params.SAISIE,
      });

      console.log('🔶 SOAP Response:', result);

      // Extract idop from response
      // Response format can vary: result.idop or result.return or result.idOp
      const idop = result?.idop || result?.idOp || result?.return;

      if (!idop) {
        console.error('Failed to extract idop from SOAP response:', result);
        throw new Error('Invalid SOAP response: idop not found');
      }

      console.log('✅ PayFiP idop created:', idop);

      return { idop };

    } catch (error: any) {
      console.error('❌ PayFiP SOAP Error:', error);

      // Check for SOAP fault
      if (error.root?.Envelope?.Body?.Fault) {
        const fault = error.root.Envelope.Body.Fault;
        const faultCode = fault.faultcode || 'UNKNOWN';
        const faultString = fault.faultstring || 'SOAP Error';

        console.error('SOAP Fault:', { faultCode, faultString });
        throw new PayFipSOAPError(faultCode, faultString);
      }

      // Generic error
      throw new Error(`PayFiP SOAP call failed: ${error.message}`);
    }
  }

  async recupererDetailPaiementSecurise(idop: string): Promise<PaymentDetails | null> {
    console.log('🔶 Real PayFiP: recupererDetailPaiementSecurise called', idop);

    try {
      // Create SOAP client
      const client = await soap.createClientAsync(this.soapUrl, {
        disableCache: true,
      });

      // Call recupererDetailPaiementSecurise SOAP method
      const [result] = await client.recupererDetailPaiementSecuriseAsync({
        NUMCLI: this.numcli,
        idop: idop,
      });

      console.log('🔶 SOAP Response:', result);

      // If no payment details found, return null
      if (!result || !result.idop) {
        console.log('No payment details found for idop:', idop);
        return null;
      }

      // Map SOAP response to PaymentDetails
      const details: PaymentDetails = {
        idop: result.idop || idop,
        resultrans: result.resultrans || null,
        numauto: result.numauto || undefined,
        dattrans: result.dattrans || undefined,
        heurtrans: result.heurtrans || undefined,
        refdet: result.refdet,
        montant: result.montant,
        mel: result.mel,
      };

      console.log('✅ Payment details retrieved:', details);

      return details;

    } catch (error: any) {
      console.error('❌ PayFiP SOAP Error:', error);

      // Check for SOAP fault
      if (error.root?.Envelope?.Body?.Fault) {
        const fault = error.root.Envelope.Body.Fault;
        const faultCode = fault.faultcode || 'UNKNOWN';
        const faultString = fault.faultstring || 'SOAP Error';

        console.error('SOAP Fault:', { faultCode, faultString });

        // P1, P3, P4, P5 errors should return null (not throw)
        if (['P1', 'P3', 'P4', 'P5'].includes(faultCode)) {
          console.log(`PayFiP returned ${faultCode}: ${faultString}`);
          return null;
        }

        throw new PayFipSOAPError(faultCode, faultString);
      }

      // Generic error
      throw new Error(`PayFiP SOAP call failed: ${error.message}`);
    }
  }
}
