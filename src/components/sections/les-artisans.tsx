'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

// Hardcoded artisan data for Phase 2
// Phase 4 will fetch from API
const artisans = [
  {
    id: '1',
    name: 'Thomas Moreau',
    metier: 'Chef Pâtissier',
    bio: 'Créateur de douceurs artisanales inspirées du terroir. Chocolats et confiseries d\'exception.',
    image: '/artisans/chef-cuisinier.jpg',
  },
  {
    id: '2',
    name: 'Claire Lefebvre',
    metier: 'Artisan Textile',
    bio: 'Spécialisée en sérigraphie et broderie. Chaque pièce textile raconte une histoire.',
    image: '/artisans/artisan-textile.jpg',
  },
  {
    id: '3',
    name: 'Emma Rousseau',
    metier: 'Céramiste',
    bio: 'Créatrice de pièces en céramique tournées à la main. Design contemporain et savoir-faire ancestral.',
    image: '/artisans/ceramiste.jpg',
  },
];

export function LesArtisans() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="bg-ivoire py-24">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-terra text-xs tracking-[0.25em] uppercase"
          >
            Fait ici
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-4xl md:text-5xl text-encre"
          >
            Ceux qui fabriquent
          </motion.h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {artisans.map((artisan, index) => (
            <motion.article
              key={artisan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group space-y-4"
            >
              {/* Photo portrait */}
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={artisan.image}
                  alt={artisan.name}
                  fill
                  className="object-cover grayscale-[30%] sepia-[20%] group-hover:grayscale-0 group-hover:sepia-0 transition-all duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              {/* Details */}
              <div className="space-y-2">
                <h3 className="font-display font-bold text-2xl text-encre">
                  {artisan.name}
                </h3>

                <p className="font-sans font-medium text-sm text-terra">
                  {artisan.metier}
                </p>

                <p className="font-sans text-sm text-pierre/80 leading-relaxed">
                  {artisan.bio}
                </p>

                <Link
                  href={`/artisans#${artisan.id}`}
                  className="inline-flex items-center gap-2 text-terra font-medium hover:gap-3 transition-all duration-300 text-sm"
                >
                  Voir ses créations
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
