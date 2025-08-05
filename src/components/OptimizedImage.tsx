import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes = '100vw',
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  // Generate responsive srcSet for different screen sizes
  const generateSrcSet = (imageSrc: string) => {
    const sizes = [320, 640, 768, 1024, 1280, 1920];
    return sizes
      .map(size => `${imageSrc}?w=${size}&q=${quality} ${size}w`)
      .join(', ');
  };

  // Fallback image
  if (error) {
    return (
      <div
        className={cn(
          'bg-gray-200 flex items-center justify-center',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {!isLoaded && placeholder === 'blur' && blurDataURL && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          srcSet={generateSrcSet(src)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          style={{
            width: width ? `${width}px` : 'auto',
            height: height ? `${height}px` : 'auto',
          }}
        />
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && !error && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  );
};

// Hook for preloading critical images
export const usePreloadImage = (src: string) => {
  useEffect(() => {
    if (!src) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [src]);
};

// Component for preloading critical images
export const PreloadImage: React.FC<{ src: string }> = ({ src }) => {
  usePreloadImage(src);
  return null;
}; 