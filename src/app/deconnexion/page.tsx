// src/app/deconnexion/page.tsx
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/lib/auth/config';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Déconnexion - Boutique 1885',
};

/**
 * Logout Page
 * Shows a confirmation before signing out
 */
export default async function LogoutPage() {
  const session = await auth();

  // If not logged in, redirect to home
  if (!session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivoire px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-pierre/10 p-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-amethyste/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-amethyste"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-display font-bold text-encre mb-3">
          Se déconnecter
        </h1>

        {/* Description */}
        <p className="text-pierre mb-8">
          Voulez-vous vraiment vous déconnecter ?
          {session.user?.email && (
            <>
              <br />
              <span className="text-sm font-medium text-encre">
                {session.user.email}
              </span>
            </>
          )}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <Button
              type="submit"
              className="w-full bg-amethyste hover:bg-amethyste-2 text-ivoire"
            >
              Oui, me déconnecter
            </Button>
          </form>

          <Button
            asChild
            variant="outline"
            className="w-full border-pierre/20 hover:bg-pierre/5"
          >
            <a href="/admin">Annuler</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
