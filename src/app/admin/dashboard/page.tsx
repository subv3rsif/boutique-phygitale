import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { getOrderStats } from '@/lib/db/helpers';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  // Check authentication (redundant with middleware but good for clarity)
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');

  if (!session) {
    redirect('/login');
  }

  // Fetch order statistics
  const stats = await getOrderStats();

  const statCards = [
    {
      title: 'Total Commandes',
      value: stats.totalOrders,
      icon: Package,
      description: 'Toutes les commandes',
      color: 'text-blue-600',
    },
    {
      title: 'Chiffre d\'Affaires',
      value: formatCurrency(stats.totalRevenueCents),
      icon: TrendingUp,
      description: 'Montant total payé',
      color: 'text-green-600',
    },
    {
      title: 'À Expédier',
      value: stats.toShip,
      icon: Clock,
      description: 'Commandes livraison payées',
      color: 'text-orange-600',
    },
    {
      title: 'À Retirer',
      value: stats.toPickup,
      icon: CheckCircle2,
      description: 'Commandes retrait payées',
      color: 'text-purple-600',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de l'activité de la boutique
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Commandes par Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">En attente</span>
                <span className="font-medium">{stats.ordersByStatus.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payées</span>
                <span className="font-medium">{stats.ordersByStatus.paid}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Finalisées</span>
                <span className="font-medium">{stats.ordersByStatus.fulfilled}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Annulées</span>
                <span className="font-medium">{stats.ordersByStatus.canceled}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commandes par Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Livraison</span>
                <span className="font-medium">{stats.ordersByMode.delivery}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Retrait sur place</span>
                <span className="font-medium">{stats.ordersByMode.pickup}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
