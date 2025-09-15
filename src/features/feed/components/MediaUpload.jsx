import React, { useState, useRef } from "react";
import MediaContainer from "../../../components/MediaContainer";

const MediaUpload = ({ onMediaChange, currentMedia = [], error }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit for better performance
      return isValidType && isValidSize;
    });

    if (validFiles.length !== fileArray.length) {
      alert(
        "Some files were skipped. Please ensure files are images/videos under 5MB."
      );
    }

    const newMedia = validFiles.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      file,
      type: file.type.startsWith("image/") ? "image" : "video",
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));

    onMediaChange([...currentMedia, ...newMedia]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeMedia = (mediaId) => {
    const updatedMedia = currentMedia.filter((media) => media.id !== mediaId);
    onMediaChange(updatedMedia);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
        Media (Optional)
      </label>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
            : "border-[var(--color-muted)] hover:border-[var(--color-primary)]/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-[var(--color-secondary-text)]"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-[var(--color-text)]">
            <span className="font-medium">Click to upload</span> or drag and
            drop
          </div>
          <div className="text-sm text-[var(--color-secondary-text)]">
            Images and videos up to 5MB each
          </div>
        </div>
      </div>

      {/* Media Preview */}
      {currentMedia.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-[var(--color-text)] mb-2">
            Uploaded Media ({currentMedia.length})
          </h4>
          <div
            className={`grid gap-4 ${
              currentMedia.length === 1
                ? "grid-cols-1"
                : currentMedia.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }`}
          >
            {currentMedia.map((media) => (
              <MediaContainer
                key={media.id}
                media={media}
                size="medium"
                showRemoveButton={true}
                onRemove={removeMedia}
                showFileInfo={true}
              />
            ))}
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default MediaUpload;
