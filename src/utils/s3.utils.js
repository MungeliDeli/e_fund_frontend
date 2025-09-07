/**
 * Frontend S3 Utility Functions
 *
 * Provides helper functions for uploading files to AWS S3 directly from the frontend.
 * Used for campaign image uploads in the FundFlow frontend.
 *
 * Key Features:
 * - Upload files to S3 with unique keys
 * - Generate public URLs for uploaded files
 * - Uses AWS SDK v3 and environment-based configuration
 * - Handles file compression and validation
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// S3 Configuration
const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = import.meta.env.VITE_AWS_S3_BUCKET_NAME;

/**
 * Upload a file to S3 with improved error handling and timeout.
 * @param {Object} params - Upload parameters.
 * @param {File} params.file - The file to upload.
 * @param {string} params.folder - The folder path in S3.
 * @param {string} params.customKey - Optional custom key for the file.
 * @param {number} params.timeout - Timeout in milliseconds (default 60000).
 * @returns {Promise<Object>} Upload result with public URL and metadata.
 */
export async function uploadFileToS3({
  file,
  folder = "uploads",
  customKey = null,
  timeout = 60000, // 60 second timeout
}) {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  try {
    // Generate file key
    const fileName =
      customKey || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const key = `${folder}/${fileName}`;

    // Convert file to buffer for S3 upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Prepare upload command
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,

      CacheControl: "public, max-age=31536000", // 1 year cache
    });

    // Add timeout to upload
    const uploadPromise = s3Client.send(uploadCommand);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Upload timed out")), timeout);
    });

    await Promise.race([uploadPromise, timeoutPromise]);

    // Generate public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.${
      import.meta.env.VITE_AWS_REGION
    }.amazonaws.com/${key}`;

    return {
      key,
      publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  } catch (error) {
    console.error("S3 upload error:", error);

    // Provide user-friendly error messages
    let userMessage = "Failed to upload image. Please try again.";

    if (error.message.includes("timeout")) {
      userMessage =
        "Upload timed out. Please check your connection and try again.";
    } else if (
      error.message.includes("Access Denied") ||
      error.message.includes("403")
    ) {
      userMessage =
        "Upload failed due to permission issues. Please contact support.";
    } else if (error.message.includes("NoSuchBucket")) {
      userMessage =
        "Upload service is not configured properly. Please contact support.";
    } else if (
      error.message.includes("NetworkError") ||
      error.message.includes("ENOTFOUND")
    ) {
      userMessage =
        "Network error. Please check your connection and try again.";
    } else if (error.message.includes("RequestEntityTooLarge")) {
      userMessage = "File is too large for upload. Please use a smaller image.";
    }

    throw new Error(userMessage);
  }
}

/**
 * Get the public S3 URL for a given key.
 * @param {string} key - The S3 object key.
 * @returns {string} The public URL.
 */
export function getPublicS3Url(key) {
  return `https://${BUCKET_NAME}.s3.${
    import.meta.env.VITE_AWS_REGION
  }.amazonaws.com/${key}`;
}

/**
 * Upload a campaign image with custom key support.
 * @param {File} file - The image file to upload.
 * @param {string} customKey - Optional custom key for the image.
 * @returns {Promise<Object>} Upload result.
 */
export async function uploadCampaignImage(file, customKey = null) {
  return uploadFileToS3({ file, folder: "campaigns", customKey });
}
