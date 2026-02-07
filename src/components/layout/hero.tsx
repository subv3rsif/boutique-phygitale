'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1], // Custom easing
    },
  },
};

const floatingAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero min-h-[70vh] flex items-center">
      {/* Animated Background Grain */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] animate-grain" />
      </div>

      {/* Floating Orbs - Dark mode glow effect */}
      <motion.div
        className="absolute top-20 left-[10%] w-64 h-64 bg-primary/20 rounded-full blur-[100px] dark:magenta-glow"
        animate={floatingAnimation}
      />
      <motion.div
        className="absolute bottom-20 right-[15%] w-80 h-80 bg-secondary/15 rounded-full blur-[120px]"
        animate={{
          y: [0, 15, 0],
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay: 0.5,
          },
        }}
      />

      {/* Content */}
      <div className="container relative z-10 px-4 py-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl mx-auto text-center space-y-8"
        >
          {/* Badge */}
          <motion.div variants={item} className="flex justify-center">
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full",
              "bg-card/80 backdrop-blur-sm border border-border",
              "text-sm font-medium text-foreground"
            )}>
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Édition Municipale 1885</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="font-display text-5xl md:text-7xl font-bold text-foreground leading-[1.1] tracking-tight"
          >
            Objets d'exception
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-secondary">
              pour votre ville
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={item}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Une collection soigneusement éditée de goodies municipaux.
            Livraison à domicile ou retrait gratuit à La Fabrik.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="#catalogue">
              <Button
                size="lg"
                className={cn(
                  "group relative overflow-hidden",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "dark:magenta-glow transition-all duration-300",
                  "font-semibold px-8 py-6 text-base"
                )}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Découvrir la collection
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>

                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </Button>
            </Link>

            <Link href="/nouveautes">
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "border-border hover:bg-card/80 hover:border-primary",
                  "font-semibold px-8 py-6 text-base",
                  "transition-all duration-300"
                )}
              >
                Voir les nouveautés
              </Button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={item}
            className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Édition limitée</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Livraison 2-3 jours</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Retrait gratuit</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
