'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
}

/**
 * Composant d'animation au scroll
 * Utilise Intersection Observer natif (pas de librairie externe)
 * Animation: fade-in + translateY(20px) → translateY(0)
 * Duration: 600ms, easing: ease-out
 */
export function AnimatedSection({ children }: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            // Une fois animé, on peut arrêter d'observer
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Déclenche quand 10% de la section est visible
        rootMargin: '0px 0px -50px 0px', // Déclenche légèrement avant d'entrer dans le viewport
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="opacity-0 translate-y-5 transition-all duration-[600ms] ease-out will-change-[opacity,transform]"
      style={{
        // Les classes Tailwind ne supportent pas toutes les durées, on utilise style inline
        transitionProperty: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
