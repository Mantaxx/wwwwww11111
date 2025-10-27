'use client';

import { motion } from 'framer-motion';
import { ImageIcon, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: (index: number) => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
    // Log the error for debugging
    console.warn(`Failed to load image: ${src}`);
  };

  // Generate optimized image URL
  const getOptimizedSrc = () => {
    if (src.startsWith('http') || src.startsWith('/api/')) {
      return src;
    }

    // For local images, you might want to use Next.js Image Optimization
    // or a service like Cloudinary
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality) params.set('q', quality.toString());
    if (sizes) params.set('sizes', sizes);

    const queryString = params.toString();
    return queryString ? `${src}?${queryString}` : src;
  };

  const optimizedSrc = getOptimizedSrc();

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      {...(width && height ? { style: { width, height } } : {})}
    >
      {/* Loading placeholder */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error placeholder */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Błąd ładowania obrazu</p>
          </div>
        </div>
      )}

      {/* Blur placeholder */}
      {placeholder === 'blur' && blurDataURL && !isLoaded && !isError && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-sm scale-110"
          {...(blurDataURL ? { style: { backgroundImage: `url(${blurDataURL})` } } : {})}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <motion.img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
        />
      )}

      {/* Fade in animation */}
      {isLoaded && (
        <motion.div
          className="absolute inset-0 bg-white dark:bg-gray-900"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
}

// Hook for image preloading
export function useImagePreload(src: string) {
  const [isPreloaded, setIsPreloaded] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => setIsPreloaded(true);
    img.onerror = () => setIsPreloaded(false);
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return isPreloaded;
}

// Component for image gallery with lazy loading
interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  onImageClick?: (index: number) => void;
}

export function ImageGallery({ images, alt, className = '', onImageClick }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className={`relative ${className}`}>
      {/* Main image */}
      <OptimizedImage
        src={images[currentIndex]}
        alt={`${alt} - zdjęcie ${currentIndex + 1}`}
        className="w-full h-64 object-cover rounded-lg cursor-pointer"
        onClick={() => onImageClick?.(currentIndex)}
        priority={currentIndex === 0}
      />

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                index === currentIndex
                  ? 'border-slate-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title={`Pokaż zdjęcie ${index + 1}`}
              aria-label={`Pokaż zdjęcie ${index + 1}`}
            >
              <OptimizedImage
                src={image}
                alt={`${alt} - miniaturka ${index + 1}`}
                className="w-full h-full object-cover"
                width={64}
                height={64}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
