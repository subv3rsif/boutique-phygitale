'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/catalogue';
import { buildMockNotificationXML } from '@/lib/payfip/soap-parser';

/**
 * Mock PayFiP Payment Page
 * Simulates the DGFiP payment interface for development
 * Only accessible when PAYFIP_USE_MOCK=true
 */
export default function PayFipMockPage() {
  const params = useParams();
  const router = useRouter();
  const idop = params.idop as string;

  const [details, setDetails] = useState<{ refdet: string; montant: string; mel: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch payment details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/payfip/mock/details?idop=${idop}`);

        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }

        const data = await response.json();
        setDetails(data);
      } catch (err) {
        console.error('Error fetching details:', err);
        setError('Impossible de charger les détails du paiement. L\'idop a peut-être expiré.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [idop]);

  // Handle payment action
  const handlePayment = async (resultTrans: 'P' | 'A' | 'R') => {
    if (!details) return;

    setProcessing(true);
    setError(null);

    try {
      // Build mock notification XML
      const notificationXML = buildMockNotificationXML(
        idop,
        resultTrans,
        details.refdet,
        details.montant,
        details.mel
      );

      console.log('Sending mock notification:', notificationXML);

      // Send notification to our callback handler
      const response = await fetch('/api/payfip/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: notificationXML,
      });

      if (!response.ok) {
        throw new Error('Notification failed');
      }

      console.log('Notification sent successfully');

      // Redirect to result page
      router.push(`/commande/resultat?idop=${idop}`);
    } catch (err) {
      console.error('Payment error:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && !details) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/panier')}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Retour au panier
          </button>
        </div>
      </div>
    );
  }

  if (!details) return null;

  const montantCents = parseInt(details.montant);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Mock PayFiP Header */}
        <div className="bg-[#003366] text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">PayFiP - Paiement sécurisé</h1>
              <p className="text-sm opacity-90">Direction générale des Finances publiques</p>
            </div>
            <div className="bg-white text-[#003366] px-4 py-2 rounded font-bold text-sm">
              MODE TEST
            </div>
          </div>
        </div>

        {/* Payment Details Card */}
        <div className="bg-white shadow-lg rounded-b-lg p-8">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails du paiement</h2>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Référence :</span>
                <span className="font-mono font-medium text-gray-900">{details.refdet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant :</span>
                <span className="font-bold text-xl text-gray-900">{formatCurrency(montantCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email :</span>
                <span className="font-medium text-gray-900">{details.mel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Objet :</span>
                <span className="font-medium text-gray-900">Boutique municipale 1885</span>
              </div>
            </div>
          </div>

          {/* Mock Payment Actions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Simuler un résultat de paiement :
            </h3>

            <button
              onClick={() => handlePayment('P')}
              disabled={processing}
              className="w-full py-4 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Payer (Succès - P)
                </>
              )}
            </button>

            <button
              onClick={() => handlePayment('A')}
              disabled={processing}
              className="w-full py-4 px-6 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler (A)
            </button>

            <button
              onClick={() => handlePayment('R')}
              disabled={processing}
              className="w-full py-4 px-6 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Refuser (R)
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Mock Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Mode développement :</strong> Cette page simule l'interface PayFiP.
              En production, les utilisateurs seront redirigés vers le portail officiel DGFiP.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Paiement sécurisé - Session valide 15 minutes</p>
          <p className="mt-1">idop: <code className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{idop}</code></p>
        </div>
      </div>
    </div>
  );
}
