import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

const BUCKET_NAME = 'products';

/**
 * Upload image to Supabase Storage
 * @param file File buffer
 * @param fileName Unique file name
 * @param productSlug Product slug for folder organization
 * @returns Public URL and storage path
 */
export async function uploadProductImage(
  file: Buffer,
  fileName: string,
  productSlug: string
): Promise<{ url: string; path: string }> {
  const path = `${productSlug}/${fileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType: 'image/jpeg',
      cacheControl: '31536000', // 1 year
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return {
    url: publicUrlData.publicUrl,
    path,
  };
}

/**
 * Delete image from Supabase Storage
 * @param path Storage path (e.g., "product-slug/image.jpg")
 */
export async function deleteProductImage(path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Delete all images for a product
 * @param productSlug Product slug (folder name)
 */
export async function deleteProductImages(productSlug: string): Promise<void> {
  const { data: files, error: listError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .list(productSlug);

  if (listError) {
    console.error('List files error:', listError);
    return;
  }

  if (!files || files.length === 0) return;

  const filePaths = files.map((file) => `${productSlug}/${file.name}`);

  const { error: deleteError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove(filePaths);

  if (deleteError) {
    console.error('Bulk delete error:', deleteError);
  }
}
