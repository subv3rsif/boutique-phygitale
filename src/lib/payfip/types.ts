/**
 * PayFiP TypeScript Type Definitions
 * Based on DGFiP Web Service specification
 */

// ============================================================================
// PayFiP Service Interface
// ============================================================================

export interface PayFipService {
  creerPaiementSecurise(params: CreerPaiementSecuriseParams): Promise<CreerPaiementSecuriseResponse>;
  recupererDetailPaiementSecurise(idop: string): Promise<PaymentDetails | null>;
}

// ============================================================================
// CreerPaiementSecurise (Create Secure Payment)
// ============================================================================

export interface CreerPaiementSecuriseParams {
  NUMCLI: string;      // Client number (6 chars) - from DGFiP
  EXER: string;        // Exercise year (4 chars) - e.g., "2026"
  REFDET: string;      // Invoice reference (6-30 chars) - sequential "2026-001"
  OBJET: string;       // Payment object (<100 chars) - e.g., "Boutique municipale 1885"
  MONTANT: string;     // Amount in cents (max 11 chars) - e.g., "1450" for 14,50€
  MEL: string;         // Email (6-80 chars)
  URLNOTIF: string;    // Notification callback URL (<250 chars)
  URLREDIRECT: string; // Redirect URL after payment (<250 chars)
  SAISIE: 'T' | 'P' | 'X';  // Mode: T=test, P=production, X=activation (first use)
}

export interface CreerPaiementSecuriseResponse {
  idop: string;  // Operation UUID (15 min validity)
}

// ============================================================================
// Notification Data (From PayFiP callback)
// ============================================================================

export interface PayFipNotification {
  idop: string;
  resultrans: 'P' | 'V' | 'A' | 'R' | 'Z';  // Payment result
  numauto: string;     // Authorization number (6 or 16 chars)
  dattrans: string;    // Transaction date JJMMAAAA
  heurtrans: string;   // Transaction time HHMM
  refdet: string;      // Invoice reference (echoed back)
  montant: string;     // Amount in cents (echoed back)
  mel: string;         // User email
  saisie: string;      // Mode (echoed back)
}

// ============================================================================
// Payment Details (From recupererDetailPaiementSecurise)
// ============================================================================

export interface PaymentDetails {
  idop: string;
  resultrans: 'P' | 'V' | 'A' | 'R' | 'Z' | null;
  numauto?: string;
  dattrans?: string;
  heurtrans?: string;
  refdet: string;
  montant: string;
  mel: string;
}

// ============================================================================
// idop Validation Result
// ============================================================================

export interface IdopValidationResult {
  valid: boolean;
  error?: 'P1' | 'P3' | 'P4' | 'P5';  // PayFiP error codes
  message?: string;
  operation?: {
    id: string;
    orderId: string;
    refdet: string;
    expiresAt: Date;
    consumedAt: Date | null;
  };
}

// ============================================================================
// PayFiP Error Codes
// ============================================================================

export const PAYFIP_ERROR_MESSAGES: Record<string, string> = {
  // NUMCLI errors
  'S1': 'Mode de saisie invalide',
  'T1': 'Numéro client invalide',
  'T2': 'Le N° du client doit être pré-existant dans la base PayFiP',
  'T4': "Le client PayFiP n'a pas d'accès sécurisé",

  // MONTANT errors
  'M1': "Le format du montant n'est pas correct",
  'M3': 'Montant minimum 1€ requis',
  'M5': 'Montant dépasse la limite autorisée',

  // MEL errors
  'A1': 'Adresse email non renseignée',
  'A2': "L'adresse email est incorrecte",

  // URLNOTIF/URLREDIRECT errors
  'N1': 'URL de notification non valide',
  'D1': 'URL de redirection non valide',

  // REFDET errors
  'R3': 'Le format du paramètre REFDET n\'est pas conforme',

  // idop errors
  'P1': 'idOp incorrect',
  'P3': "L'idop ne doit pas avoir déjà été utilisé",
  'P4': "L'idop ne doit pas avoir été enregistré depuis plus de 15 minutes",
  'P5': 'Résultat de la transaction non connu (paiement en cours)',
};

// ============================================================================
// RESULTRANS Messages (User-Friendly)
// ============================================================================

export const RESULTRANS_MESSAGES = {
  'P': {
    type: 'success' as const,
    title: 'Paiement confirmé !',
    message: 'Votre commande a été validée. Un email de confirmation vous a été envoyé.',
  },
  'V': {
    type: 'success' as const,
    title: 'Paiement en cours de traitement',
    message: 'Votre prélèvement SEPA a été enregistré. Vous recevrez une confirmation par email dans 2-3 jours ouvrés.',
  },
  'A': {
    type: 'info' as const,
    title: 'Paiement annulé',
    message: 'Vous avez annulé le paiement. Votre panier est conservé, vous pouvez réessayer quand vous le souhaitez.',
  },
  'R': {
    type: 'error' as const,
    title: 'Paiement refusé',
    message: 'Votre paiement a été refusé par votre banque. Veuillez vérifier vos informations bancaires ou utiliser un autre moyen de paiement.',
  },
  'Z': {
    type: 'error' as const,
    title: 'Prélèvement refusé',
    message: 'Votre prélèvement SEPA a été rejeté. Veuillez vérifier vos coordonnées bancaires ou utiliser un autre moyen de paiement.',
  },
} as const;
