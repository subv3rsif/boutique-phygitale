/**
 * SOAP XML Parser for PayFiP Web Service
 * Handles SOAP request building and response parsing
 */

import type { CreerPaiementSecuriseParams, PayFipNotification } from './types';

// ============================================================================
// Build SOAP Request for creerPaiementSecurise
// ============================================================================

export function buildCreerPaiementRequest(params: CreerPaiementSecuriseParams): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cps="http://www.dgfip.finances.gouv.fr/cps">
  <soap:Body>
    <cps:creerPaiementSecurise>
      <cps:NUMCLI>${escapeXml(params.NUMCLI)}</cps:NUMCLI>
      <cps:EXER>${escapeXml(params.EXER)}</cps:EXER>
      <cps:REFDET>${escapeXml(params.REFDET)}</cps:REFDET>
      <cps:OBJET>${escapeXml(params.OBJET)}</cps:OBJET>
      <cps:MONTANT>${escapeXml(params.MONTANT)}</cps:MONTANT>
      <cps:MEL>${escapeXml(params.MEL)}</cps:MEL>
      <cps:URLNOTIF>${escapeXml(params.URLNOTIF)}</cps:URLNOTIF>
      <cps:URLREDIRECT>${escapeXml(params.URLREDIRECT)}</cps:URLREDIRECT>
      <cps:SAISIE>${escapeXml(params.SAISIE)}</cps:SAISIE>
    </cps:creerPaiementSecurise>
  </soap:Body>
</soap:Envelope>`;
}

// ============================================================================
// Parse SOAP Response from creerPaiementSecurise
// ============================================================================

export function parseCreerPaiementResponse(xmlResponse: string): { idop: string } {
  // Extract idop from response
  // Expected format: <idop>...</idop> or <return>idop_value</return>
  const idopMatch = xmlResponse.match(/<(?:idop|return)>([\w-]+)<\/(?:idop|return)>/);

  if (!idopMatch || !idopMatch[1]) {
    // Check for SOAP fault
    const faultMatch = xmlResponse.match(/<faultstring>(.*?)<\/faultstring>/);
    if (faultMatch) {
      throw new Error(`SOAP Fault: ${faultMatch[1]}`);
    }
    throw new Error('Failed to parse idop from SOAP response');
  }

  return { idop: idopMatch[1] };
}

// ============================================================================
// Parse Notification XML from PayFiP Callback
// ============================================================================

export function parseNotificationXML(xmlBody: string): PayFipNotification {
  // Extract values from XML
  const extractValue = (tag: string): string => {
    const match = xmlBody.match(new RegExp(`<${tag}>(.*?)</${tag}>`));
    return match ? match[1]! : '';
  };

  const notification: PayFipNotification = {
    idop: extractValue('idop'),
    resultrans: extractValue('resultrans') as 'P' | 'V' | 'A' | 'R' | 'Z',
    numauto: extractValue('numauto'),
    dattrans: extractValue('dattrans'),
    heurtrans: extractValue('heurtrans'),
    refdet: extractValue('refdet'),
    montant: extractValue('montant'),
    mel: extractValue('mel'),
    saisie: extractValue('saisie'),
  };

  // Validate required fields
  if (!notification.idop || !notification.resultrans || !notification.refdet) {
    throw new Error('Invalid notification XML: missing required fields');
  }

  return notification;
}

// ============================================================================
// Build Mock Notification XML (for testing)
// ============================================================================

export function buildMockNotificationXML(params: {
  idop: string;
  resultrans: 'P' | 'V' | 'A' | 'R' | 'Z';
  refdet: string;
  montant: string;
  mel: string;
  numauto?: string;
  dattrans?: string;
  heurtrans?: string;
  saisie?: string;
}): string {
  const now = new Date();
  const dattrans = params.dattrans || formatDate(now);
  const heurtrans = params.heurtrans || formatTime(now);
  const numauto = params.numauto || generateMockNumAuto(params.resultrans);
  const saisie = params.saisie || 'T';

  return `<?xml version="1.0" encoding="UTF-8"?>
<notification>
  <idop>${escapeXml(params.idop)}</idop>
  <resultrans>${escapeXml(params.resultrans)}</resultrans>
  <numauto>${escapeXml(numauto)}</numauto>
  <dattrans>${escapeXml(dattrans)}</dattrans>
  <heurtrans>${escapeXml(heurtrans)}</heurtrans>
  <refdet>${escapeXml(params.refdet)}</refdet>
  <montant>${escapeXml(params.montant)}</montant>
  <mel>${escapeXml(params.mel)}</mel>
  <saisie>${escapeXml(saisie)}</saisie>
</notification>`;
}

// ============================================================================
// Helper Functions
// ============================================================================

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(date: Date): string {
  // Format: JJMMAAAA (day month year)
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}${month}${year}`;
}

function formatTime(date: Date): string {
  // Format: HHMM
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}${minutes}`;
}

function generateMockNumAuto(resultrans: string): string {
  // Generate mock authorization number
  // P/V: 16 chars, A/R/Z: empty or 6 chars
  if (resultrans === 'P' || resultrans === 'V') {
    return Math.random().toString(36).substring(2, 18).toUpperCase();
  }
  return '';
}
