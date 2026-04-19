'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { ProductSize } from '@/types/product';

type SizeStockManagerProps = {
  sizes: ProductSize[];
  onChange: (sizes: ProductSize[]) => void;
};

const AVAILABLE_SIZES: Array<'S' | 'M' | 'L' | 'XL' | 'XXL'> = ['S', 'M', 'L', 'XL', 'XXL'];

/**
 * Size Stock Manager Component
 * Manages stock per size variant for products with size options
 *
 * Features:
 * - Checkbox to enable/disable each size
 * - Stock quantity input for each enabled size
 * - Stock alert threshold input for each enabled size
 * - Validation: at least one size must be enabled, stock >= 0
 *
 * Usage:
 * <SizeStockManager
 *   sizes={formData.sizes}
 *   onChange={(sizes) => setFormData({ ...formData, sizes })}
 * />
 */
export function SizeStockManager({ sizes, onChange }: SizeStockManagerProps) {
  // Helper to check if a size is currently enabled
  const isSizeEnabled = (size: string) => {
    return sizes.some((s) => s.size === size);
  };

  // Helper to get size configuration
  const getSizeConfig = (size: string): ProductSize | undefined => {
    return sizes.find((s) => s.size === size);
  };

  // Handle size checkbox toggle
  const handleSizeToggle = (size: 'S' | 'M' | 'L' | 'XL' | 'XXL', checked: boolean) => {
    if (checked) {
      // Add size with default values
      const newSize: ProductSize = {
        size,
        stock: 0,
        stockAlertThreshold: 5,
      };
      onChange([...sizes, newSize]);
    } else {
      // Remove size
      onChange(sizes.filter((s) => s.size !== size));
    }
  };

  // Handle stock change for a size
  const handleStockChange = (size: string, stock: number) => {
    onChange(
      sizes.map((s) =>
        s.size === size ? { ...s, stock: Math.max(0, Math.floor(stock)) } : s
      )
    );
  };

  // Handle stock alert threshold change for a size
  const handleThresholdChange = (size: string, threshold: number) => {
    onChange(
      sizes.map((s) =>
        s.size === size
          ? { ...s, stockAlertThreshold: Math.max(0, Math.floor(threshold)) }
          : s
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <Label className="text-base">Tailles Disponibles</Label>
        <p className="text-xs text-pierre mt-1">
          Sélectionnez les tailles disponibles et configurez le stock pour chacune
        </p>
      </div>

      {/* Size Configuration Grid */}
      <div className="space-y-3">
        {AVAILABLE_SIZES.map((size) => {
          const enabled = isSizeEnabled(size);
          const config = getSizeConfig(size);

          return (
            <div
              key={size}
              className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white"
            >
              {/* Size Checkbox */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => handleSizeToggle(size, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-amethyste focus:ring-amethyste cursor-pointer"
                />
                <span className="text-sm font-medium text-encre">
                  Taille {size}
                </span>
              </label>

              {/* Stock Configuration (only if enabled) */}
              {enabled && config && (
                <div className="grid gap-3 sm:grid-cols-2 pl-6">
                  {/* Stock Quantity */}
                  <div className="space-y-1">
                    <Label htmlFor={`stock-${size}`} className="text-sm">
                      Stock <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`stock-${size}`}
                      type="number"
                      min="0"
                      value={config.stock}
                      onChange={(e) =>
                        handleStockChange(size, parseInt(e.target.value) || 0)
                      }
                      required
                      className="text-sm"
                    />
                  </div>

                  {/* Stock Alert Threshold */}
                  <div className="space-y-1">
                    <Label htmlFor={`threshold-${size}`} className="text-sm">
                      Seuil d&apos;Alerte
                    </Label>
                    <Input
                      id={`threshold-${size}`}
                      type="number"
                      min="0"
                      value={config.stockAlertThreshold}
                      onChange={(e) =>
                        handleThresholdChange(size, parseInt(e.target.value) || 5)
                      }
                      placeholder="5"
                      className="text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Warning if no sizes enabled */}
      {sizes.length === 0 && (
        <p className="text-xs text-red-600">
          ⚠️ Au moins une taille doit être sélectionnée si les tailles sont activées
        </p>
      )}
    </div>
  );
}
