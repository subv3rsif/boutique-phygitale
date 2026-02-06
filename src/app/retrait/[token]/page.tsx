import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { db, pickupTokens } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getOrderById } from '@/lib/db/helpers';
import { formatCurrency } from '@/lib/catalogue';
import { hashToken, isTokenExpired } from '@/lib/qr/token-generator';
import { Package, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function PickupValidationPage({ params }: PageProps) {
  const { token } = await params;

  // Hash the token to look it up in database
  const tokenHash = hashToken(token);

  // Get pickup token from database
  const [pickupToken] = await db
    .select()
    .from(pickupTokens)
    .where(eq(pickupTokens.tokenHash, tokenHash))
    .limit(1);

  if (!pickupToken) {
    notFound();
  }

  // Get associated order
  const order = await getOrderById(pickupToken.orderId);

  if (!order) {
    notFound();
  }

  // Check token status
  const expired = isTokenExpired(pickupToken.expiresAt);
  const used = !!pickupToken.usedAt;
  const valid = !expired && !used && order.status === 'paid';

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-6 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-2">Retrait de commande</h1>
        <p className="text-muted-foreground">
          Commande n° {order.id.substring(0, 8)}
        </p>
      </div>

      {/* Status Alert */}
      {used && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Commande déjà retirée</strong>
            <br />
            {pickupToken.usedAt && (
              <>
                Cette commande a été retirée le{' '}
                {new Date(pickupToken.usedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {pickupToken.usedBy && ` par ${pickupToken.usedBy}`}.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {expired && !used && (
        <Alert className="mb-6 border-orange-500 bg-orange-50">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>QR code expiré</strong>
            <br />
            Ce QR code a expiré le{' '}
            {new Date(pickupToken.expiresAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            . Veuillez contacter le support.
          </AlertDescription>
        </Alert>
      )}

      {valid && (
        <Alert className="mb-6 border-blue-500 bg-blue-50">
          <Clock className="h-5 w-5 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Prêt pour le retrait</strong>
            <br />
            Présentez cette page au comptoir pour récupérer votre commande.
          </AlertDescription>
        </Alert>
      )}

      {/* Order Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {valid ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-gray-400" />
            )}
            <div>
              <Badge variant={valid ? 'default' : 'secondary'}>
                {used ? 'Retirée' : expired ? 'Expirée' : 'Prête à retirer'}
              </Badge>
              {valid && (
                <p className="text-sm text-muted-foreground mt-1">
                  Valable jusqu'au{' '}
                  {new Date(pickupToken.expiresAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Détails de la commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
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
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Articles</CardTitle>
          <CardDescription>{order.items.length} article(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{item.nameSnapshot}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantité : {item.qty}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatCurrency(item.qty * item.unitPriceCents)}
                </p>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total TTC</span>
                <span>{formatCurrency(order.grandTotalCents)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {valid && (
        <Card className="mt-6 bg-muted">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold mb-2">Pour le staff :</p>
            <p className="text-sm text-muted-foreground">
              Vérifiez que le QR code est valide et remettez la commande au client.
              La validation finale se fait via l'interface admin.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
