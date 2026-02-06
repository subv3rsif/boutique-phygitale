import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getOrderById } from '@/lib/db/helpers';
import { db, pickupTokens } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { formatCurrency } from '@/lib/catalogue';
import { partiallyHideEmail } from '@/lib/utils';
import { generatePickupQRCode } from '@/lib/qr/generator';
import { isTokenExpired } from '@/lib/qr/token-generator';
import { Package, Truck, CheckCircle2, XCircle, Clock, QrCode, MapPin } from 'lucide-react';

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderPage({ params }: PageProps) {
  const { orderId } = await params;

  // Get order from database
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  // Status display configuration
  const statusConfig = {
    pending: {
      label: 'En attente',
      icon: Clock,
      variant: 'secondary' as const,
    },
    paid: {
      label: order.fulfillmentMode === 'delivery' ? 'En préparation' : 'Prête à retirer',
      icon: Package,
      variant: 'default' as const,
    },
    fulfilled: {
      label: order.fulfillmentMode === 'delivery' ? 'Expédiée' : 'Retirée',
      icon: CheckCircle2,
      variant: 'default' as const,
    },
    canceled: {
      label: 'Annulée',
      icon: XCircle,
      variant: 'destructive' as const,
    },
    refunded: {
      label: 'Remboursée',
      icon: XCircle,
      variant: 'destructive' as const,
    },
  };

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  // Get pickup token if this is a pickup order
  let pickupToken = null;
  let qrCodeDataURL = null;
  let tokenExpired = false;

  if (order.fulfillmentMode === 'pickup') {
    const [token] = await db
      .select()
      .from(pickupTokens)
      .where(eq(pickupTokens.orderId, order.id))
      .limit(1);

    if (token) {
      pickupToken = token;
      tokenExpired = isTokenExpired(token.expiresAt);

      // Only generate QR code if token is not expired and not used
      if (!tokenExpired && !token.usedAt) {
        // Use the clear token from metadata
        const metadata = token.metadata as { clearToken?: string } | null;
        const clearToken = metadata?.clearToken;

        if (clearToken) {
          qrCodeDataURL = await generatePickupQRCode(clearToken);
        }
      }
    }
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Détails de la commande</h1>
        <p className="text-muted-foreground">
          Commande n° {order.id.substring(0, 8)}
        </p>
      </div>

      {/* Status */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <StatusIcon className="h-8 w-8" />
            <div>
              <CardTitle>Statut de la commande</CardTitle>
              <CardDescription className="mt-1">
                <Badge variant={status.variant}>{status.label}</Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* QR Code for Pickup Orders */}
      {order.fulfillmentMode === 'pickup' && pickupToken && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <QrCode className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>QR Code de retrait</CardTitle>
                <CardDescription>
                  Présentez ce code au comptoir
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pickupToken.usedAt ? (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Commande déjà retirée</strong>
                  <br />
                  Retiré le{' '}
                  {new Date(pickupToken.usedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </AlertDescription>
              </Alert>
            ) : tokenExpired ? (
              <Alert className="border-orange-500 bg-orange-50">
                <XCircle className="h-5 w-5 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>QR code expiré</strong>
                  <br />
                  Expiré le{' '}
                  {new Date(pickupToken.expiresAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  . Contactez le support.
                </AlertDescription>
              </Alert>
            ) : qrCodeDataURL ? (
              <>
                <div className="flex justify-center bg-muted p-6 rounded-lg">
                  <Image
                    src={qrCodeDataURL}
                    alt="QR Code de retrait"
                    width={300}
                    height={300}
                    className="rounded-md"
                  />
                </div>

                <div className="text-sm">
                  <p className="font-semibold mb-2">Validité :</p>
                  <p className="text-muted-foreground">
                    Jusqu'au{' '}
                    {new Date(pickupToken.expiresAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-900 mb-1">
                        {process.env.NEXT_PUBLIC_PICKUP_LOCATION_NAME ||
                          'La Fabrik'}
                      </p>
                      <p className="text-blue-700">
                        {process.env.NEXT_PUBLIC_PICKUP_LOCATION_ADDRESS ||
                          '123 Rue de la République, 75001 Paris'}
                      </p>
                      <p className="text-blue-700 mt-1">
                        {process.env.NEXT_PUBLIC_PICKUP_LOCATION_HOURS ||
                          'Lundi-Vendredi 9h-18h'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Le QR code sera disponible sous peu.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Mode de livraison</p>
              <p className="font-medium">
                {order.fulfillmentMode === 'delivery' ? (
                  <>
                    <Truck className="inline h-4 w-4 mr-1" />
                    Livraison à domicile
                  </>
                ) : (
                  <>
                    <Package className="inline h-4 w-4 mr-1" />
                    Retrait sur place
                  </>
                )}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1">Email</p>
              <p className="font-medium">{partiallyHideEmail(order.customerEmail)}</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1">Date de commande</p>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {order.paidAt && (
              <div>
                <p className="text-muted-foreground mb-1">Payé le</p>
                <p className="font-medium">
                  {new Date(order.paidAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {order.trackingNumber && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-1">Numéro de suivi</p>
              <p className="font-mono text-sm">{order.trackingNumber}</p>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Suivre mon colis →
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Articles commandés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-medium">{item.nameSnapshot}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantité : {item.qty} × {formatCurrency(item.unitPriceCents)}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatCurrency(item.qty * item.unitPriceCents)}
                </p>
              </div>
            ))}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatCurrency(order.itemsTotalCents)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livraison</span>
                <span>
                  {order.shippingTotalCents === 0
                    ? 'Gratuit'
                    : formatCurrency(order.shippingTotalCents)}
                </span>
              </div>

              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total TTC</span>
                <span>{formatCurrency(order.grandTotalCents)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help */}
      <Card className="mt-6 bg-muted">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Besoin d'aide ?</strong> Contactez-nous à{' '}
            <a href="mailto:support@ville.fr" className="underline hover:text-primary">
              support@ville.fr
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
