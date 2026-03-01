import { PremiumBadge, PremiumDot, PremiumBadgeIcon } from "@/components/ui/premium-badge"
import {
  GoldDivider,
  GoldDividerText,
  GoldDividerVertical,
  GoldDividerDecorative,
} from "@/components/ui/gold-divider"
import {
  ChampagneCTA,
  ChampagneCTAGroup,
  ChampagneFAB,
} from "@/components/ui/champagne-cta"
import { Award, Crown, Gift, ShoppingBag, Sparkles, Star, Zap } from "lucide-react"

/**
 * Premium Components Demo Page
 *
 * Showcase of all champagne gold premium components
 * Following 1885 brand identity (70% Cloud Dancer, 25% Love Symbol, 5% Champagne Gold)
 */

export default function PremiumDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-cloud-champagne">
      <div className="container max-w-6xl py-16 space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <PremiumBadge label="Collection Exclusive 1885" size="lg" />
          <h1 className="font-display text-6xl font-bold text-gradient-love-champagne">
            Premium Components
          </h1>
          <p className="text-slate text-xl max-w-2xl mx-auto">
            Découvrez nos composants premium avec accents champagne gold,
            conçus pour une élégance intemporelle.
          </p>
        </section>

        <GoldDividerDecorative />

        {/* Premium Badges Section */}
        <section className="space-y-8">
          <div>
            <h2 className="font-display text-4xl font-bold text-foreground mb-2">
              Premium Badges
            </h2>
            <p className="text-slate">Badges élégants pour mettre en valeur vos contenus premium</p>
          </div>

          <div className="grid gap-8">
            {/* Variants */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-foreground">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <PremiumBadge label="Outlined (Default)" variant="outlined" />
                <PremiumBadge label="Solid" variant="solid" />
                <PremiumBadge label="Glass" variant="glass" />
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-foreground">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <PremiumBadge label="Small" size="sm" />
                <PremiumBadge label="Medium" size="md" />
                <PremiumBadge label="Large" size="lg" />
              </div>
            </div>

            {/* With/Without Star */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-foreground">Icon Options</h3>
              <div className="flex flex-wrap gap-4">
                <PremiumBadge label="Avec étoile" showStar />
                <PremiumBadge label="Sans étoile" showStar={false} />
                <PremiumDot />
              </div>
            </div>

            {/* Custom Icons */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-foreground">Custom Icons</h3>
              <div className="flex flex-wrap gap-4">
                <PremiumBadgeIcon
                  label="Nouveauté"
                  icon={<Sparkles className="h-3.5 w-3.5 text-champagne" />}
                  variant="outlined"
                />
                <PremiumBadgeIcon
                  label="Édition Limitée"
                  icon={<Crown className="h-3.5 w-3.5 text-white" />}
                  variant="solid"
                />
                <PremiumBadgeIcon
                  label="Récompensé"
                  icon={<Award className="h-3.5 w-3.5 text-champagne-dark" />}
                  variant="glass"
                />
                <PremiumBadgeIcon
                  label="Exclusif"
                  icon={<Zap className="h-3.5 w-3.5 text-champagne-dark" />}
                  variant="glass"
                />
              </div>
            </div>

            {/* Use Cases */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-foreground">Use Cases</h3>
              <div className="flex flex-wrap gap-4">
                <PremiumBadge label="Nouveau" variant="solid" size="sm" />
                <PremiumBadge label="Meilleure Vente" variant="outlined" />
                <PremiumBadge label="Stock Limité" variant="glass" showStar={false} />
                <PremiumBadge label="Fait Main" variant="outlined" size="lg" />
              </div>
            </div>
          </div>
        </section>

        <GoldDivider variant="diamond" spacing="lg" />

        {/* Gold Dividers Section */}
        <section className="space-y-8">
          <div>
            <h2 className="font-display text-4xl font-bold text-foreground mb-2">
              Gold Dividers
            </h2>
            <p className="text-slate">Séparateurs élégants pour structurer vos contenus</p>
          </div>

          <div className="space-y-12">
            {/* Circle Variant */}
            <div>
              <h3 className="font-display text-2xl text-foreground mb-4">Circle (Default)</h3>
              <GoldDivider variant="circle" spacing="sm" />
            </div>

            {/* Diamond Variant */}
            <div>
              <h3 className="font-display text-2xl text-foreground mb-4">Diamond</h3>
              <GoldDivider variant="diamond" spacing="sm" />
            </div>

            {/* Line Only */}
            <div>
              <h3 className="font-display text-2xl text-foreground mb-4">Line Only</h3>
              <GoldDivider variant="line" spacing="sm" />
            </div>

            {/* With Text */}
            <div>
              <h3 className="font-display text-2xl text-foreground mb-4">With Text</h3>
              <GoldDividerText text="Collection Signature" />
            </div>

            {/* Decorative */}
            <div>
              <h3 className="font-display text-2xl text-foreground mb-4">Decorative</h3>
              <GoldDividerDecorative />
            </div>

            {/* Custom Icon */}
            <div>
              <h3 className="font-display text-2xl text-foreground mb-4">Custom Icon</h3>
              <GoldDivider variant="custom" ornament={<Star className="h-4 w-4 fill-champagne text-champagne" />} spacing="sm" />
            </div>

            {/* Vertical (in horizontal layout) */}
            <div>
              <h3 className="font-display text-2xl text-foreground mb-4">Vertical Divider</h3>
              <div className="flex items-center gap-8 justify-center">
                <span className="text-slate">Section A</span>
                <GoldDividerVertical height="h-16" />
                <span className="text-slate">Section B</span>
                <GoldDividerVertical height="h-16" />
                <span className="text-slate">Section C</span>
              </div>
            </div>
          </div>
        </section>

        <GoldDividerText text="Call to Actions" />

        {/* Champagne CTAs Section */}
        <section className="space-y-8">
          <div>
            <h2 className="font-display text-4xl font-bold text-foreground mb-2">
              Champagne CTAs
            </h2>
            <p className="text-slate">Boutons premium pour vos actions à forte valeur</p>
          </div>

          <div className="grid gap-8">
            {/* Variants */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-foreground">Variants</h3>
              <ChampagneCTAGroup>
                <ChampagneCTA variant="solid">Solid (Default)</ChampagneCTA>
                <ChampagneCTA variant="outline">Outline</ChampagneCTA>
                <ChampagneCTA variant="ghost">Ghost</ChampagneCTA>
              </ChampagneCTAGroup>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-foreground">Sizes</h3>
              <ChampagneCTAGroup>
                <ChampagneCTA size="sm">Small</ChampagneCTA>
                <ChampagneCTA size="md">Medium</ChampagneCTA>
                <ChampagneCTA size="lg">Large</ChampagneCTA>
                <ChampagneCTA size="xl">Extra Large</ChampagneCTA>
              </ChampagneCTAGroup>
            </div>

            {/* Icons */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-foreground">Icons</h3>
              <ChampagneCTAGroup>
                <ChampagneCTA icon="arrow">With Arrow</ChampagneCTA>
                <ChampagneCTA icon="sparkles">With Sparkles</ChampagneCTA>
                <ChampagneCTA icon="none">No Icon</ChampagneCTA>
                <ChampagneCTA icon={<ShoppingBag className="h-5 w-5" />}>
                  Custom Icon
                </ChampagneCTA>
              </ChampagneCTAGroup>
            </div>

            {/* Icon Position */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-foreground">Icon Position</h3>
              <ChampagneCTAGroup>
                <ChampagneCTA iconPosition="left">Icon Left</ChampagneCTA>
                <ChampagneCTA iconPosition="right">Icon Right</ChampagneCTA>
              </ChampagneCTAGroup>
            </div>

            {/* Full Width */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-foreground">Full Width</h3>
              <ChampagneCTA fullWidth>Découvrir la Collection Exclusive</ChampagneCTA>
            </div>

            {/* States */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-foreground">States</h3>
              <ChampagneCTAGroup>
                <ChampagneCTA>Normal</ChampagneCTA>
                <ChampagneCTA disabled>Disabled</ChampagneCTA>
              </ChampagneCTAGroup>
            </div>

            {/* Real-World Examples */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-foreground">Real-World Examples</h3>
              <ChampagneCTAGroup orientation="vertical">
                <ChampagneCTA size="lg" icon="sparkles">
                  Découvrir la Collection 1885
                </ChampagneCTA>
                <ChampagneCTA variant="outline" icon={<Gift className="h-5 w-5" />}>
                  Offrir un Cadeau Premium
                </ChampagneCTA>
                <ChampagneCTA variant="ghost" icon="arrow" size="sm">
                  En savoir plus
                </ChampagneCTA>
              </ChampagneCTAGroup>
            </div>
          </div>
        </section>

        <GoldDividerDecorative />

        {/* Combined Example */}
        <section className="space-y-8">
          <div>
            <h2 className="font-display text-4xl font-bold text-foreground mb-2">
              Combined Example
            </h2>
            <p className="text-slate">Utilisation combinée pour une section premium complète</p>
          </div>

          <div className="rounded-3xl glass-love p-12 space-y-8 relative overflow-hidden">
            {/* Background orb */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-champagne opacity-5 blur-3xl" />

            <div className="relative z-10 text-center space-y-6">
              <PremiumBadge label="Édition Limitée" variant="solid" size="lg" />

              <h3 className="font-display text-5xl font-bold text-gradient-love-champagne">
                Collection Signature 1885
              </h3>

              <p className="text-slate text-lg max-w-2xl mx-auto">
                Découvrez notre collection exclusive de goodies premium,
                alliant tradition municipale et design contemporain.
              </p>

              <GoldDivider variant="diamond" spacing="md" />

              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-champagne fill-champagne/20" />
                  <span className="text-slate">Qualité Premium</span>
                </div>
                <GoldDividerVertical height="h-6" />
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-champagne fill-champagne/20" />
                  <span className="text-slate">Fabrication Française</span>
                </div>
                <GoldDividerVertical height="h-6" />
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-champagne fill-champagne/20" />
                  <span className="text-slate">Stock Limité</span>
                </div>
              </div>

              <ChampagneCTAGroup>
                <ChampagneCTA size="lg" icon="sparkles">
                  Découvrir Maintenant
                </ChampagneCTA>
                <ChampagneCTA variant="outline" size="lg" icon="none">
                  En savoir plus
                </ChampagneCTA>
              </ChampagneCTAGroup>
            </div>
          </div>
        </section>

        <GoldDividerText text="Fin de la Démo" />

        {/* Floating Action Button Demo */}
        <ChampagneFAB
          icon={<ShoppingBag className="h-6 w-6" />}
          label="Panier"
          position="bottom-right"
        />
      </div>
    </div>
  )
}
