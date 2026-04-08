import { Loader2 } from 'lucide-react';

/**
 * Custom Loading Screen - Love Symbol Theme
 *
 * Appears during navigation/data fetching
 * Styled with brand colors (#503B64 Love Symbol × #F3EFEA Cloud Dancer)
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        {/* Animated logo/icon */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 animate-pulse" />
          </div>

          {/* Spinner */}
          <div className="relative flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <p className="font-display text-lg font-semibold text-foreground animate-pulse">
            Chargement...
          </p>
          <p className="text-sm text-muted-foreground">
            Préparation de votre expérience
          </p>
        </div>
      </div>
    </div>
  );
}
