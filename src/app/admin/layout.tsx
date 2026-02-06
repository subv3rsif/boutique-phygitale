import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, QrCode, LogOut } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');

  if (!session) {
    redirect('/login');
  }

  // Parse session to get user email
  let userEmail = '';
  try {
    const sessionData = JSON.parse(session.value);
    userEmail = sessionData.email;
  } catch {
    redirect('/login');
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Commandes',
      href: '/admin/orders',
      icon: Package,
    },
    {
      name: 'Scanner QR',
      href: '/admin/pickup',
      icon: QrCode,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-card border-r">
        <div className="flex flex-col h-full">
          {/* Logo/Title */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold">Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Boutique Ville
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info & Logout */}
          <div className="p-4 border-t">
            <div className="mb-3">
              <p className="text-sm font-medium truncate">{userEmail}</p>
              <p className="text-xs text-muted-foreground">Administrateur</p>
            </div>

            <form action="/api/auth/logout" method="POST">
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                size="sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
