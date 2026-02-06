import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOrderById } from '@/lib/db/helpers';
import { formatCurrency } from '@/lib/utils';
import { MarkShippedButton } from '@/components/admin/mark-shipped-button';
import { ResendEmailButton } from '@/components/admin/resend-email-button';
import { Package, Truck, MapPin, Mail, Phone, Calendar, CreditCard } from 'lucide-react';

function getStatusBadge(status: string) {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    pending: { variant: 'outline', label: 'En attente' },
    paid: { variant: 'default', label: 'Payée' },
    fulfilled: { variant: 'secondary', label: 'Finalisée' },
    canceled: { variant: 'destructive', label: 'Annulée' },
    refunded: { variant: 'destructive', label: 'Remboursée' },
  };

  const config = variants[status] || { variant: 'outline' as const, label: status };

  return (
    <Badge variant={config.variant} className="text-sm">
      {config.label}
    </Badge>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');

  if (!session) {
    redirect('/login');
  }

  // Fetch order details
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const canMarkShipped =
    order.status === 'paid' &&
    order.fulfillmentMode === 'delivery';

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commande #{order.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground mt-1">
            Créée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div>
          {getStatusBadge(order.status)}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Informations Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{order.customerEmail}</p>
            </div>
            {order.customerPhone && (
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {order.customerPhone}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fulfillment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {order.fulfillmentMode === 'pickup' ? (
                <MapPin className="h-5 w-5" />
              ) : (
                <Truck className="h-5 w-5" />
              )}
              Mode de Livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">
                {order.fulfillmentMode === 'pickup' ? 'Retrait sur place' : 'Livraison à domicile'}
              </p>
            </div>
            {order.fulfillmentMode === 'pickup' && order.pickupLocationId && (
              <div>
                <p className="text-sm text-muted-foreground">Lieu de retrait</p>
                <p className="font-medium">
                  {process.env.NEXT_PUBLIC_PICKUP_LOCATION_NAME || 'La Fabrik'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {process.env.NEXT_PUBLIC_PICKUP_LOCATION_ADDRESS}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Articles Commandés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.nameSnapshot}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantité: {item.qty} × {formatCurrency(item.unitPriceCents)}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(item.unitPriceCents * item.qty)}
                  </p>
                </div>
              ))}

              {/* Totals */}
              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatCurrency(order.itemsTotalCents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frais de livraison</span>
                  <span>{formatCurrency(order.shippingTotalCents)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total TTC</span>
                  <span>{formatCurrency(order.grandTotalCents)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Session Stripe</p>
              <p className="font-mono text-xs break-all">{order.stripeSessionId}</p>
            </div>
            {order.stripePaymentIntentId && (
              <div>
                <p className="text-sm text-muted-foreground">Payment Intent</p>
                <p className="font-mono text-xs break-all">{order.stripePaymentIntentId}</p>
              </div>
            )}
            {order.paidAt && (
              <div>
                <p className="text-sm text-muted-foreground">Payée le</p>
                <p className="font-medium">
                  {new Date(order.paidAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Créée</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              {order.paidAt && (
                <div>
                  <p className="text-sm font-medium">Payée</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.paidAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}
              {order.fulfilledAt && (
                <div>
                  <p className="text-sm font-medium">Finalisée</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.fulfilledAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}
              {order.canceledAt && (
                <div>
                  <p className="text-sm font-medium">Annulée</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.canceledAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {canMarkShipped && <MarkShippedButton orderId={order.id} />}
        <ResendEmailButton orderId={order.id} />
      </div>
    </div>
  );
}
