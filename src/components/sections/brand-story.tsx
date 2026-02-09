'use client';

import { motion } from 'framer-motion';
import { Sparkles, Heart, Leaf, Users } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Passion Locale',
    description: 'Chaque création célèbre l\'identité unique de notre ville et son patrimoine.'
  },
  {
    icon: Leaf,
    title: 'Éco-Responsable',
    description: 'Production locale et matériaux durables pour un impact environnemental minimal.'
  },
  {
    icon: Sparkles,
    title: 'Qualité Premium',
    description: 'Des produits soigneusement sélectionnés pour leur excellence et leur durabilité.'
  },
  {
    icon: Users,
    title: 'Communauté',
    description: 'Créer du lien social à travers des objets qui racontent notre histoire commune.'
  },
];

export function BrandStory() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-love-cloud opacity-5" />
      <div className="absolute inset-0 radial-gradient-overlay" />
      <div className="absolute inset-0 grid-lines opacity-30" />

      <div className="container relative z-10 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-love text-sm font-semibold text-primary uppercase tracking-wider shimmer">
              <Sparkles className="h-4 w-4" />
              La Démarche 1885
            </span>
          </motion.div>

          <h2 className="font-display text-5xl md:text-7xl font-light italic text-foreground mb-6">
            Une Histoire de
            <br />
            <span className="font-semibold not-italic text-gradient-love-vibrant">
              Passion & Authenticité
            </span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Depuis 1885, notre ville cultive un héritage d'excellence et d'innovation.
            Notre boutique perpétue cette tradition en créant des objets qui incarnent
            nos valeurs et célèbrent notre identité unique.
          </p>
        </motion.div>

        {/* Story Content - Split Layout */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 mb-20">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden gradient-border-animated shadow-vibrant-lg hover-glow">
              {/* Placeholder Image */}
              <div className="absolute inset-0 bg-gradient-love-vibrant animate-gradient" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-cloud-dancer p-8">
                  <p className="text-6xl font-display font-bold mb-4">1885</p>
                  <p className="text-xl font-light">Notre Héritage</p>
                </div>
              </div>

              {/* Shimmer overlay */}
              <div className="absolute inset-0 shimmer-auto pointer-events-none" />
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute -bottom-6 -right-6 glass-vibrant rounded-2xl p-6 shadow-vibrant love-glow-sm"
            >
              <p className="text-4xl font-display font-bold text-gradient-love">140+</p>
              <p className="text-sm text-muted-foreground mt-1">Ans d'Histoire</p>
            </motion.div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col justify-center space-y-6"
          >
            <div className="space-y-4">
              <h3 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
                Bien plus que des objets
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Chaque produit de notre collection raconte une histoire. Celle d'un savoir-faire
                local, d'artisans passionnés, et d'une communauté fière de son identité.
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg">
                En choisissant nos créations, vous soutenez une démarche responsable qui
                valorise le travail local et préserve notre patrimoine pour les générations
                futures.
              </p>
            </div>

            <div className="pt-4">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-love text-primary-foreground font-semibold hover-glow transition-vibrant cursor-pointer">
                <Heart className="h-5 w-5" />
                <span>Fabriqué avec Passion</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: 0.1 * index,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="relative group"
              >
                <div className="h-full p-6 rounded-2xl glass-vibrant border border-border hover:border-primary/30 transition-vibrant interactive-glow">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-love text-primary-foreground mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <h4 className="font-display text-xl font-semibold text-foreground mb-2">
                    {value.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
