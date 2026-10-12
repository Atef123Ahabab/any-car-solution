import React, { useState, useRef, useEffect } from 'react';

const LazyImage = ({ src, alt, className, onError, fallback = '/placeholder-car.jpg' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
    e.target.src = fallback;
  };

  return (
    <div ref={imgRef} className={`lazy-image-container ${className || ''}`}>
      {!isInView ? (
        <div className="image-skeleton">
          <div className="skeleton-shimmer"></div>
        </div>
      ) : (
        <>
          {!isLoaded && !hasError && (
            <div className="image-skeleton">
              <div className="skeleton-shimmer"></div>
            </div>
          )}
          <img
            src={isInView ? src : ''}
            alt={alt}
            className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
            onLoad={handleLoad}
            onError={handleError}
            style={{ display: isLoaded || hasError ? 'block' : 'none' }}
          />
        </>
      )}
    </div>
  );
};

export default LazyImage;
