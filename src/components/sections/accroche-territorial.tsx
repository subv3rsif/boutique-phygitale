'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function AccrocheTerritorial() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="bg-ivoire py-24">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
          {/* Left column: Text (40%) */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-2 space-y-6"
          >
            {/* Eyebrow */}
            <p className="font-sans font-semibold text-sm text-terra uppercase tracking-[0.2em]">
              Alfortville · Depuis 1885
            </p>

            {/* Title */}
            <h2 className="font-display font-bold text-4xl md:text-5xl text-encre leading-tight">
              Une ville. Des objets. Une histoire.
            </h2>

            {/* Body */}
            <p className="font-sans text-base text-pierre leading-relaxed">
              Vous êtes d'Alfortville, ou vous l'aimez. Cette boutique est faite pour vous. 
              Des objets qu'on ne trouve nulle part ailleurs, imaginés avec les gens d'ici, 
              pour raconter une ville qui mérite d'être portée. 
            </p>

            {/* CTA */}
            <Link
              href="/atelier"
              className="inline-flex items-center gap-2 text-terra hover:gap-3 transition-all duration-300 font-medium"
            >
              Découvrir l'Atelier
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Right column: Image (60%) */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="md:col-span-3 relative aspect-[3/4]"
          >
            <Image
              src="/atelier-serigraphie.jpg"
              alt="Atelier de sérigraphie 1885 Alfortville"
              fill
              priority
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 60vw"
            />

            {/* Badge overlay */}
            <div className="absolute bottom-6 left-6 bg-terra text-ivoire px-4 py-3 rounded">
              <span className="font-display font-bold text-2xl">1885</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
