/**
 * Real PayFiP SOAP Client (Production)
 * Connects to DGFiP Web Service
 */

import type { PayFipService, CreerPaiementSecuriseParams, CreerPaiementSecuriseResponse, PaymentDetails } from './types';
import { buildCreerPaiementRequest, parseCreerPaiementResponse } from './soap-parser';

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
    console.log('🔶 Real PayFiP: creerPaiementSecurise called', params.REFDET);

    // TODO: Implement with actual SOAP package (e.g., soap, node-soap, or axios with XML)
    // Example implementation:
    //
    // const soapRequest = buildCreerPaiementRequest(params);
    // const response = await fetch(this.soapUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'text/xml; charset=utf-8',
    //     'SOAPAction': 'creerPaiementSecurise',
    //   },
    //   body: soapRequest,
    // });
    //
    // const xmlResponse = await response.text();
    // return parseCreerPaiementResponse(xmlResponse);

    throw new Error('RealPayFipService.creerPaiementSecurise not yet implemented. Please configure SOAP client or use mock mode.');
  }

  async recupererDetailPaiementSecurise(idop: string): Promise<PaymentDetails | null> {
    console.log('🔶 Real PayFiP: recupererDetailPaiementSecurise called', idop);

    // TODO: Implement with actual SOAP package
    // Example implementation:
    //
    // const soapRequest = buildRecupererDetailRequest({ NUMCLI: this.numcli, idop });
    // const response = await fetch(this.soapUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'text/xml; charset=utf-8',
    //     'SOAPAction': 'recupererDetailPaiementSecurise',
    //   },
    //   body: soapRequest,
    // });
    //
    // const xmlResponse = await response.text();
    // return parseRecupererDetailResponse(xmlResponse);

    throw new Error('RealPayFipService.recupererDetailPaiementSecurise not yet implemented. Please configure SOAP client or use mock mode.');
  }
}
