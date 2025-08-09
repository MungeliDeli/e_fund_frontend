import React, { useState, useRef } from "react";
import { FiUpload, FiX, FiLoader, FiInfo } from "react-icons/fi";
import { uploadCampaignImage } from "../../../../../utils/s3.utils";
import {
  compressImage,
  getSizeLimitsMessage,
} from "../../../../../utils/imageCompression";

const ImagePicker = ({
  label,
  imageUrl,
  onChange,
  onImageMetadata,
  customKey,
  maxSizeMB = 5,
  warnSizeMB = 1,
  maxDimension = 1024,
}) => {
  // Handle imageUrl - could be a string URL or an object with metadata
  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    return typeof imageData === "object" && imageData?.url
      ? imageData.url
      : imageData;
  };

  const [preview, setPreview] = useState(getImageUrl(imageUrl));
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const fileInputRef = useRef(null);

  // Determine image type based on label and section
  const getImageType = () => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("logo") || lowerLabel.includes("brand")) {
      return "logo";
    } else if (
      lowerLabel.includes("hero") ||
      lowerLabel.includes("main") ||
      lowerLabel.includes("banner")
    ) {
      return "main";
    }
    return "default";
  };

  // Update preview when imageUrl prop changes
  React.useEffect(() => {
    setPreview(getImageUrl(imageUrl));
  }, [imageUrl]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(null);
    setWarning(null);
    setIsUploading(true);

    try {
      // Determine image type for compression
      const imageType = getImageType();

      // Compress image first with type-specific settings
      const {
        file: compressed,
        warning: compressWarning,
        error: compressError,
      } = await compressImage(file, {
        type: imageType,
        maxSizeMB,
        warnSizeMB,
        maxDimension,
        timeout: 30000, // 30 second timeout for compression
      });

      if (compressError) {
        setError(compressError);
        setIsUploading(false);
        return;
      }

      if (compressWarning) {
        setWarning(compressWarning);
      }

      // Upload to S3 with custom key and timeout
      const uploadResult = await uploadCampaignImage(compressed, customKey);

      // Cache busting: append ?v=timestamp
      const cacheBustedUrl = `${uploadResult.publicUrl}?v=${Date.now()}`;

      // Create metadata object
      const metadata = {
        url: cacheBustedUrl,
        key: uploadResult.key,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
        description: `${label} for campaign`,
        altText: "",
      };

      // Update preview with public URL
      setPreview(cacheBustedUrl);

      // Call onChange with the metadata object for storage
      onChange(metadata);

      // Call onImageMetadata with the full metadata for backend storage
      if (onImageMetadata) {
        onImageMetadata(metadata);
      }
    } catch (err) {
      console.error("Image upload error:", err);

      // Provide user-friendly error messages
      let errorMessage = "Failed to upload image. Please try again.";

      if (err.message.includes("timeout")) {
        errorMessage =
          "Upload timed out. Please check your connection and try again.";
      } else if (err.message.includes("permission")) {
        errorMessage =
          "Upload failed due to permission issues. Please contact support.";
      } else if (err.message.includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (err.message.includes("too large")) {
        errorMessage = "File is too large. Please use a smaller image.";
      } else if (err.message.includes("not supported")) {
        errorMessage =
          "This image format is not supported. Please use JPEG, PNG, or WebP.";
      }

      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    setWarning(null);
    onChange(null);
    if (onImageMetadata) {
      onImageMetadata(null);
    }
  };

  const handleButtonClick = () => {
    if (!isUploading) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-[color:var(--color-secondary-text)]">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="text-[color:var(--color-secondary-text)] hover:text-[color:var(--color-primary)] transition-colors"
          title="Image upload information"
        >
          <FiInfo className="w-4 h-4" />
        </button>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs text-blue-700 dark:text-blue-300">
          <div className="font-medium mb-1">Image Upload Guidelines:</div>
          <div className="space-y-1">
            <div>• Maximum file size: 5MB</div>
            <div>• Logos: Up to 500KB, resized to 256px max</div>
            <div>• Main images: Up to 1MB, resized to 1200px max</div>
            <div>
              • All images are automatically compressed for optimal performance
            </div>
            <div>• Supported formats: JPEG, PNG, WebP</div>
          </div>
        </div>
      )}

      <div className="w-full h-32 bg-[color:var(--color-background)] border-2 border-dashed border-[color:var(--color-border)] rounded-md flex items-center justify-center relative">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover rounded-md"
            />
            {!isUploading && (
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="text-center text-[color:var(--color-secondary-text)]">
            {isUploading ? (
              <>
                <FiLoader className="mx-auto h-8 w-8 animate-spin" />
                <p className="mt-1 text-sm">Uploading...</p>
                <p className="text-xs mt-1">
                  Please wait, this may take a moment
                </p>
              </>
            ) : (
              <>
                <FiUpload className="mx-auto h-8 w-8" />
                <p className="mt-1 text-sm">Upload an image</p>
                <p className="text-xs mt-1">Click to select or drag and drop</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error and warning messages */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>
        </div>
      )}
      {warning && (
        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-yellow-600 dark:text-yellow-400 text-xs">
            {warning}
          </p>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        disabled={isUploading}
      />
      <button
        onClick={handleButtonClick}
        disabled={isUploading}
        className={`mt-2 w-full px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
          isUploading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-accent)]"
        }`}
      >
        {isUploading ? "Uploading..." : "Choose Image"}
      </button>
    </div>
  );
};

export default ImagePicker;
