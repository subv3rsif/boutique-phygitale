import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatedSection } from './animated-section';

export const metadata: Metadata = {
  title: 'À propos - 1885 Manufacture Alfortvillaise',
  description: 'À la confluence de la Seine et de la Marne, depuis 1885, une ville qui se choisit à chaque génération. Découvrez l\'histoire et les valeurs de la boutique 1885.',
};

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Chapeau - texte d'accroche */}
      <AnimatedSection>
        <section className="bg-ivoire pt-20 pb-20 md:pt-24 md:pb-24 px-4">
          <div className="max-w-[720px] mx-auto">
            <p className="font-['Josefin_Sans'] font-light text-[20px] md:text-[28px] leading-[1.8] text-encre text-center">
              À la confluence de la Seine et de la Marne,
              il y a cent quarante ans, quelques rails de chemin de fer
              tracés entre Paris et Lyon ont suffi à transformer un paysage —
              et à réunir une poignée d'habitants autour d'un idéal,
              d'une terre et de valeurs communes.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Section 1 - Une ville qui se choisit */}
      <AnimatedSection>
        <section className="bg-white py-14 md:py-20 px-4">
          <div className="max-w-[640px] mx-auto">
            <h2 className="font-['Josefin_Sans'] font-bold text-[13px] tracking-[0.2em] uppercase text-terra mb-6">
              Une ville qui se choisit
            </h2>
            <div className="space-y-6 text-encre font-['DM_Sans'] text-[15px] md:text-[17px] leading-[1.8]">
              <p>
                Alfortville n'a pas été construite une fois. Elle se construit
                à chaque génération par ceux qui décident de s'y enraciner.
              </p>
              <p>
                Depuis 1885, ils sont venus de partout. Fuyant une guerre,
                cherchant du travail, suivant quelqu'un qu'ils aimaient.
                Soixante nationalités qui ont regardé ce bout de terre
                entre deux rivières et ont dit : c'est ici.
              </p>
              <p>
                Ils ont ouvert des échoppes, bâti des maisons, inscrit
                leurs enfants à l'école. Ils ont fait vivre les commerces,
                participé à la vie du quartier, rejoint les clubs sportifs.
                Ils ont, chacun à leur façon, fait d'Alfortville leur ville.
              </p>
              <p>
                Ce geste — choisir Alfortville — est le geste fondateur
                de la ville. Et il se répète aujourd'hui, à chaque famille
                qui arrive, à chaque habitant qui décide de rester.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Image 1 - Archive historique (Casino des Fleurs, circa 1900) */}
      <AnimatedSection>
        <section className="relative w-full h-[480px] md:h-[600px]">
          <Image
            src="/a-propos/archive-historique.jpg"
            alt="Casino des Fleurs et commerces d'Alfortville, début du XXe siècle — Archives municipales"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-encre/70 to-transparent p-6 md:p-8">
            <p className="text-ivoire text-sm md:text-base font-['DM_Sans'] max-w-7xl mx-auto">
              Casino des Fleurs, Alfortville — Début du XX<sup>e</sup> siècle, Archives municipales
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Section 2 - L'enracinement et l'ouverture */}
      <AnimatedSection>
        <section className="bg-ivoire py-14 md:py-20 px-4">
          <div className="max-w-[640px] mx-auto">
            <h2 className="font-['Josefin_Sans'] font-bold text-[13px] tracking-[0.2em] uppercase text-terra mb-6">
              L'enracinement et l'ouverture sont ici la même chose
            </h2>
            <div className="space-y-6 text-encre font-['DM_Sans'] text-[15px] md:text-[17px] leading-[1.8]">
              <p>
                Ce qui paraît contradictoire ailleurs est à Alfortville
                une réalité historique : être profondément local
                et profondément ouvert au monde ne s'opposent pas.
                Ils se nourrissent l'un l'autre.
              </p>
              <p>
                Ville au cœur de la métropole du Grand Paris,
                elle a gardé l'âme d'une commune à taille humaine.
                Elle est attachée à son esprit village,
                tout en ayant le monde en partage.
              </p>
              <p>
                C'est cette tension — unique, non reproductible —
                que 1885 choisit de célébrer.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Section 3 - Ce qu'est 1885 (fond encre) */}
      <AnimatedSection>
        <section className="bg-encre py-14 md:py-20 px-4">
          <div className="max-w-[640px] mx-auto">
            <h2 className="font-['Josefin_Sans'] font-bold text-[13px] tracking-[0.2em] uppercase text-terra mb-6">
              Ce qu'est 1885
            </h2>
            <div className="space-y-6 text-ivoire font-['DM_Sans'] text-[15px] md:text-[17px] leading-[1.8]">
              <p>
                1885 est la maison de marque d'Alfortville,
                pilotée par la Direction de la Communication de la ville.
              </p>
              <p>
                Elle rassemble sous un même toit ce qui fait l'identité d'Alfortville :
                son histoire, son street art, ses artisans,
                ses clubs sportifs, sa mémoire imprimée.
              </p>
              <p>
                Chaque objet est pensé ici, produit ici ou co-conçu
                avec les acteurs du territoire. Chaque objet raconte
                un bout de cette ville.
              </p>
              <p>
                Et parce qu'une ville se construit ensemble,
                les bénéfices de la boutique sont intégralement reversés
                à la caisse des écoles d'Alfortville —
                pour financer des projets structurants
                pour les enfants de la ville.
              </p>
              <p>
                Acheter sur 1885, c'est choisir sa ville.
                Une fois de plus.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Section 4 - 4 cartes en grille */}
      <AnimatedSection>
        <section className="bg-ivoire-2 py-14 md:py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {/* Carte 1 - Collections */}
              <div className="space-y-4">
                <div className="text-terra text-2xl">—</div>
                <h3 className="font-['Josefin_Sans'] font-bold text-encre text-lg">
                  Collections
                </h3>
                <p className="font-['DM_Sans'] text-encre text-[15px] leading-[1.8]">
                  L'identité visuelle du territoire.
                  Héritage, street art, clubs sportifs —
                  les objets qui portent l'âme d'Alfortville.
                </p>
              </div>

              {/* Carte 2 - Éditions */}
              <div className="space-y-4">
                <div className="text-terra text-2xl">—</div>
                <h3 className="font-['Josefin_Sans'] font-bold text-encre text-lg">
                  Éditions
                </h3>
                <p className="font-['DM_Sans'] text-encre text-[15px] leading-[1.8]">
                  La mémoire imprimée.
                  Ouvrages du Comité d'Histoire, reproductions
                  d'affiches anciennes, tirages photo grand format.
                </p>
              </div>

              {/* Carte 3 - Artisans */}
              <div className="space-y-4">
                <div className="text-terra text-2xl">—</div>
                <h3 className="font-['Josefin_Sans'] font-bold text-encre text-lg">
                  Artisans
                </h3>
                <p className="font-['DM_Sans'] text-encre text-[15px] leading-[1.8]">
                  Le savoir-faire local sous label 1885.
                  Des objets co-conçus avec les artisans du territoire,
                  disponibles uniquement ici.
                </p>
              </div>

              {/* Carte 4 - Atelier */}
              <div className="space-y-4">
                <div className="text-terra text-2xl">—</div>
                <h3 className="font-['Josefin_Sans'] font-bold text-encre text-lg">
                  Atelier
                </h3>
                <p className="font-['DM_Sans'] text-encre text-[15px] leading-[1.8]">
                  La manufacture en action.
                  Sérigraphie artisanale en régie, séries limitées
                  numérotées, ancrées dans les temps forts de la ville.
                </p>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Image 2 - Berges contemporaines (Pont sur la Seine) */}
      <AnimatedSection>
        <section className="relative w-full h-[400px] md:h-[550px]">
          <Image
            src="/a-propos/berges-alfortville.jpg"
            alt="Pont suspendu sur la Seine au coucher de soleil, berges d'Alfortville"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-encre/70 to-transparent p-6 md:p-8">
            <p className="text-ivoire text-sm md:text-base font-['DM_Sans'] max-w-7xl mx-auto">
              Les berges d'Alfortville — à la confluence de la Seine et de la Marne
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Section 5 - Texte final centré */}
      <AnimatedSection>
        <section className="bg-ivoire py-14 md:py-20 px-4">
          <div className="max-w-[680px] mx-auto">
            <div className="space-y-6 text-encre font-['DM_Sans'] text-[15px] md:text-[17px] leading-[1.8] text-center">
              <p>
                Vous êtes d'Alfortville, ou vous l'aimez.
                Vous y êtes né, vous venez d'arriver,
                ou vous y revenez.
              </p>
              <p>
                Cette boutique est faite pour vous.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Call to Action */}
      <AnimatedSection>
        <section className="bg-white py-12 md:py-16 px-4">
          <div className="text-center">
            <Link
              href="/"
              className="inline-block font-['Josefin_Sans'] font-bold text-ivoire bg-terra px-10 py-4 transition-colors duration-200 hover:bg-encre"
            >
              Découvrir la boutique
            </Link>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
