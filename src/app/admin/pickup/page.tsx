import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QRScanner } from '@/components/admin/qr-scanner';
import { QrCode } from 'lucide-react';

export default async function PickupScannerPage() {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Scanner QR Code Retrait</h1>
        <p className="text-muted-foreground mt-1">
          Validez les retraits de commandes en scannant les QR codes
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Validation de Retrait
            </CardTitle>
            <CardDescription>
              Scannez le QR code du client ou saisissez manuellement le token
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QRScanner />
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">Instructions</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Le client doit présenter le QR code reçu par email</li>
            <li>• Scannez le code avec la caméra ou saisissez le token manuellement</li>
            <li>• Vérifiez les détails de la commande affichés</li>
            <li>• Confirmez le retrait pour finaliser la commande</li>
            <li>• Les tokens expirés (30 jours) ou déjà utilisés seront rejetés</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
