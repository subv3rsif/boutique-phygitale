'use client';

import { useState } from 'react';
import { Plus, Minus, RefreshCw, History, AlertTriangle, AlertCircle } from 'lucide-react';
import type { Product } from '@/lib/db/schema-products';
import type { StockMovement } from '@/types/product';

type AdjustmentType = 'add' | 'remove' | 'set';

interface StockAdjusterProps {
  product: Product;
  onUpdate: () => void;
}

/**
 * StockAdjuster Component
 *
 * Allows admin to adjust product stock with:
 * - Add/Remove/Set operations
 * - Stock status badges (low/out of stock)
 * - Movement history display
 *
 * Usage:
 * <StockAdjuster
 *   product={product}
 *   onUpdate={() => window.location.reload()}
 * />
 */
export function StockAdjuster({ product, onUpdate }: StockAdjusterProps) {
  const [type, setType] = useState<AdjustmentType>('add');
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Stock status calculation
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.stockAlertThreshold;

  // Handle adjustment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/products/${product.id}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          quantity,
          note: note.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to adjust stock');
      }

      // Reset form
      setQuantity(1);
      setNote('');
      setType('add');

      // Reload history if visible
      if (showHistory) {
        await fetchHistory();
      }

      // Trigger parent update
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch stock movement history
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}/stock`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setMovements(data.movements || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Toggle history visibility
  const toggleHistory = async () => {
    if (!showHistory && movements.length === 0) {
      await fetchHistory();
    }
    setShowHistory(!showHistory);
  };

  // Format movement type label
  const getMovementTypeLabel = (movement: StockMovement): string => {
    switch (movement.type) {
      case 'sale':
        return 'Vente';
      case 'restock':
        return 'Réappro';
      case 'adjustment':
        return 'Ajustement';
      case 'return':
        return 'Retour';
      default:
        return movement.type;
    }
  };

  // Format date/time
  const formatDateTime = (date: Date | string | null): string => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(d);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-encre">Gestion du Stock</h2>
          <p className="text-pierre text-sm mt-1">
            Ajustez le stock disponible pour <strong>{product.name}</strong>.
          </p>
        </div>

        {/* Current Stock Display */}
        <div className="text-right">
          <div className="text-3xl font-bold text-encre">
            {product.stockQuantity}
          </div>
          <div className="text-sm text-pierre">en stock</div>

          {/* Stock Status Badges */}
          <div className="mt-2 space-y-1">
            {isOutOfStock && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                <AlertCircle className="w-3 h-3" />
                Rupture de stock
              </div>
            )}
            {isLowStock && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                <AlertTriangle className="w-3 h-3" />
                Stock faible (seuil: {product.stockAlertThreshold})
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adjustment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Adjustment Type Buttons */}
        <div>
          <label className="block text-sm font-medium text-encre mb-2">
            Type d&apos;ajustement
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('add')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                type === 'add'
                  ? 'border-amethyste bg-amethyste/10 text-amethyste'
                  : 'border-gray-200 text-pierre hover:border-gray-300'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Ajouter</span>
            </button>

            <button
              type="button"
              onClick={() => setType('remove')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                type === 'remove'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 text-pierre hover:border-gray-300'
              }`}
            >
              <Minus className="w-5 h-5" />
              <span className="font-medium">Retirer</span>
            </button>

            <button
              type="button"
              onClick={() => setType('set')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                type === 'set'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-pierre hover:border-gray-300'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              <span className="font-medium">Définir</span>
            </button>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-encre mb-2">
            Quantité
          </label>
          <input
            type="number"
            id="quantity"
            min="0"
            max="9999"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amethyste focus:border-transparent"
            required
          />
          {type === 'set' && (
            <p className="text-xs text-pierre mt-1">
              Le stock sera défini à exactement {quantity} unités.
            </p>
          )}
        </div>

        {/* Note Input */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-encre mb-2">
            Note (optionnelle)
          </label>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: Réception fournisseur, inventaire, produit défectueux..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amethyste focus:border-transparent resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || quantity <= 0}
          className="w-full bg-amethyste text-white px-6 py-3 rounded-lg font-medium hover:bg-amethyste/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Application...' : "Appliquer l'Ajustement"}
        </button>
      </form>

      {/* History Toggle */}
      <div className="pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={toggleHistory}
          className="flex items-center gap-2 text-pierre hover:text-encre transition-colors"
        >
          <History className="w-5 h-5" />
          <span className="font-medium">
            {showHistory ? "Masquer l'Historique" : "Voir l'Historique"}
          </span>
        </button>

        {/* History Display */}
        {showHistory && (
          <div className="mt-4 space-y-2">
            {isLoadingHistory ? (
              <div className="text-center py-4 text-pierre">
                Chargement de l&apos;historique...
              </div>
            ) : movements.length === 0 ? (
              <div className="text-center py-4 text-pierre">
                Aucun mouvement de stock enregistré.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {movements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {/* Movement Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-encre text-sm">
                          {getMovementTypeLabel(movement)}
                        </span>
                        <span
                          className={`font-bold ${
                            movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {movement.quantity > 0 ? '+' : ''}
                          {movement.quantity}
                        </span>
                      </div>
                      <div className="text-xs text-pierre mt-1">
                        {formatDateTime(movement.createdAt)}
                        {movement.createdBy && (
                          <> • {movement.createdBy}</>
                        )}
                      </div>
                      {movement.note && (
                        <div className="text-xs text-pierre mt-1 italic">
                          {movement.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
