'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert } from '@/components/ui/alert';
import { generateSlug } from '@/lib/validations/product';
import { SizeStockManager } from '@/components/admin/size-stock-manager';
import type { Product, ProductSize } from '@/types/product';

type ProductFormProps = {
  product?: Product; // If provided, form is in edit mode
  mode: 'create' | 'edit';
};

// Predefined category tags for navigation/filtering
const CATEGORY_TAGS = [
  { value: 'heritage', label: 'Héritage' },
  { value: 'graffiti', label: 'Graffiti' },
  { value: 'collection', label: 'Collection' },
  { value: 'artisan', label: 'Artisan' },
  { value: 'supporter', label: 'Supporter' },
  { value: 'edition', label: 'Édition' },
  { value: 'atelier', label: "L'atelier" },
] as const;

type FormData = {
  name: string;
  slug: string;
  description: string;
  selectedTags: string[]; // Array of selected category tags
  badges: string; // Comma-separated badges for display
  priceCents: string; // String for input, converted to number
  shippingCents: string;
  stockQuantity: string;
  stockAlertThreshold: string;
  weightGrams: string;
  payfipProductCode: string;
  editionNumber: string;
  editionTotal: string;
  active: boolean;
  featured: boolean;
  showInCollectionPage: boolean;
  sizesEnabled: boolean; // Whether product has size variants
  sizes: ProductSize[]; // Size configurations (stock per size)
};

/**
 * Product Form Component
 * Reusable form for creating and editing products
 *
 * Features:
 * - Auto-generates slug from name (create mode only)
 * - Validates all fields before submit
 * - Shows loading state during API call
 * - Displays errors in alert box
 * - Redirects to product list on success
 *
 * Usage:
 * - Create: <ProductForm mode="create" />
 * - Edit: <ProductForm mode="edit" product={existingProduct} />
 */
export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(mode === 'create');

  // Initialize form data
  const [formData, setFormData] = useState<FormData>({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    selectedTags: product?.tags || [],
    badges: product?.badges?.join(', ') || '',
    priceCents: product?.priceCents ? (product.priceCents / 100).toFixed(2) : '',
    shippingCents: product?.shippingCents ? (product.shippingCents / 100).toFixed(2) : '',
    stockQuantity: product?.stockQuantity?.toString() || '0',
    stockAlertThreshold: product?.stockAlertThreshold?.toString() || '5',
    weightGrams: product?.weightGrams?.toString() || '',
    payfipProductCode: product?.payfipProductCode || '11',
    editionNumber: product?.editionNumber?.toString() || '',
    editionTotal: product?.editionTotal?.toString() || '',
    active: product?.active ?? true,
    featured: product?.featured ?? false,
    showInCollectionPage: product?.showInCollectionPage ?? false,
    sizesEnabled: product?.sizes && product.sizes.length > 0 ? true : false,
    sizes: product?.sizes || [],
  });

  // Auto-generate slug when name changes (create mode only)
  useEffect(() => {
    if (autoGenerateSlug && formData.name && mode === 'create') {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.name),
      }));
    }
  }, [formData.name, autoGenerateSlug, mode]);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If user manually edits slug in create mode, disable auto-generation
    if (name === 'slug' && mode === 'create') {
      setAutoGenerateSlug(false);
    }
  };

  // Handle switch toggle
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  // Handle featured toggle
  const handleFeaturedChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, featured: checked }));
  };

  // Handle showInCollectionPage toggle
  const handleShowInCollectionPageChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, showInCollectionPage: checked }));
  };

  // Handle sizesEnabled toggle
  const handleSizesEnabledChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sizesEnabled: checked,
      // Reset sizes when disabling
      sizes: checked ? prev.sizes : [],
    }));
  };

  // Handle tag checkbox toggle
  const handleTagToggle = (tag: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedTags.includes(tag);
      const newTags = isSelected
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag];
      return { ...prev, selectedTags: newTags };
    });
  };

  // Validate form
  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Le nom du produit est requis';
    if (!formData.slug.trim()) return 'Le slug est requis';
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      return 'Le slug doit contenir uniquement des minuscules, chiffres et tirets';
    }
    if (!formData.description.trim()) return 'La description est requise';
    if (!formData.priceCents || parseFloat(formData.priceCents) < 0) {
      return 'Le prix doit être >= 0';
    }
    if (!formData.shippingCents || parseFloat(formData.shippingCents) < 0) {
      return 'Les frais de port doivent être >= 0';
    }

    // Stock validation: either global stock OR sizes stock
    if (formData.sizesEnabled) {
      // Validate sizes
      if (formData.sizes.length === 0) {
        return 'Au moins une taille doit être sélectionnée si les tailles sont activées';
      }
      // Validate each size has valid stock
      for (const size of formData.sizes) {
        if (size.stock < 0) {
          return `Le stock de la taille ${size.size} doit être >= 0`;
        }
        if (size.stockAlertThreshold < 0) {
          return `Le seuil d'alerte de la taille ${size.size} doit être >= 0`;
        }
      }
    } else {
      // Validate global stock
      if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
        return 'Le stock doit être >= 0';
      }
      if (!formData.stockAlertThreshold || parseInt(formData.stockAlertThreshold) < 0) {
        return 'Le seuil d\'alerte doit être >= 0';
      }
    }

    if (formData.weightGrams && parseInt(formData.weightGrams) < 0) {
      return 'Le poids doit être >= 0';
    }
    if (formData.payfipProductCode.length > 10) {
      return 'Le code PayFiP doit faire maximum 10 caractères';
    }
    if (formData.editionNumber && parseInt(formData.editionNumber) < 1) {
      return 'Le numéro d\'édition doit être >= 1';
    }
    if (formData.editionTotal && parseInt(formData.editionTotal) < 1) {
      return 'Le total d\'édition doit être >= 1';
    }

    return null;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare payload (convert euros to cents, strings to numbers)
      const payload = {
        slug: formData.slug.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        priceCents: Math.round(parseFloat(formData.priceCents) * 100),
        shippingCents: Math.round(parseFloat(formData.shippingCents) * 100),
        stockQuantity: formData.sizesEnabled ? 0 : parseInt(formData.stockQuantity),
        stockAlertThreshold: formData.sizesEnabled ? 0 : parseInt(formData.stockAlertThreshold),
        weightGrams: formData.weightGrams ? parseInt(formData.weightGrams) : undefined,
        tags: formData.selectedTags.length > 0 ? formData.selectedTags.join(',') : undefined,
        badges: formData.badges.trim() || undefined,
        payfipProductCode: formData.payfipProductCode.trim(),
        editionNumber: formData.editionNumber ? parseInt(formData.editionNumber) : undefined,
        editionTotal: formData.editionTotal ? parseInt(formData.editionTotal) : undefined,
        active: formData.active,
        featured: formData.featured,
        showInCollectionPage: formData.showInCollectionPage,
        sizes: formData.sizesEnabled ? formData.sizes : [],
      };

      // API call
      const endpoint = mode === 'create'
        ? '/api/admin/products'
        : `/api/admin/products/${product?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      // Success - redirect to products list
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.back();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <p className="text-sm font-medium">{error}</p>
        </Alert>
      )}

      {/* Info Box */}
      <Alert>
        <p className="text-sm text-pierre">
          <strong>Format d&apos;image recommandé :</strong> 600×750px (ratio 4:5) pour une harmonie visuelle.
          Maximum 5 images par produit.
        </p>
      </Alert>

      {/* Section 1: Informations Générales */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-encre">
          Informations Générales
        </h2>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nom du Produit <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Mug Love Symbol Edition"
            required
          />
          <p className="text-xs text-pierre">
            L&apos;URL du produit sera générée automatiquement
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description détaillée du produit..."
            rows={4}
            required
          />
        </div>

        {/* Category Tags (Checkboxes) */}
        <div className="space-y-3">
          <div>
            <Label>Catégories (Navigation du site)</Label>
            <p className="text-xs text-pierre mt-1">
              Sélectionnez les catégories auxquelles appartient ce produit
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORY_TAGS.map((tag) => (
              <label
                key={tag.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.selectedTags.includes(tag.value)}
                  onChange={() => handleTagToggle(tag.value)}
                  className="w-4 h-4 rounded border-gray-300 text-amethyste focus:ring-amethyste cursor-pointer"
                />
                <span className="text-sm text-encre">{tag.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Badges (Free text) */}
        <div className="space-y-2">
          <Label htmlFor="badges">Badges d&apos;Affichage</Label>
          <Input
            id="badges"
            name="badges"
            value={formData.badges}
            onChange={handleChange}
            placeholder="pièce phare, nouveauté, édition limitée (séparés par des virgules)"
          />
          <p className="text-xs text-pierre">
            Badges affichés sur l&apos;image du produit (ex: &quot;pièce phare&quot;, &quot;nouveauté&quot;)
          </p>
        </div>
      </div>

      {/* Section 2: Prix */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-encre">Prix</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="priceCents">
              Prix TTC (€) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="priceCents"
              name="priceCents"
              type="number"
              step="0.01"
              min="0"
              value={formData.priceCents}
              onChange={handleChange}
              placeholder="14.00"
              required
            />
          </div>

          {/* Shipping */}
          <div className="space-y-2">
            <Label htmlFor="shippingCents">
              Frais de Port (€) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="shippingCents"
              name="shippingCents"
              type="number"
              step="0.01"
              min="0"
              value={formData.shippingCents}
              onChange={handleChange}
              placeholder="4.50"
              required
            />
          </div>
        </div>
      </div>

      {/* Section 3: Stock */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-encre">Stock</h2>

        {/* Sizes Enabled Toggle */}
        <div className="flex items-center space-x-3">
          <Switch
            id="sizesEnabled"
            checked={formData.sizesEnabled}
            onCheckedChange={handleSizesEnabledChange}
          />
          <Label htmlFor="sizesEnabled" className="cursor-pointer">
            Tailles disponibles (S, M, L, XL, XXL)
          </Label>
        </div>
        <p className="text-xs text-pierre -mt-2 ml-14">
          Activez cette option pour gérer le stock par taille
        </p>

        {/* Conditional: Global Stock OR Sizes Stock */}
        {!formData.sizesEnabled ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Stock Quantity */}
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">
                Quantité en Stock <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                required
              />
            </div>

            {/* Stock Alert Threshold */}
            <div className="space-y-2">
              <Label htmlFor="stockAlertThreshold">Seuil d&apos;Alerte</Label>
              <Input
                id="stockAlertThreshold"
                name="stockAlertThreshold"
                type="number"
                min="0"
                value={formData.stockAlertThreshold}
                onChange={handleChange}
              />
              <p className="text-xs text-pierre">
                Alerte lorsque le stock descend sous ce seuil (défaut: 5)
              </p>
            </div>
          </div>
        ) : (
          <SizeStockManager
            sizes={formData.sizes}
            onChange={(sizes) => setFormData({ ...formData, sizes })}
          />
        )}
      </div>

      {/* Section 4: Informations Complémentaires */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-encre">
          Informations Complémentaires
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weightGrams">Poids (grammes)</Label>
            <Input
              id="weightGrams"
              name="weightGrams"
              type="number"
              min="0"
              value={formData.weightGrams}
              onChange={handleChange}
              placeholder="350"
            />
          </div>

          {/* PayFiP Code */}
          <div className="space-y-2">
            <Label htmlFor="payfipProductCode">Code Produit PayFiP</Label>
            <Input
              id="payfipProductCode"
              name="payfipProductCode"
              maxLength={10}
              value={formData.payfipProductCode}
              onChange={handleChange}
            />
            <p className="text-xs text-pierre">Maximum 10 caractères (défaut: &quot;11&quot;)</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Edition Number */}
          <div className="space-y-2">
            <Label htmlFor="editionNumber">Numéro d&apos;Édition</Label>
            <Input
              id="editionNumber"
              name="editionNumber"
              type="number"
              min="1"
              value={formData.editionNumber}
              onChange={handleChange}
              placeholder="7"
            />
            <p className="text-xs text-pierre">Pour les éditions limitées uniquement</p>
          </div>

          {/* Edition Total */}
          <div className="space-y-2">
            <Label htmlFor="editionTotal">Total Édition</Label>
            <Input
              id="editionTotal"
              name="editionTotal"
              type="number"
              min="1"
              value={formData.editionTotal}
              onChange={handleChange}
              placeholder="50"
            />
            <p className="text-xs text-pierre">Nombre total d&apos;éditions produites</p>
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center space-x-3">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="active" className="cursor-pointer">
            Produit actif (visible sur la boutique)
          </Label>
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center space-x-3">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={handleFeaturedChange}
          />
          <Label htmlFor="featured" className="cursor-pointer">
            ⭐ Mettre à la une (homepage)
          </Label>
        </div>
        <p className="text-xs text-pierre -mt-2 ml-14">
          Les produits à la une apparaissent en priorité sur la page d'accueil
        </p>

        {/* Show In Collection Page Toggle */}
        <div className="flex items-center space-x-3">
          <Switch
            id="showInCollectionPage"
            checked={formData.showInCollectionPage}
            onCheckedChange={handleShowInCollectionPageChange}
          />
          <Label htmlFor="showInCollectionPage" className="cursor-pointer">
            📚 Afficher sur la page collection
          </Label>
        </div>
        <p className="text-xs text-pierre -mt-2 ml-14">
          Affiche ce produit dans les 3 aperçus de la page collection (max 3 par catégorie)
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading
            ? 'Enregistrement...'
            : mode === 'create'
            ? 'Créer le Produit'
            : 'Mettre à Jour'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
