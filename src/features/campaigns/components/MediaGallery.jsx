import React, { useState } from "react";
import { FiPlay } from "react-icons/fi";

function MediaGallery({ mainMedia, secondaryImages = [], title }) {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  
  // Combine all media into one array
  const allMedia = [
    mainMedia && { url: mainMedia, type: mainMedia?.includes('.mp4') || mainMedia?.includes('video') ? 'video' : 'image' },
    ...secondaryImages.filter(Boolean).map(url => ({ url, type: 'image' }))
  ].filter(Boolean);

  const selectedMedia = allMedia[selectedMediaIndex];

  if (!allMedia.length) {
    return (
      <div className="bg-[color:var(--color-surface)] rounded-lg p-8">
        <div className="aspect-video bg-[color:var(--color-muted)] rounded-lg flex items-center justify-center">
          <p className="text-[color:var(--color-secondary-text)]">No media available</p>
        </div>
        {title && (
          <h1 className="text-2xl font-bold text-[color:var(--color-primary-text)] mt-4">
            {title}
          </h1>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[color:var(--color-surface)] rounded-lg p-4 sm:p-6">
      {/* Main Media Display */}
      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative">
        {selectedMedia?.type === 'video' ? (
          <video
            src={selectedMedia.url}
            controls
            className="w-full h-full object-cover"
            poster={allMedia.find(m => m.type === 'image')?.url}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={selectedMedia?.url}
            alt={`Campaign media ${selectedMediaIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        )}
        
        {/* Video Play Indicator */}
        {selectedMedia?.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black bg-opacity-50 rounded-full p-4">
              <FiPlay className="w-8 h-8 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => setSelectedMediaIndex(index)}
              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedMediaIndex === index
                  ? 'border-[color:var(--campaign-theme-color,var(--color-primary))] scale-105'
                  : 'border-[color:var(--color-muted)] hover:border-[color:var(--color-primary)]'
              }`}
            >
              {media.type === 'video' ? (
                <div className="w-full h-full bg-black flex items-center justify-center relative">
                  <img
                    src={media.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiPlay className="w-4 h-4 text-white" />
                  </div>
                </div>
              ) : (
                <img
                  src={media.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Campaign Title */}
      {title && (
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[color:var(--color-primary-text)] mt-4 leading-tight">
          {title}
        </h1>
      )}
    </div>
  );
}

export default MediaGallery;