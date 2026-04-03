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
      {/* Vidéo background en loop */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Overlay sombre pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-encre/40" />
      </div>

      {/* Logo complet avec animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 1.4,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 flex items-center justify-center"
      >
        <Image
          src="/logo.svg"
          alt="1885 Manufacture Alfortvillaise"
          width={280}
          height={443}
          priority
          className="w-auto h-[clamp(300px,50vh,500px)] drop-shadow-2xl"
          style={{ filter: 'invert(1) drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }}
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
          className="absolute bottom-12 z-10"
        >
          <ChevronDown className="h-6 w-6 text-ivoire/60" />
        </motion.div>
      )}
    </section>
  );
}
