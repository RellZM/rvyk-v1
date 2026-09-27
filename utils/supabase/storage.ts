import { supabase } from './client';

/**
 * Uploads an image file to the 'post-images' Supabase Storage bucket.
 * Returns the public URL of the uploaded image.
 */
export async function uploadPostImage(file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    // Generate a unique safe filename
    const fileExt = file.name.split('.').pop() || 'png';
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const fileName = `${Date.now()}-${cleanName}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { url: null, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown upload error occurred';
    return { url: null, error: message };
  }
}
