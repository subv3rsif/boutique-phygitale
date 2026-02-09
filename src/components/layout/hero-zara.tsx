'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MoveDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

export function HeroZara() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax effect
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen overflow-hidden bg-background"
    >
      {/* Image Background - Parallax */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 -z-10"
      >
        {/* Placeholder for hero image - would be a product photo in Zara style */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 dark:from-purple-950 dark:to-purple-900">
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 grid-lines opacity-30" />

          {/* Large centered product visual (would be actual photo) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-[60vw] h-[80vh] bg-foreground/5 backdrop-blur-3xl" />
          </div>
        </div>

        {/* Gradient overlay pour lisibilité texte */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
      </motion.div>

      {/* Content - Centered & Minimal */}
      <motion.div
        style={{ opacity }}
        className="relative h-full flex flex-col items-center justify-center text-center px-4"
      >
        <div className="max-w-5xl space-y-12">
          {/* Kicker text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm tracking-[0.3em] uppercase text-muted-foreground font-sans font-light"
          >
            Collection Municipale
          </motion.p>

          {/* Giant headline - très Zara */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="font-display text-6xl md:text-8xl lg:text-9xl font-light italic leading-[0.9] text-foreground"
          >
            Édition
            <br />
            <span className="font-semibold not-italic">1885</span>
          </motion.h1>

          {/* Subtitle - minimal */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-base md:text-lg text-muted-foreground font-sans font-light max-w-md mx-auto leading-relaxed"
          >
            Objets d'exception pour votre ville
          </motion.p>

          {/* CTA - Brutal minimal button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="pt-4"
          >
            <Link href="#collection">
              <Button
                size="lg"
                className={cn(
                  "group relative h-14 px-10",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "rounded-none border-0", // Brutal - no radius
                  "font-sans font-medium tracking-wide uppercase text-sm",
                  "transition-luxury",
                  "dark:purple-glow"
                )}
              >
                <span className="flex items-center gap-3">
                  Découvrir
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator - Zara style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center gap-3 text-muted-foreground"
          >
            <span className="text-xs tracking-wider uppercase font-sans font-light">
              Scroll
            </span>
            <MoveDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
