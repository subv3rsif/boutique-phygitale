/**
 * PayFiP Custom Error Classes
 */

export class PayFipError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'PayFipError';
  }
}

export class PayFipSOAPError extends PayFipError {
  constructor(
    code: string,
    message: string
  ) {
    super(message, code);
    this.name = 'PayFipSOAPError';
  }
}

export class PayFipIdopError extends PayFipError {
  constructor(
    code: 'P1' | 'P3' | 'P4' | 'P5',
    message: string
  ) {
    super(message, code);
    this.name = 'PayFipIdopError';
  }
}

export function getUserFriendlyErrorMessage(code: string): string {
  const friendlyMessages: Record<string, string> = {
    'M1': 'Le montant de la commande est invalide.',
    'M3': 'Le montant minimum de paiement est de 1€.',
    'M5': 'Le montant dépasse la limite autorisée.',
    'A1': 'Une adresse email est requise.',
    'A2': "L'adresse email est invalide.",
    'R3': 'Erreur de numérotation de commande. Veuillez contacter le support.',
    'T1': 'Service de paiement temporairement indisponible.',
    'T2': 'Service de paiement temporairement indisponible.',
    'T4': 'Service de paiement temporairement indisponible.',
    'N1': 'Configuration du paiement incorrecte. Veuillez contacter le support.',
    'D1': 'Configuration du paiement incorrecte. Veuillez contacter le support.',
  };

  return friendlyMessages[code] || 'Une erreur est survenue. Veuillez réessayer ou contacter le support.';
}
