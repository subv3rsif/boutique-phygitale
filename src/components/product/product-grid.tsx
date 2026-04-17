'use client';

import { motion } from 'framer-motion';
import { ProductCard } from './product-card';
import type { Product } from '@/types/product';

type ProductGridProps = {
  products: Product[];
};

/**
 * Simple responsive product grid
 * Displays products in a 2-4 column grid with fade-in animation
 */
export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
}
