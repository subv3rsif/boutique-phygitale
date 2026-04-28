'use client';

import dynamic from 'next/dynamic';

// Lazy load QRScanner component for admin pages
// This component is only loaded when user accesses the admin pickup scanner page
// Reduces initial bundle size since camera/barcode libraries are heavy
export const QRScannerLazy = dynamic(
  () => import('./qr-scanner').then(mod => ({ default: mod.QRScanner })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
      </div>
    )
  }
);
