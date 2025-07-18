import React, { useState, useEffect } from "react";
import { Music } from "lucide-react";
import { getArtworkUrl, preloadArtwork } from "../../utils/artwork.js";

/**
 * ArtworkImage Component
 * Handles dynamic artwork loading with loading states, error handling, and fallbacks
 */
const ArtworkImage = ({
  track,
  size = "medium",
  className = "",
  showLoadingState = true,
  showErrorFallback = true,
  alt,
  onClick,
  ...props
}) => {
  const [imageState, setImageState] = useState({
    src: null,
    isLoading: true,
    hasError: false,
  });

  useEffect(() => {
    if (!track) {
      setImageState({
        src: null,
        isLoading: false,
        hasError: true,
      });
      return;
    }

    const artworkUrl = getArtworkUrl(track, size);

    setImageState((prev) => ({
      ...prev,
      isLoading: true,
      hasError: false,
    }));

    preloadArtwork(artworkUrl)
      .then((url) => {
        setImageState({
          src: url,
          isLoading: false,
          hasError: false,
        });
      })
      .catch(() => {
        setImageState({
          src: getArtworkUrl(null, size), // fallback image
          isLoading: false,
          hasError: true,
        });
      });
  }, [track?.id, track?.artist, track?.album, track?.title, size]);

  const handleImageError = () => {
    if (!imageState.hasError) {
      setImageState((prev) => ({
        ...prev,
        src: getArtworkUrl(null, size),
        hasError: true,
      }));
    }
  };

  const containerClasses = `
    relative overflow-hidden bg-gray-800 
    flex items-center justify-center
    ${className}
  `.trim();

  // Loading state
  if (imageState.isLoading && showLoadingState) {
    return (
      <div className={containerClasses} {...props}>
        <div className="absolute inset-0 bg-gray-700 animate-pulse" />
        <div className="relative z-10 text-gray-500">
          <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Error state with fallback
  if (imageState.hasError && showErrorFallback && !imageState.src) {
    return (
      <div className={containerClasses} {...props}>
        <div className="text-gray-500">
          <Music className="w-8 h-8" />
        </div>
      </div>
    );
  }

  // Image loaded successfully
  return (
    <div className={containerClasses} onClick={onClick} {...props}>
      {imageState.src && (
        <img
          src={imageState.src}
          alt={
            alt ||
            `${track?.title || "Unknown"} - ${track?.artist || "Unknown Artist"}`
          }
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={handleImageError}
        />
      )}

      {/* Optional overlay on hover */}
      {onClick && (
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 cursor-pointer" />
      )}
    </div>
  );
};

export default ArtworkImage;
