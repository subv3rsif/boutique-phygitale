'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Heart, Users, Sprout, MapPin } from 'lucide-react';

const impactStats = [
  {
    icon: Heart,
    value: '100%',
    label: 'des bénéfices reversés',
    description: 'À la caisse des écoles d\'Alfortville pour financer des projets pour les enfants',
  },
  {
    icon: Sprout,
    value: '100%',
    label: 'fabrication locale',
    description: 'Sérigraphie artisanale en atelier municipal, circuit court garanti',
  },
  {
    icon: Users,
    value: '60',
    label: 'nationalités',
    description: 'Une ville qui se construit ensemble depuis 1885',
  },
  {
    icon: MapPin,
    value: '0 km',
    label: 'de transport inutile',
    description: 'Retrait gratuit à La Fabrik, au cœur d\'Alfortville',
  },
];

export function ImpactSocial() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="bg-encre py-20 md:py-28">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <p className="font-sans font-semibold text-sm text-terra uppercase tracking-[0.2em] mb-4">
            Commerce Municipal d'Intérêt Général
          </p>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-ivoire leading-tight mb-6">
            Un projet au service du territoire
          </h2>
          <p className="font-sans text-lg text-ivoire/80 max-w-2xl mx-auto leading-relaxed">
            Chaque objet acheté contribue directement au financement de projets
            éducatifs et culturels pour les enfants d'Alfortville.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {impactStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ y: 40, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : {}}
                transition={{
                  duration: 0.7,
                  delay: 0.2 + index * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="relative group"
              >
                {/* Card */}
                <div className="bg-ivoire/5 backdrop-blur-sm border border-ivoire/10 rounded-2xl p-6 h-full hover:bg-ivoire/10 hover:border-ivoire/20 transition-all duration-300">

                  {/* Icon */}
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-terra/20 text-terra">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Value */}
                  <div className="font-display text-4xl md:text-5xl font-bold text-ivoire mb-2 leading-none">
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div className="font-sans text-base font-semibold text-terra uppercase tracking-wide mb-3">
                    {stat.label}
                  </div>

                  {/* Description */}
                  <p className="font-sans text-sm text-ivoire/70 leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA - Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-terra/10 border border-terra/30 rounded-full px-6 py-3">
            <Heart className="h-5 w-5 text-terra fill-terra" />
            <span className="font-sans text-sm font-medium text-ivoire">
              Acheter sur 1885, c'est choisir sa ville
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
