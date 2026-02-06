/**
 * Admin Pickup Validation Page
 *
 * Mobile-first interface for staff to validate customer pickups at La Fabrik
 * Staff access this page on their personal phones to scan QR codes
 */

import { QRScanner } from '@/components/admin/qr-scanner';
import { Package } from 'lucide-react';

export const metadata = {
  title: 'Validation des Retraits | Admin',
  description: 'Scanner les QR codes pour valider les retraits clients',
};

export default function PickupValidationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Validation des Retraits
              </h1>
              <p className="text-sm text-gray-600">
                La Fabrik - Boutique Phygitale
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        <QRScanner />
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <p className="text-xs text-center text-gray-600">
            En cas de problème, contactez le support technique
          </p>
        </div>
      </footer>
    </div>
  );
}
