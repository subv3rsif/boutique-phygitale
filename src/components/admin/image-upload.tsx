'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Star, X, Upload } from 'lucide-react';
import type { Product } from '@/types/product';
import Image from 'next/image';

/**
 * Image Upload Component Props
 */
type ImageUploadProps = {
  product: Product;
};

/**
 * Image Upload Component
 *
 * Features:
 * - Grid display (3 columns) showing existing images
 * - 4:5 aspect ratio (600×750px recommended)
 * - Primary image badge
 * - Delete button on hover
 * - Upload button (max 5 images)
 * - File validation: image type, max 5MB
 *
 * Usage:
 * ```tsx
 * <ImageUpload product={product} />
 * ```
 */
export function ImageUpload({ product }: ImageUploadProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = product.images || [];
  const canUpload = images.length < 5;

  /**
   * Handle file selection and upload
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('La taille du fichier ne doit pas dépasser 5 MB');
      return;
    }

    try {
      setUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      // Upload to API
      const response = await fetch(`/api/admin/products/${product.id}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh page data
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle image deletion
   */
  const handleDelete = async (imagePath: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette image ?')) {
      return;
    }

    try {
      setDeleting(imagePath);
      setError(null);

      // Remove image via API
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: images.filter((img) => img.path !== imagePath),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Delete failed');
      }

      // Refresh page data
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  /**
   * Trigger file input click
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Format recommandé :</strong> 600×750px (ratio 4:5) • Max 5MB par image • Max 5 images
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-900">{error}</p>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Existing Images */}
        {images
          .sort((a, b) => a.order - b.order)
          .map((image) => (
            <div
              key={image.path}
              className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden group"
            >
              {/* Image */}
              <Image
                src={image.url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />

              {/* Primary Badge */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Principale</span>
                </div>
              )}

              {/* Delete Button (appears on hover) */}
              <button
                onClick={() => handleDelete(image.path)}
                disabled={deleting === image.path}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                title="Supprimer l'image"
              >
                {deleting === image.path ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>

              {/* Deleting Overlay */}
              {deleting === image.path && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ))}

        {/* Upload Button */}
        {canUpload && (
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="relative aspect-[4/5] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-encre hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-8 h-8 border-4 border-encre border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-600">Upload en cours...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Ajouter une image
                </span>
                <span className="text-xs text-gray-500">
                  {images.length}/5
                </span>
              </>
            )}
          </button>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* No Images State */}
      {images.length === 0 && !canUpload && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Aucune image</p>
        </div>
      )}
    </div>
  );
}
