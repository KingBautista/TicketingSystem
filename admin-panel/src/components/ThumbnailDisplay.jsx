import React, { useState } from 'react';

export default function ThumbnailDisplay({ 
  images = [], 
  size = 'medium', 
  maxDisplay = 4, 
  onImageClick,
  showCount = true,
  className = ''
}) {
  const [showAll, setShowAll] = useState(false);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24', 
    large: 'w-32 h-32',
    xlarge: 'w-40 h-40'
  };

  const displayImages = showAll ? images : images.slice(0, maxDisplay);
  const hasMore = images.length > maxDisplay;

  const handleImageClick = (image, index) => {
    if (onImageClick) {
      onImageClick(image, index);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className={`text-muted text-center p-3 ${className}`}>
        <small>No images available</small>
      </div>
    );
  }

  return (
    <div className={`d-flex flex-wrap gap-2 align-items-center ${className}`}>
      {displayImages.map((image, index) => (
        <div 
          key={index}
          className={`${sizeClasses[size]} position-relative border rounded overflow-hidden cursor-pointer`}
          onClick={() => handleImageClick(image, index)}
          style={{ 
            backgroundImage: `url(${image.url || image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <img 
            src={image.url || image} 
            alt={image.alt || `Image ${index + 1}`}
            className="w-100 h-100 object-fit-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div 
            className="w-100 h-100 d-flex align-items-center justify-content-center bg-light"
            style={{ display: 'none' }}
          >
            <i className="fas fa-image text-muted"></i>
          </div>
        </div>
      ))}
      
      {hasMore && !showAll && (
        <div 
          className={`${sizeClasses[size]} d-flex align-items-center justify-content-center border rounded cursor-pointer bg-light`}
          onClick={() => setShowAll(true)}
        >
          <div className="text-center">
            <div className="text-muted">+{images.length - maxDisplay}</div>
            <small className="text-muted">more</small>
          </div>
        </div>
      )}
      
      {hasMore && showAll && (
        <button 
          className="btn btn-outline-secondary"
          onClick={() => setShowAll(false)}
        >
          Show Less
        </button>
      )}
    </div>
  );
} 