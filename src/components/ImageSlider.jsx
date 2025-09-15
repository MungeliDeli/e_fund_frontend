import React, { useState, useRef, useEffect } from "react";

const ImageSlider = ({ media, size = "default", className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const sliderRef = useRef(null);

  const getSizeClasses = () => {
    // Responsive aspect ratios based on screen size
    const responsiveAspect =
      "aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] lg:aspect-[16/9] xl:aspect-[16/9]";

    switch (size) {
      case "small":
        return "aspect-[3/4] sm:aspect-[4/3]";
      case "medium":
        return "aspect-[4/5] sm:aspect-[3/2]";
      case "large":
        return responsiveAspect;
      case "square":
        return "aspect-square";
      default:
        return responsiveAspect;
    }
  };

  const getContainerClasses = () => {
    const baseClasses =
      "relative rounded-lg overflow-hidden flex items-center justify-center";
    const aspectClasses = getSizeClasses();
    // Make container bigger with responsive sizing
    const sizeClasses = "w-full h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem]";
    return `${baseClasses} ${aspectClasses} ${sizeClasses} ${className}`;
  };

  const getResponsiveClasses = () => {
    // Fluid sizing that adapts to container
    return "w-full";
  };

  useEffect(() => {
    const updateWidth = () => {
      if (sliderRef.current) {
        setContainerWidth(sliderRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === media.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? media.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  if (!media || media.length === 0) return null;

  const currentMedia = media[currentIndex];

  return (
    <div
      className={`relative group ${getResponsiveClasses()}`}
      ref={sliderRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={getContainerClasses()}>
        {/* Blurred background image */}
        <img
          src={currentMedia.url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-xl scale-110"
          loading="lazy"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Main image */}
        <img
          src={currentMedia.url}
          alt={currentMedia.altText || currentMedia.fileName || "Post image"}
          className="relative z-10 max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      </div>

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          {/* Previous Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
            aria-label="Previous image"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Next Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
            aria-label="Next image"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {media.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {media.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-20">
          {currentIndex + 1} / {media.length}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
