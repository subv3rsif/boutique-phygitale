'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';

export function DropNewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!email || !email.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/drop-newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      // Success
      setIsSubscribed(true);
      setEmail('');
      toast.success('Inscription réussie !', {
        description: 'Vous serez parmi les premiers informés.',
      });
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message || 'Impossible de s\'inscrire pour le moment.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="bg-terra/10 border-2 border-terra rounded-lg p-6 text-center">
        <Check className="h-8 w-8 text-terra mx-auto mb-3" />
        <p className="font-sans text-lg font-semibold text-encre mb-2">
          Vous êtes inscrit·e !
        </p>
        <p className="font-sans text-sm text-pierre">
          Vous serez parmi les premiers informés du prochain drop.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="drop-email" className="font-sans text-base font-semibold text-encre">
          Prochain drop
        </Label>
        <div className="flex gap-3">
          <Input
            id="drop-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.fr"
            required
            disabled={isLoading}
            className="flex-1 bg-white border-pierre/30 focus:border-terra"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-terra hover:bg-terra/90 text-ivoire px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Envoi...
              </>
            ) : (
              "Je m'inscris"
            )}
          </Button>
        </div>
        <p className="text-xs text-pierre">
          Un email par drop maximum (environ 4 fois par an). Désinscription facile.
        </p>
      </div>
    </form>
  );
}
