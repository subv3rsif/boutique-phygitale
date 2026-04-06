'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

type CategoryHeaderProps = {
  title: string;
  description: string;
};

export function CategoryHeader({ title, description }: CategoryHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Split title into words for stagger animation
  const words = title.split(' ');

  return (
    <div ref={ref} className="container mx-auto px-4 py-12 md:py-16 text-center">
      {/* Animated title with word reveal */}
      <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.5,
              delay: i * 0.07,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block mr-2"
          >
            {word}
          </motion.span>
        ))}
      </h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{
          duration: 0.6,
          delay: words.length * 0.07 + 0.2,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto"
      >
        {description}
      </motion.p>
    </div>
  );
}
