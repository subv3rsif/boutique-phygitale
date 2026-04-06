import Link from 'next/link';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CategoryEmptyProps = {
  categoryName: string;
};

export function CategoryEmpty({ categoryName }: CategoryEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Icon */}
      <div className="mb-6">
        <Package className="h-16 w-16 text-muted-foreground/40" strokeWidth={1.5} />
      </div>

      {/* Primary message */}
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-3">
        Aucun produit dans cette catégorie
      </h2>

      {/* Secondary message */}
      <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-md">
        Revenez bientôt pour découvrir nos nouveautés !
      </p>

      {/* Call to action */}
      <Button asChild size="lg" className="rounded-xl">
        <Link href="/">Voir toute la collection</Link>
      </Button>
    </div>
  );
}
