'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, AlertCircle, Package } from 'lucide-react';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/lib/catalogue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

type ProductListProps = {
  initialProducts: Product[];
};

/**
 * Get primary image from product images array
 * Falls back to first image if no primary is set
 */
function getPrimaryImage(product: Product): string | null {
  if (!product.images || product.images.length === 0) {
    return null;
  }

  const primary = product.images.find((img) => img.isPrimary);
  return primary?.url || product.images[0]?.url || null;
}

/**
 * Calculate stock status
 */
function getStockStatus(product: Product): {
  status: 'ok' | 'low' | 'out';
  label: string;
  color: string;
} {
  const { stockQuantity, stockAlertThreshold } = product;

  if (stockQuantity === 0) {
    return {
      status: 'out',
      label: 'Rupture',
      color: 'bg-red-500/10 text-red-700 border-red-200',
    };
  }

  if (stockQuantity <= stockAlertThreshold) {
    return {
      status: 'low',
      label: `Stock bas (${stockQuantity})`,
      color: 'bg-orange-500/10 text-orange-700 border-orange-200',
    };
  }

  return {
    status: 'ok',
    label: `En stock (${stockQuantity})`,
    color: 'bg-green-500/10 text-green-700 border-green-200',
  };
}

export function ProductList({ initialProducts }: ProductListProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handle delete product
   */
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
      }

      toast.success('Produit supprimé', {
        description: `${productToDelete.name} a été supprimé avec succès.`,
      });

      // Remove from local state (no need to refresh)
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));

      // Close dialog
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Erreur', {
        description: error.message || 'Impossible de supprimer le produit.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-pierre">
          <Package className="h-4 w-4" />
          <span>{products.length} produits au total</span>
        </div>

        <Button asChild className="bg-encre hover:bg-encre-2 text-ivoire">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Produit
          </Link>
        </Button>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Package className="h-12 w-12 text-pierre mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-encre mb-2">
            Aucun produit
          </h3>
          <p className="text-pierre mb-6">
            Commencez par créer votre premier produit.
          </p>
          <Button asChild className="bg-encre hover:bg-encre-2 text-ivoire">
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Créer un produit
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-20">Image</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const primaryImage = getPrimaryImage(product);
                const stockStatus = getStockStatus(product);

                return (
                  <TableRow key={product.id} className="group">
                    {/* Image */}
                    <TableCell>
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-pierre opacity-30" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Product Name & Description */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-encre">
                          {product.name}
                        </div>
                        <div className="text-sm text-pierre line-clamp-1">
                          {product.description}
                        </div>
                        {product.editionNumber && product.editionTotal && (
                          <Badge
                            variant="outline"
                            className="text-xs text-violet border-violet"
                          >
                            Édition {product.editionNumber}/{product.editionTotal}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="text-right font-medium text-encre">
                      {formatCurrency(product.priceCents)}
                    </TableCell>

                    {/* Stock Status */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${stockStatus.color} border`}
                      >
                        {stockStatus.status === 'out' && (
                          <AlertCircle className="mr-1 h-3 w-3" />
                        )}
                        {stockStatus.label}
                      </Badge>
                    </TableCell>

                    {/* Active Status */}
                    <TableCell>
                      {product.active ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-200">
                          Inactif
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-8 px-2 hover:bg-terra/10 hover:border-terra hover:text-terra"
                        >
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Modifier {product.name}</span>
                          </Link>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Supprimer {product.name}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer{' '}
              <span className="font-semibold text-encre">
                {productToDelete?.name}
              </span>{' '}
              ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
