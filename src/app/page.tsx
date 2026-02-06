import { getAllActiveProducts } from '@/lib/catalogue';
import { ProductCard } from '@/components/product/product-card';

export default function HomePage() {
  const products = getAllActiveProducts();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Boutique Officielle
        </h1>
        <p className="text-lg text-muted-foreground">
          Découvrez notre collection de goodies officiels de la ville
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Aucun produit disponible pour le moment
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
