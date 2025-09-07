import imageCompression from "browser-image-compression";

// Default settings
const DEFAULT_MAX_IMAGE_SIZE_MB = 5; // Reduced from 10MB
const DEFAULT_WARN_IMAGE_SIZE_MB = 1; // Reduced from 2MB
const DEFAULT_MAX_IMAGE_DIMENSION = 1024;

// Settings for different image types
const COMPRESSION_SETTINGS = {
  logo: {
    maxSizeMB: 0.5, // 500KB for logos
    maxDimension: 256, // Smaller dimensions for logos
    quality: 0.8, // Good quality for logos
  },
  main: {
    maxSizeMB: 1, // 1MB for main images
    maxDimension: 1200, // Larger dimensions for main images
    quality: 0.85, // High quality for main images
  },
  default: {
    maxSizeMB: 1,
    maxDimension: 800,
    quality: 0.8,
  },
};

/**
 * Compress and validate an image file with timeout and better error handling.
 * @param {File} file - The image file to compress.
 * @param {Object} options - Optional settings.
 * @param {string} options.type - Image type: 'logo', 'main', or 'default'.
 * @param {number} options.maxSizeMB - Max allowed file size in MB.
 * @param {number} options.warnSizeMB - Warn if file is over this size in MB.
 * @param {number} options.maxDimension - Max width/height in px.
 * @param {number} options.timeout - Timeout in milliseconds (default 30000).
 * @returns {Promise<{ file: File|null, warning: string|null, error: string|null }>}
 */
export async function compressImage(
  file,
  {
    type = "default",
    maxSizeMB = DEFAULT_MAX_IMAGE_SIZE_MB,
    warnSizeMB = DEFAULT_WARN_IMAGE_SIZE_MB,
    maxDimension = DEFAULT_MAX_IMAGE_DIMENSION,
    timeout = 30000, // 30 second timeout
  } = {}
) {
  if (!file) return { file: null, warning: null, error: null };

  let warning = null;
  let error = null;

  // Check file size
  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB > maxSizeMB) {
    error = `File too large (${fileSizeMB.toFixed(
      1
    )}MB). Maximum size is ${maxSizeMB}MB.`;
    return { file: null, warning, error };
  }

  // Warn for large files
  if (fileSizeMB > warnSizeMB) {
    warning = `Large file selected (${fileSizeMB.toFixed(
      1
    )}MB). Compression will be applied to optimize size and performance.`;
  }

  // Get compression settings based on type
  const settings = COMPRESSION_SETTINGS[type] || COMPRESSION_SETTINGS.default;

  const options = {
    maxSizeMB: settings.maxSizeMB,
    maxWidthOrHeight: settings.maxDimension,
    useWebWorker: true,
    quality: settings.quality,
    fileType: "image/jpeg", // Force JPEG for better compression
  };

  try {
    // Add timeout to compression
    const compressionPromise = imageCompression(file, options);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Compression timed out")), timeout);
    });

    const compressed = await Promise.race([compressionPromise, timeoutPromise]);

    // Check if compression was successful and beneficial
    if (compressed.size >= file.size) {
      // If compressed file is same size or larger, use original
      // Don't show this as a warning - it's normal behavior
      return { file, warning, error };
    }

    return { file: compressed, warning, error };
  } catch (err) {
    console.error("Image compression error:", err);

    // Provide user-friendly error messages
    if (err.message.includes("timeout")) {
      error =
        "Image processing took too long. Please try a smaller image or check your connection.";
    } else if (err.message.includes("not supported")) {
      error =
        "This image format is not supported. Please use JPEG, PNG, or WebP.";
    } else {
      error =
        "Failed to process image. Please try again or use a different image.";
    }

    return { file: null, warning, error };
  }
}

/**
 * Get compression settings for a specific image type.
 * @param {string} type - Image type: 'logo', 'main', or 'default'.
 * @returns {Object} Compression settings.
 */
export function getCompressionSettings(type = "default") {
  return COMPRESSION_SETTINGS[type] || COMPRESSION_SETTINGS.default;
}

/**
 * Get user-friendly size limits message.
 * @returns {string} Size limits message.
 */
export function getSizeLimitsMessage() {
  return `Image upload limits:
• Maximum file size: ${DEFAULT_MAX_IMAGE_SIZE_MB}MB
• Logos: Up to 500KB, resized to 256px max
• Main images: Up to 1MB, resized to 1200px max
• All images are automatically compressed for optimal performance`;
}
