'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  kicker?: string;
  title: string;
  titleAccent?: string; // secondary line with gradient
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
};

// Splits text into words and animates each one
function AnimatedTitle({
  text,
  delay = 0,
  gradient = false,
  isInView,
}: {
  text: string;
  delay?: number;
  gradient?: boolean;
  isInView: boolean;
}) {
  const words = text.split(' ');
  return (
    <span className={cn('inline-flex flex-wrap gap-x-[0.25em]', gradient && 'text-gradient-love-vibrant')}>
      {words.map((word, i) => (
        <span key={i} className="word-reveal-line">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: '110%', opacity: 0 }}
            transition={{
              duration: 0.65,
              delay: delay + i * 0.07,
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

export function SectionHeading({
  kicker,
  title,
  titleAccent,
  subtitle,
  className,
  align = 'center',
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const alignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[align];

  return (
    <div ref={ref} className={cn('flex flex-col gap-4', alignClass, className)}>
      {/* Kicker */}
      {kicker && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          {align !== 'left' && <span className="inline-block h-[1px] w-6 bg-primary/50" />}
          <span className="text-xs tracking-[0.35em] uppercase text-muted-foreground font-sans font-medium">
            {kicker}
          </span>
          {align !== 'right' && <span className="inline-block h-[1px] w-6 bg-primary/50" />}
        </motion.div>
      )}

      {/* Title */}
      <h2 className="font-display leading-[0.92] text-foreground">
        <div className="text-5xl md:text-6xl font-light italic">
          <AnimatedTitle text={title} delay={0.15} isInView={isInView} />
        </div>
        {titleAccent && (
          <div className="text-5xl md:text-6xl font-semibold not-italic">
            <AnimatedTitle text={titleAccent} delay={0.3} gradient isInView={isInView} />
          </div>
        )}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-base md:text-lg text-muted-foreground font-sans font-light max-w-2xl leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
