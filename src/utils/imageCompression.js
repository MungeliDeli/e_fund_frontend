import imageCompression from 'browser-image-compression';

const DEFAULT_MAX_IMAGE_SIZE_MB = 10;
const DEFAULT_WARN_IMAGE_SIZE_MB = 2;
const DEFAULT_MAX_IMAGE_DIMENSION = 1024;

/**
 * Compress and validate an image file.
 * @param {File} file - The image file to compress.
 * @param {Object} options - Optional settings.
 * @param {number} options.maxSizeMB - Max allowed file size in MB (default 10).
 * @param {number} options.warnSizeMB - Warn if file is over this size in MB (default 2).
 * @param {number} options.maxDimension - Max width/height in px (default 1024).
 * @returns {Promise<{ file: File|null, warning: string|null, error: string|null }>}
 */
export async function compressImage(
  file,
  {
    maxSizeMB = DEFAULT_MAX_IMAGE_SIZE_MB,
    warnSizeMB = DEFAULT_WARN_IMAGE_SIZE_MB,
    maxDimension = DEFAULT_MAX_IMAGE_DIMENSION,
  } = {}
) {
  if (!file) return { file: null, warning: null, error: null };
  let warning = null;
  let error = null;
  if (file.size > maxSizeMB * 1024 * 1024) {
    error = `File too large. Max size is ${maxSizeMB}MB.`;
    return { file: null, warning, error };
  }
  if (file.size > warnSizeMB * 1024 * 1024) {
    warning = `Large file selected (${(file.size / 1024 / 1024).toFixed(1)}MB). Upload may take longer. Images will be compressed after upload.`;
  }
  const options = {
    maxSizeMB: warnSizeMB, // Try to compress to warnSizeMB, but allow larger
    maxWidthOrHeight: maxDimension,
    useWebWorker: true,
  };
  try {
    const compressed = await imageCompression(file, options);
    return { file: compressed, warning, error };
  } catch (err) {
    // If compression fails, just return the original file
    return { file, warning, error };
  }
} 