import Link from 'next/link';
import { ArrowLeft, Home, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivoire flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">

        {/* Error Code - Large display number */}
        <div className="relative">
          <div className="text-[180px] md:text-[240px] font-display font-bold leading-none text-terra/10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl md:text-7xl">♡</div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-encre">
            Cette page n'existe pas
          </h1>
          <p className="font-display text-xl md:text-2xl font-light italic text-encre/70">
            (encore)
          </p>
          <p className="font-sans text-base text-pierre leading-relaxed max-w-md mx-auto">
            Peut-être cherchez-vous un objet qui raconte Alfortville ?
            Retournez à la boutique pour découvrir nos créations.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            asChild
            size="lg"
            className="bg-terra hover:bg-terra/90 text-ivoire font-sans font-semibold px-8 h-14 rounded-xl shadow-lg"
          >
            <Link href="/collection">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Voir la collection
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-encre/20 text-encre hover:bg-encre/5 font-sans font-medium px-8 h-14 rounded-xl"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>

        {/* Breadcrumb hint */}
        <div className="pt-8 border-t border-encre/10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-pierre hover:text-encre transition-colors font-sans"
          >
            <ArrowLeft className="h-4 w-4" />
            Revenir en arrière
          </Link>
        </div>

        {/* Easter egg - subtle */}
        <p className="text-xs text-pierre/50 font-sans pt-8">
          Erreur 404 · Page introuvable · 1885 Manufacture Alfortvillaise
        </p>
      </div>
    </div>
  );
}
