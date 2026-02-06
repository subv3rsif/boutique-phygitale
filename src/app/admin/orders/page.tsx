import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllOrders } from '@/lib/db/helpers';
import { formatCurrency, partiallyHideEmail } from '@/lib/utils';

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
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

function getModeBadge(mode: string) {
  return mode === 'pickup' ? (
    <Badge variant="secondary">Retrait</Badge>
  ) : (
    <Badge variant="outline">Livraison</Badge>
  );
}

export default async function OrdersPage() {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');

  if (!session) {
    redirect('/login');
  }

  // Fetch all orders (could add pagination/filtering later)
  const orders = await getAllOrders();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Commandes</h1>
        <p className="text-muted-foreground mt-1">
          Gérez toutes les commandes de la boutique
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Aucune commande pour le moment
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {partiallyHideEmail(order.customerEmail)}
                  </TableCell>
                  <TableCell>
                    {getModeBadge(order.fulfillmentMode)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(order.grandTotalCents)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Voir détails
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
