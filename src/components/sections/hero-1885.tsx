'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function Hero1885() {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-screen min-h-[600px] bg-encre flex items-center justify-center overflow-hidden">
      {/* Logotype animation container */}
      <div className="relative flex items-center justify-center gap-8 md:gap-12">
        {/* "18" from top */}
        <motion.div
          initial={{ y: -200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="font-display font-bold text-ivoire"
          style={{ fontSize: 'clamp(80px, 15vw, 180px)' }}
        >
          18
        </motion.div>

        {/* Horizontal line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.3,
          }}
          className="h-px w-16 md:w-24 bg-ivoire-2"
        />

        {/* "85" from bottom */}
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="font-display font-bold text-ivoire"
          style={{ fontSize: 'clamp(80px, 15vw, 180px)' }}
        >
          85
        </motion.div>
      </div>

      {/* Subtitle fade-in */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="absolute bottom-32 font-sans text-sm text-ivoire/70 uppercase tracking-[0.35em]"
      >
        Manufacture Alfortvillaise
      </motion.p>

      {/* Chevron bounce */}
      {animationComplete && (
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-12"
        >
          <ChevronDown className="h-6 w-6 text-ivoire/60" />
        </motion.div>
      )}
    </section>
  );
}
