'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
      {/* Logo complet avec animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 1.4,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative flex items-center justify-center"
      >
        <Image
          src="/logo.svg"
          alt="1885 Manufacture Alfortvillaise"
          width={280}
          height={443}
          priority
          className="w-auto h-[clamp(300px,50vh,500px)] invert"
          style={{ filter: 'invert(1)' }}
        />
      </motion.div>

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
