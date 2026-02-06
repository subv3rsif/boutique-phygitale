import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchX, Home, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <SearchX className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Page introuvable</CardTitle>
          <CardDescription className="text-base mt-2">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 404 visual */}
          <div className="text-center py-6">
            <p className="text-6xl font-bold text-slate-200">404</p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-col gap-3">
            <Button
              asChild
              className="w-full"
              size="lg"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Link href="/">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Voir le catalogue
              </Link>
            </Button>
          </div>

          {/* Help links */}
          <div className="pt-4 border-t">
            <p className="text-sm text-slate-600 text-center mb-3">
              Liens utiles
            </p>
            <div className="flex flex-wrap gap-2 justify-center text-sm">
              <Link
                href="/mentions-legales"
                className="text-blue-600 hover:underline"
              >
                Mentions légales
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                href="/cgv"
                className="text-blue-600 hover:underline"
              >
                CGV
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                href="/politique-confidentialite"
                className="text-blue-600 hover:underline"
              >
                Confidentialité
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
