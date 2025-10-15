import React, { useEffect, useRef, useState } from "react";
import { FiPlay, FiChevronLeft, FiChevronRight } from "react-icons/fi";

function MediaGallery({ mainMedia, secondaryImages = [], title }) {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const autoSlideRef = useRef(null);
  const [fadeOpacity, setFadeOpacity] = useState(1);
  const [slideOffset, setSlideOffset] = useState(0);
  const [lastDirection, setLastDirection] = useState("next");

  // Combine all media into one array
  const allMedia = [
    mainMedia && {
      url: mainMedia,
      type:
        mainMedia?.includes(".mp4") || mainMedia?.includes("video")
          ? "video"
          : "image",
    },
    ...secondaryImages.filter(Boolean).map((url) => ({ url, type: "image" })),
  ].filter(Boolean);

  const selectedMedia = allMedia[selectedMediaIndex];

  // Auto-slide every 5 seconds when multiple media are available
  useEffect(() => {
    if (allMedia.length <= 1) return;
    autoSlideRef.current = setInterval(() => {
      setLastDirection("next");
      setSelectedMediaIndex((prev) => (prev + 1) % allMedia.length);
    }, 5000);
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [allMedia.length]);

  // Animate on index change
  useEffect(() => {
    setFadeOpacity(0);
    setSlideOffset(lastDirection === "next" ? 20 : -20);
    const raf = requestAnimationFrame(() => {
      setFadeOpacity(1);
      setSlideOffset(0);
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedMediaIndex, lastDirection]);

  const goPrev = () => {
    if (allMedia.length <= 1) return;
    setLastDirection("prev");
    setSelectedMediaIndex(
      (prev) => (prev - 1 + allMedia.length) % allMedia.length
    );
  };

  const goNext = () => {
    if (allMedia.length <= 1) return;
    setLastDirection("next");
    setSelectedMediaIndex((prev) => (prev + 1) % allMedia.length);
  };

  if (!allMedia.length) {
    return (
      <div className="bg-[color:var(--color-background)] rounded-lg">
        {title && (
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[color:var(--color-primary-text)] mb-4 leading-tight">
            {title}
          </h1>
        )}
        <div className="aspect-video bg-[color:var(--color-muted)] rounded-lg flex items-center justify-center">
          <p className="text-[color:var(--color-secondary-text)]">
            No media available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[color:var(--color-background)] rounded-lg">
      {/* Campaign Title */}
      {title && (
        <h1 className="text-xl sm:text-2xl lg:text-2xl font-semibold text-[color:var(--color-primary-text)] mb-4 leading-tight">
          {title}
        </h1>
      )}

      {/* Main Media Display with arrows */}
      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3 relative">
        {selectedMedia?.type === "video" ? (
          <video
            key={selectedMedia.url}
            src={selectedMedia.url}
            className="w-full h-full object-cover"
            poster={allMedia.find((m) => m.type === "image")?.url}
            autoPlay
            muted
            loop
            playsInline
            controls
            style={{
              opacity: fadeOpacity,
              transform: `translateX(${slideOffset}px)`,
              transition: "opacity 400ms ease, transform 400ms ease",
            }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            key={selectedMedia.url}
            src={selectedMedia?.url}
            alt={`Campaign media ${selectedMediaIndex + 1}`}
            className="w-full h-full object-cover"
            style={{
              opacity: fadeOpacity,
              transform: `translateX(${slideOffset}px)`,
              transition: "opacity 400ms ease, transform 400ms ease",
            }}
          />
        )}

        {/* Overlaid arrows */}
        {allMedia.length > 1 && (
          <>
            <button
              aria-label="Previous media"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 focus:outline-none"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <button
              aria-label="Next media"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 focus:outline-none"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Video Play Indicator */}
        {selectedMedia?.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black bg-opacity-50 rounded-full p-4">
              <FiPlay className="w-8 h-8 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaGallery;
