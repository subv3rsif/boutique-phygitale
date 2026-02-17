'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Word Reveal Animation ─────────────────────────────────────────────────────
function WordReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  const words = text.split(' ');

  return (
    <span ref={ref} className={cn('inline-flex flex-wrap gap-x-[0.25em]', className)}>
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: '110%', opacity: 0 }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ─── Marquee strip ─────────────────────────────────────────────────────────────
const marqueeItems = [
  'Mug Édition 2024',
  '·',
  'Tote Bag Héritage',
  '·',
  'Carnet Édition',
  '·',
  'Sweat Love Edition',
  '·',
  'Gourde Inox',
  '·',
  'Pin\'s Collector',
  '·',
  'Livraison La Poste',
  '·',
  'Retrait La Fabrik',
  '·',
];

function Marquee() {
  return (
    <div className="relative overflow-hidden py-3 border-t border-b border-border/50">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
      >
        {/* Doubled for seamless loop */}
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span
            key={i}
            className={cn(
              'font-sans text-xs tracking-widest uppercase',
              item === '·'
                ? 'text-primary opacity-50'
                : 'text-muted-foreground hover:text-foreground transition-colors cursor-default'
            )}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Floating Orb ──────────────────────────────────────────────────────────────
function FloatingOrb({
  size,
  x,
  y,
  delay,
  opacity,
}: {
  size: number;
  x: string;
  y: string;
  delay: number;
  opacity: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-gradient-love pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        opacity,
        filter: 'blur(60px)',
      }}
      animate={{
        y: [0, -30, 0],
        scale: [1, 1.08, 1],
        opacity: [opacity, opacity * 0.7, opacity],
      }}
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
}

// ─── Product Visual Mockup ─────────────────────────────────────────────────────
function HeroVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Floating orbs */}
      <FloatingOrb size={300} x="10%" y="20%" delay={0} opacity={0.15} />
      <FloatingOrb size={200} x="60%" y="60%" delay={2} opacity={0.1} />
      <FloatingOrb size={150} x="70%" y="10%" delay={1} opacity={0.08} />

      {/* Main visual block — placeholder for hero product image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-[280px] md:w-[340px] lg:w-[400px]"
      >
        {/* Rotating gradient ring */}
        <motion.div
          className="absolute inset-[-16px] rounded-[40px] opacity-40"
          style={{
            background: 'conic-gradient(from 0deg, rgb(80,59,100), rgb(130,110,150), rgb(243,239,234), rgb(80,59,100))',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        {/* Card */}
        <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden bg-gradient-love-vibrant animate-gradient shadow-vibrant-lg">
          {/* Inner content — stylized "1885" monogram placeholder */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-center space-y-2"
            >
              <p className="text-[80px] md:text-[100px] font-display font-bold leading-none tracking-tight opacity-30">
                ♡
              </p>
              <p className="font-display text-2xl font-semibold tracking-wide">
                Édition 1885
              </p>
              <p className="font-sans text-sm font-light opacity-70 tracking-wider uppercase">
                Collection Municipale
              </p>
            </motion.div>
          </div>

          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer-auto pointer-events-none opacity-50" />
        </div>

        {/* Floating price badge */}
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -bottom-4 -right-4 glass-vibrant rounded-2xl px-4 py-3 shadow-vibrant love-glow-sm border border-border/50"
        >
          <p className="text-xs text-muted-foreground font-sans font-medium uppercase tracking-wider">
            À partir de
          </p>
          <p className="font-display text-2xl font-bold text-gradient-love">7 €</p>
        </motion.div>

        {/* Floating "Livraison" badge */}
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -top-4 -left-4 glass-vibrant rounded-2xl px-4 py-3 shadow-vibrant border border-border/50"
        >
          <p className="text-xs font-sans font-semibold text-primary flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            Livraison disponible
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Main Hero ─────────────────────────────────────────────────────────────────
export function HeroCinematic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-background flex flex-col"
    >
      {/* Subtle grid lines background */}
      <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />

      {/* Radial gradient at top */}
      <div className="absolute top-0 left-0 right-0 h-[60vh] radial-gradient-overlay pointer-events-none" />

      {/* Main Content — split layout */}
      <motion.div
        style={{ opacity }}
        className="relative flex-1 flex flex-col"
      >
        <div className="flex-1 grid md:grid-cols-2 items-center gap-0 min-h-[calc(100vh-80px)] px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto w-full">

          {/* ── Left: Text ── */}
          <motion.div
            style={{ y: textY }}
            className="relative z-10 flex flex-col justify-center py-20 md:py-0 space-y-8"
          >
            {/* Kicker */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <span className="inline-block w-8 h-[1px] bg-primary" />
              <span className="text-xs tracking-[0.4em] uppercase text-muted-foreground font-sans font-light">
                Collection Municipale
              </span>
            </motion.div>

            {/* Giant Headline — word reveal */}
            <div className="space-y-1">
              <h1 className="font-display leading-[0.88] text-foreground">
                <div className="text-[clamp(3.5rem,9vw,7.5rem)] font-light italic overflow-hidden">
                  <WordReveal text="Édition" delay={0.3} />
                </div>
                <div className="text-[clamp(3.5rem,9vw,7.5rem)] font-bold not-italic text-gradient-love overflow-hidden">
                  <WordReveal text="1885" delay={0.5} />
                </div>
              </h1>
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.9 }}
              className="text-base md:text-lg text-muted-foreground font-sans font-light max-w-sm leading-relaxed"
            >
              Objets d'exception qui célèbrent l'identité de notre ville.
              <br />
              Livraison La Poste ou retrait à La Fabrik.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link href="#collection">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'group relative h-14 px-8',
                    'bg-primary text-primary-foreground',
                    'rounded-2xl shadow-vibrant',
                    'font-sans font-semibold tracking-wide text-sm',
                    'inline-flex items-center gap-3',
                    'transition-all duration-300 hover:shadow-vibrant-lg hover-glow'
                  )}
                >
                  Découvrir la collection
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </Link>

              <Link
                href="/panier"
                className="h-14 px-8 inline-flex items-center gap-2 rounded-2xl border border-border text-foreground font-sans font-medium text-sm hover:border-primary/50 hover:bg-muted transition-all duration-300"
              >
                Voir le panier
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="flex items-center gap-4 pt-2"
            >
              <div className="flex -space-x-2">
                {['#503B64', '#82 6E96', '#A091AF', '#C4BAD0'].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background bg-gradient-love"
                    style={{ zIndex: 4 - i, filter: `brightness(${1 - i * 0.15})` }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground font-sans">
                <span className="font-semibold text-foreground">140+</span> ans d'histoire · {' '}
                <span className="font-semibold text-foreground">10</span> créations disponibles
              </p>
            </motion.div>
          </motion.div>

          {/* ── Right: Visual ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:flex relative items-center justify-center h-full py-12"
          >
            <HeroVisual />
          </motion.div>
        </div>

        {/* Marquee strip — bottom of hero */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <Marquee />
        </motion.div>
      </motion.div>
    </section>
  );
}
