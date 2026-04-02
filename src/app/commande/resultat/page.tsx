'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/catalogue';
import { RESULTRANS_MESSAGES } from '@/lib/payfip/types';
import QRCode from 'qrcode';

interface OrderResult {
  id: string;
  refdet: string;
  status: string;
  fulfillmentMode: 'delivery' | 'pickup';
  customerEmail: string;
  grandTotalCents: number;
  payfipResultTrans: 'P' | 'V' | 'A' | 'R' | 'Z';
  createdAt: string;
  pickupToken?: {
    token: string;
    expiresAt: string;
  };
  items: Array<{
    nameSnapshot: string;
    qty: number;
    unitPriceCents: number;
  }>;
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idop = searchParams.get('idop');

  const [order, setOrder] = useState<OrderResult | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderResult = async () => {
      if (!idop) {
        setError('Aucune référence de paiement trouvée');
        setLoading(false);
        return;
      }

      try {
        // Fetch order by idop
        const response = await fetch(`/api/orders/by-idop/${idop}`);

        if (!response.ok) {
          throw new Error('Order not found');
        }

        const data = await response.json();
        setOrder(data);

        // Generate QR code if pickup mode and payment successful
        if (
          data.fulfillmentMode === 'pickup' &&
          (data.payfipResultTrans === 'P' || data.payfipResultTrans === 'V') &&
          data.pickupToken
        ) {
          const qrUrl = `${window.location.origin}/retrait/${data.pickupToken.token}`;
          const qrDataUrl = await QRCode.toDataURL(qrUrl, {
            width: 300,
            margin: 2,
            color: {
              dark: '#503B64',
              light: '#FFFFFF',
            },
          });
          setQrCodeUrl(qrDataUrl);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Impossible de récupérer les informations de commande');
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to allow notification processing
    const timer = setTimeout(fetchOrderResult, 1000);
    return () => clearTimeout(timer);
  }, [idop]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Traitement de votre paiement...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || 'Commande introuvable'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const resultTrans = order.payfipResultTrans;
  const message = RESULTRANS_MESSAGES[resultTrans];
  const isSuccess = message.type === 'success';
  const isInfo = message.type === 'info';
  const isError = message.type === 'error';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Result Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Status Header */}
          <div
            className={`p-6 ${
              isSuccess ? 'bg-green-50 border-b border-green-200' :
              isInfo ? 'bg-blue-50 border-b border-blue-200' :
              'bg-red-50 border-b border-red-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isSuccess ? 'bg-green-100' :
                  isInfo ? 'bg-blue-100' :
                  'bg-red-100'
                }`}
              >
                {isSuccess && (
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isInfo && (
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {isError && (
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div>
                <h1
                  className={`text-2xl font-bold mb-1 ${
                    isSuccess ? 'text-green-900' :
                    isInfo ? 'text-blue-900' :
                    'text-red-900'
                  }`}
                >
                  {message.title}
                </h1>
                <p
                  className={`${
                    isSuccess ? 'text-green-700' :
                    isInfo ? 'text-blue-700' :
                    'text-red-700'
                  }`}
                >
                  {message.message}
                </p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de la commande</h2>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Référence :</span>
                  <span className="font-mono font-medium text-gray-900">{order.refdet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant total :</span>
                  <span className="font-bold text-gray-900">{formatCurrency(order.grandTotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email :</span>
                  <span className="font-medium text-gray-900">{order.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode de livraison :</span>
                  <span className="font-medium text-gray-900">
                    {order.fulfillmentMode === 'pickup' ? 'Retrait à La Fabrik' : 'Livraison à domicile'}
                  </span>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Articles commandés :</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.nameSnapshot} × {item.qty}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.unitPriceCents * item.qty)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code for Pickup */}
            {isSuccess && order.fulfillmentMode === 'pickup' && qrCodeUrl && (
              <div className="mb-6 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-primary/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  QR Code de retrait
                </h3>
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                    <img src={qrCodeUrl} alt="QR Code de retrait" className="w-64 h-64" />
                  </div>
                  <div className="text-center max-w-md">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Présentez ce QR code à La Fabrik</strong> pour récupérer votre commande.
                    </p>
                    <p className="text-xs text-gray-600">
                      Un email de confirmation avec le QR code vous a été envoyé à {order.customerEmail}.
                    </p>
                    {order.pickupToken && (
                      <p className="text-xs text-gray-500 mt-2">
                        Valide jusqu'au{' '}
                        {new Date(order.pickupToken.expiresAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email Confirmation Note */}
            {isSuccess && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Email de confirmation envoyé</p>
                    <p>
                      Un récapitulatif complet de votre commande
                      {order.fulfillmentMode === 'pickup' && ' avec le QR code de retrait'}
                      {' '}vous sera envoyé à <strong>{order.customerEmail}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Retour à l'accueil
              </button>
              {isError && (
                <button
                  onClick={() => router.push('/panier')}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                >
                  Retour au panier
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Besoin d'aide ? Contactez-nous à{' '}
            <a href="mailto:support@example.com" className="text-primary hover:underline">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
