'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Home } from 'lucide-react';
import { useCart } from '@/store/cart';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = searchParams?.get('session_id');
  const clear = useCart((state) => state.clear);

  useEffect(() => {
    if (!sessionId) {
      // No session ID, redirect to home
      router.push('/');
      return;
    }

    // Clear cart on success
    clear();

    // Simulate loading (webhook processing)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId, router, clear]);

  if (!sessionId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <Card className="max-w-lg mx-auto text-center">
          <CardHeader>
            <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
            <CardTitle>Traitement de votre paiement...</CardTitle>
            <CardDescription>
              Veuillez patienter, nous confirmons votre commande
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Card className="max-w-lg mx-auto text-center">
        <CardHeader>
          <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <CardTitle className="text-2xl">Commande confirmée !</CardTitle>
          <CardDescription>
            Merci pour votre achat. Vous allez recevoir un email de confirmation dans quelques instants.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-left space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-medium mb-2">Prochaines étapes :</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Vous recevrez un email de confirmation</li>
              <li>Suivez l'état de votre commande par email</li>
              <li>Pour toute question, contactez support@ville.fr</li>
            </ul>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Note :</strong> Si vous ne recevez pas d'email dans les 10 prochaines minutes,
              vérifiez votre dossier spam ou contactez-nous.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Link href="/" className="w-full">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Retour à la boutique
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-12">
          <Card className="max-w-lg mx-auto text-center">
            <CardHeader>
              <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
              <CardTitle>Chargement...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
