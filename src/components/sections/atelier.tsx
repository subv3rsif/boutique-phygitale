'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Atelier() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative bg-encre min-h-[70vh]">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 min-h-[70vh]">
          {/* Left: Image (55%) */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-7 relative min-h-[400px] md:min-h-full"
          >
            <Image
              src="https://placehold.co/1200x1400/2D2620/F2EDE4?text=Atelier+Serigraphie"
              alt="Atelier de sérigraphie 1885"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 55vw"
            />
          </motion.div>

          {/* Right: Text (45%) */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="md:col-span-5 flex items-center px-6 md:px-12 py-16 md:py-24"
          >
            <div className="space-y-8">
              {/* Label */}
              <p className="text-terra text-xs tracking-[0.25em] uppercase">
                L'Atelier
              </p>

              {/* Title */}
              <h2 className="font-display font-bold text-4xl md:text-5xl text-ivoire leading-tight">
                La sérigraphie comme geste fondateur.
              </h2>

              {/* Body */}
              <div className="space-y-4 text-ivoire/55 font-sans text-base leading-[1.7]">
                <p>
                  Depuis l'origine, l'Atelier 1885 pratique la sérigraphie artisanale.
                  Chaque tirage est une pièce unique, portant la trace du geste manuel.
                </p>
                <p>
                  Nos écrans sont préparés sur place, nos encres mélangées à la main.
                  C'est cette authenticité qui fait l'identité de nos créations.
                </p>
              </div>

              {/* CTA */}
              <Button
                variant="outline"
                className="border-ivoire text-ivoire hover:bg-ivoire/10"
                asChild
              >
                <Link href="/atelier">
                  Découvrir l'Atelier
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Terra line signature (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terra" />
    </section>
  );
}
