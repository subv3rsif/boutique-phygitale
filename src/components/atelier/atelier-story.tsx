'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { DropNewsletterSignup } from './drop-newsletter-signup';

export function AtelierStory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref} className="bg-ivoire">
      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
        className="relative h-[60vh] w-full"
      >
        <Image
          src="/atelier/hero-serigraphie.jpg"
          alt="Sérigraphie artisanale à l'Atelier 1885 Alfortville"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-encre/20 to-transparent" />

        {/* Hero Title */}
        <div className="absolute bottom-12 left-0 right-0">
          <div className="max-w-[800px] mx-auto px-6">
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-display text-5xl md:text-6xl font-bold text-ivoire drop-shadow-lg"
            >
              L'Atelier
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="font-sans text-lg text-ivoire/90 mt-3 drop-shadow"
            >
              Manufacture Alfortvillaise · Sérigraphie artisanale
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-[800px] mx-auto px-6 py-16 space-y-12">
        {/* Introduction */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          <p className="font-sans text-lg text-pierre leading-relaxed">
            Il y a quelque chose d'unique dans un objet fabriqué à la main. Une légère
            irrégularité dans l'encre, une teinte qui varie d'un tirage à l'autre — des
            imperfections qui sont en réalité des preuves. La preuve qu'un être humain
            l'a fait, ici, à Alfortville.
          </p>

          <p className="font-sans text-lg text-pierre leading-relaxed">
            L'Atelier 1885 est un atelier de sérigraphie artisanale en régie municipale.
            Chaque pièce qui en sort est numérotée, limitée, éphémère. On n'imprime pas
            à la chaîne. On crée des séries — des drops — annoncées à l'avance,
            épuisables, qui ne reviennent pas.
          </p>
        </motion.div>

        {/* Technical Section with Image */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-6"
        >
          {/* Image 2 - Floating right on desktop */}
          <div className="float-none md:float-right md:w-1/2 md:ml-8 mb-6">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden">
              <Image
                src="/atelier/detail-ecran-serigraphie.jpg"
                alt="Détail d'un écran de sérigraphie, Atelier 1885"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          <p className="font-sans text-lg text-pierre leading-relaxed">
            La sérigraphie, c'est une technique centenaire. De l'encre poussée à travers
            un écran tendu sur un châssis, déposée couche par couche sur le support.
            Chaque couleur est une passe distincte. Chaque passe est une décision.
            C'est lent, précis, et irremplaçable.
          </p>

          <p className="font-sans text-lg text-pierre leading-relaxed">
            Nos supports sont choisis avec soin : coton biologique certifié GOTS,
            papier recyclé, matières sourcées de façon responsable. Parce qu'un objet
            qui raconte une ville doit aussi être digne de ce qu'elle défend.
          </p>
        </motion.div>
      </div>

      {/* Les Drops Section */}
      <div className="w-full py-12">
        <div className="max-w-[800px] mx-auto px-6 mb-8">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl font-bold text-encre mb-6"
          >
            Les drops
          </motion.h2>
        </div>

        {/* Image 3 - Flatlay drops (square format) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative aspect-square w-full max-w-[800px] mx-auto mb-12"
        >
          <Image
            src="/atelier/flatlay-drops.jpg"
            alt="Collection drop sérigraphie 1885 Alfortville, série numérotée"
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </motion.div>

        <div className="max-w-[800px] mx-auto px-6 space-y-6">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-sans text-lg text-pierre leading-relaxed"
          >
            Quatre fois par an, l'Atelier sort une série. Elle s'inspire des événements
            de la ville, de ses saisons, de ses temps forts — la Conquête de l'Œuf d'Or,
            le Marché de Noël, la Journée du Patrimoine. Chaque série a son motif,
            son histoire, son tirage.
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-sans text-xl font-semibold text-encre"
          >
            Quand c'est épuisé, c'est fini.
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-sans text-lg text-pierre leading-relaxed"
          >
            Pour ne pas rater le prochain drop, inscrivez-vous à la liste — vous serez
            les premiers informés.
          </motion.p>

          {/* Newsletter Signup */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <DropNewsletterSignup />
          </motion.div>
        </div>
      </div>

      {/* Engagement Section */}
      <div className="w-full py-12">
        <div className="max-w-[800px] mx-auto px-6 mb-8">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl font-bold text-encre mb-6"
          >
            Notre engagement
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-sans text-lg text-pierre leading-relaxed"
          >
            Chaque objet produit ici contribue, via les bénéfices de la boutique,
            à la caisse des écoles d'Alfortville. Ce que vous achetez ne reste pas
            dans un tiroir — ça finance des projets concrets pour les enfants de la ville.
          </motion.p>
        </div>

        {/* Image 4 - Full width atelier ambiance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative h-[50vh] w-full"
        >
          <Image
            src="/atelier/ambiance-atelier.jpg"
            alt="L'atelier de sérigraphie 1885, Manufacture Alfortvillaise"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </div>
    </div>
  );
}
