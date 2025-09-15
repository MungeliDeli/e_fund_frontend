import React from "react";

const MediaContainer = ({
  media,
  size = "default",
  className = "",
  showRemoveButton = false,
  onRemove = null,
  showFileInfo = false,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "aspect-[4/3]";
      case "medium":
        return "aspect-[3/2]";
      case "large":
        return "aspect-[16/9]";
      case "square":
        return "aspect-square";
      default:
        return "aspect-[16/9]";
    }
  };

  const getContainerClasses = () => {
    const baseClasses =
      "relative rounded-lg overflow-hidden flex items-center justify-center";
    const sizeClasses = getSizeClasses();

    return `${baseClasses} ${sizeClasses} ${className}`;
  };

  const renderMedia = () => {
    if (media.type === "image") {
      return (
        <>
          {/* Blurred background image */}
          <img
            src={media.url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover filter blur-xl scale-110"
            loading="lazy"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30" />
          {/* Main image */}
          <img
            src={media.url}
            alt={media.altText || media.fileName || media.name || "Media"}
            className="relative z-10 max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        </>
      );
    } else if (media.type === "video") {
      return (
        <>
          {/* Blurred background video frame */}
          <video
            src={media.url}
            className="absolute inset-0 w-full h-full object-cover filter blur-xl scale-110"
            muted
            loop
            playsInline
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30" />
          {/* Main video */}
          <video
            src={media.url}
            controls
            className="relative z-10 max-w-full max-h-full object-contain"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </>
      );
    } else {
      return (
        <div className="flex items-center justify-center bg-[var(--color-muted)]">
          <span className="text-[var(--color-secondary-text)] text-sm">
            Unsupported media type
          </span>
        </div>
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="relative group">
      <div className={getContainerClasses()}>{renderMedia()}</div>

      {/* Remove button */}
      {showRemoveButton && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(media.id)}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
          title="Remove media"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* File information */}
      {showFileInfo && (
        <div className="mt-2 space-y-1">
          <div className="text-xs text-[var(--color-secondary-text)] truncate">
            {media.fileName || media.name}
          </div>
          {media.size && (
            <div className="text-xs text-[var(--color-secondary-text)]">
              {formatFileSize(media.size)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaContainer;
