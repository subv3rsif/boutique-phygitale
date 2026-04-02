import { randomUUID } from 'crypto';
import type { PayFipService, CreerPaiementSecuriseParams, CreerPaiementSecuriseResponse, PaymentDetails } from './types';
import { PayFipSOAPError } from './errors';

interface MockPaymentData {
  refdet: string;
  montant: string;
  mel: string;
  createdAt: Date;
}

export class MockPayFipService implements PayFipService {
  private mockIdops = new Map<string, MockPaymentData>();

  async creerPaiementSecurise(params: CreerPaiementSecuriseParams): Promise<CreerPaiementSecuriseResponse> {
    console.log('🔷 Mock PayFiP: creerPaiementSecurise called', params.REFDET);

    // Validations (simulate PayFiP)
    if (!params.REFDET || params.REFDET.length < 6) {
      throw new PayFipSOAPError('R3', 'Format REFDET invalide');
    }

    const montant = parseInt(params.MONTANT);
    if (montant < 100) {
      throw new PayFipSOAPError('M3', 'Montant minimum 1€');
    }

    if (!params.MEL || !params.MEL.includes('@')) {
      throw new PayFipSOAPError('A2', 'Email invalide');
    }

    // Generate idop
    const idop = randomUUID();

    // Store in memory (expires 15 min)
    this.mockIdops.set(idop, {
      refdet: params.REFDET,
      montant: params.MONTANT,
      mel: params.MEL,
      createdAt: new Date(),
    });

    // Auto-cleanup after 15 min
    setTimeout(() => {
      this.mockIdops.delete(idop);
      console.log(`🔷 Mock PayFiP: idop ${idop} expired and deleted`);
    }, 15 * 60 * 1000);

    console.log(`🔷 Mock PayFiP: Created idop ${idop}`);
    return { idop };
  }

  async recupererDetailPaiementSecurise(idop: string): Promise<PaymentDetails | null> {
    const payment = this.mockIdops.get(idop);

    if (!payment) {
      throw new PayFipSOAPError('P1', 'idOp incorrect');
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(payment.createdAt.getTime() + 15 * 60 * 1000);

    if (now > expiresAt) {
      throw new PayFipSOAPError('P4', 'idOp expiré');
    }

    // Return null if no result yet (P5 - transaction in progress)
    return null;
  }

  // Helper for mock payment page
  getIdopDetails(idop: string): MockPaymentData | undefined {
    return this.mockIdops.get(idop);
  }
}

// Singleton instance
export const mockPayFipService = new MockPayFipService();
