'use client';

import { motion } from 'framer-motion';
import { ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'empty' | 'blur';
  blurDataURL?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  // Nowe właściwości dla inteligentnego wyświetlania
  fitMode?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto';
  cropFocus?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
}

export function SmartImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  onLoad,
  onError,
  fitMode = 'contain',
  aspectRatio = 'auto',
  cropFocus = 'center',
}: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

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
        rootMargin: '100px', // Zwiększona wartość dla lepszego UX
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView, imgRef]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // Generuj inteligentne klasy CSS na podstawie parametrów
  const getImageClasses = () => {
    const baseClasses = 'w-full h-full object-center transition-opacity duration-300';
    const loadedClasses = isLoaded ? 'opacity-100' : 'opacity-0';

    // Mapuj fitMode na odpowiednie klasy Tailwind
    const fitClasses =
      {
        cover: 'object-cover',
        contain: 'object-contain',
        fill: 'object-fill',
        none: 'object-none',
        'scale-down': 'object-scale-down',
      }[fitMode] || 'object-contain';

    // Mapuj aspectRatio na odpowiednie klasy
    const aspectClasses =
      {
        square: 'aspect-square',
        video: 'aspect-video',
        portrait: 'aspect-[3/4]',
        landscape: 'aspect-[4/3]',
        auto: '',
      }[aspectRatio] || '';

    return `${baseClasses} ${loadedClasses} ${fitClasses} ${aspectClasses}`;
  };

  // Generuj optymalizowane parametry obrazu
  const getOptimizedSrc = () => {
    // Sprawdź czy src jest prawidłowy
    if (!src || typeof src !== 'string') {
      return '';
    }

    if (src.startsWith('http') || src.startsWith('/api/')) {
      return src;
    }

    // Dodaj parametry optymalizacji dla lokalnych obrazów
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality) params.set('q', quality.toString());
    if (sizes) params.set('sizes', sizes);
    if (fitMode === 'cover') params.set('fit', 'cover');
    if (cropFocus !== 'center') params.set('crop', cropFocus);

    const queryString = params.toString();
    const encodedSrc = encodeURI(src);
    return queryString ? `${encodedSrc}?${queryString}` : encodedSrc;
  };

  const optimizedSrc = getOptimizedSrc();

  // Nie renderuj jeśli nie ma prawidłowego src
  if (!optimizedSrc) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Brak obrazu</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      {...(width && height ? { style: { width, height } } : {})}
    >
      {/* Loading placeholder */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error placeholder */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
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
          data-bg-image={blurDataURL}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <Image
          src={optimizedSrc}
          alt={alt}
          width={width || 400}
          height={height || 300}
          className={getImageClasses()}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          quality={quality}
          sizes={sizes}
          placeholder={placeholder === 'blur' && blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
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

// Hook dla preloadingu obrazów
export function useImagePreload(src: string) {
  const [isPreloaded, setIsPreloaded] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new window.Image();
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

// Hook dla batch preloadingu
export function useBatchImagePreload(srcs: string[]) {
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [isAllPreloaded, setIsAllPreloaded] = useState(false);

  useEffect(() => {
    if (!srcs.length) return;

    let loadedCount = 0;
    const totalCount = srcs.length;

    const preloadImage = (src: string) => {
      const img = new window.Image();
      img.onload = () => {
        loadedCount++;
        setPreloadedCount(loadedCount);
        if (loadedCount === totalCount) {
          setIsAllPreloaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        setPreloadedCount(loadedCount);
        if (loadedCount === totalCount) {
          setIsAllPreloaded(true);
        }
      };
      img.src = src;
    };

    srcs.forEach(preloadImage);
  }, [srcs]);

  return { preloadedCount, isAllPreloaded, progress: preloadedCount / srcs.length };
}
