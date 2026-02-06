'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, getProductById } from '@/lib/catalogue';
import { useCart } from '@/store/cart';
import { Trash2, Minus, Plus } from 'lucide-react';

type CartItemProps = {
  id: string;
  qty: number;
};

export function CartItem({ id, qty }: CartItemProps) {
  const product = getProductById(id);
  const { updateQty, removeItem } = useCart();

  if (!product) {
    return null;
  }

  const itemTotal = product.priceCents * qty;

  const handleDecrement = () => {
    if (qty > 1) {
      updateQty(id, qty - 1);
    }
  };

  const handleIncrement = () => {
    if (qty < 10) {
      updateQty(id, qty + 1);
    }
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQty = parseInt(e.target.value, 10);
    if (!isNaN(newQty) && newQty >= 1 && newQty <= 10) {
      updateQty(id, newQty);
    }
  };

  return (
    <div className="flex gap-4">
      {/* Product Image */}
      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      {/* Product Details & Controls */}
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Product name and price */}
          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-slate-600">
            {formatCurrency(product.priceCents)} l'unité
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center border border-slate-300 rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-none hover:bg-slate-100"
                onClick={handleDecrement}
                disabled={qty <= 1}
                aria-label="Diminuer la quantité"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <Input
                type="number"
                min="1"
                max="10"
                value={qty}
                onChange={handleQtyChange}
                className="w-14 h-9 text-center border-0 border-x border-slate-300 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                aria-label="Quantité"
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-none hover:bg-slate-100"
                onClick={handleIncrement}
                disabled={qty >= 10}
                aria-label="Augmenter la quantité"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Remove button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
              onClick={() => removeItem(id)}
              aria-label="Retirer du panier"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">Retirer</span>
            </Button>
          </div>
        </div>

        {/* Item Total - Right aligned on desktop */}
        <div className="text-left sm:text-right flex-shrink-0">
          <p className="font-bold text-slate-900 text-lg">
            {formatCurrency(itemTotal)}
          </p>
          {qty > 1 && (
            <p className="text-xs text-slate-500 mt-1">
              {qty} × {formatCurrency(product.priceCents)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
