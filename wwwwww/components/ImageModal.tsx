'use client';

import { motion } from 'framer-motion';
import ReactDOM from 'react-dom';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { MouseEventHandler, useEffect, useState } from 'react';

interface ImageItem {
  id: string;
  src: string;
  alt: string;
}

interface ImageModalProps {
  image: ImageItem;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalImages?: number;
}

export default function ImageModal({
  image,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalImages,
}: ImageModalProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    // Sprawdź czy jesteśmy w przeglądarce
    setIsBrowser(true);

    // Blokuj scroll
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log('ESC key pressed');
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);

    return () => {
      // Przywróć scroll
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  // Osobny useEffect dla obsługi klawiatury
  useEffect(() => {
    // Sprawdź czy jesteśmy w przeglądarce
    if (typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && onPrevious && hasPrevious) {
        onPrevious();
      } else if (event.key === 'ArrowRight' && onNext && hasNext) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevious, onNext, hasPrevious, hasNext]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.cancelable) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleBackdropClick: MouseEventHandler<HTMLDivElement> = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isBrowser) return null;

  return ReactDOM.createPortal(
    <motion.div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
    >
      <motion.div
        className="relative w-full h-full max-w-none max-h-none overflow-hidden"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        {/* Zoom Controls */}
        <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Oddal"
          >
            <ZoomOut size={20} />
          </button>

          <button
            onClick={handleResetZoom}
            className="px-3 py-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors text-sm"
            aria-label="Resetuj zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </button>

          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Przybliż"
          >
            <ZoomIn size={20} />
          </button>
        </div>

        {/* Image Counter */}
        {currentIndex !== undefined && totalImages && totalImages > 1 && (
          <div className="absolute top-4 right-20 px-4 py-2 rounded-full bg-black/50 text-white text-sm font-medium z-10">
            {currentIndex + 1} / {totalImages}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            console.log('Close button clicked');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors z-[100] cursor-pointer"
          aria-label="Zamknij"
        >
          <X size={24} />
        </button>

        {/* Previous Button - Widoczny */}
        {onPrevious && hasPrevious && (
          <div className="absolute left-0 top-0 w-20 h-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-300 z-40 group">
            <button
              onClick={onPrevious}
              className="p-4 rounded-full bg-black/80 text-white hover:bg-black/90 transition-all duration-200 hover:scale-110 shadow-lg"
              aria-label="Poprzednie zdjęcie"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Next Button - Widoczny */}
        {onNext && hasNext && (
          <div className="absolute right-0 top-0 w-20 h-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-300 z-40 group">
            <button
              onClick={onNext}
              className="p-4 rounded-full bg-black/80 text-white hover:bg-black/90 transition-all duration-200 hover:scale-110 shadow-lg"
              aria-label="Następne zdjęcie"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Image Container */}
        <div
          className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing bg-black touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <motion.img
            src={image.src}
            alt={image.alt}
            className="max-w-full max-h-full object-contain"
            animate={{
              scale: zoomLevel,
              x: imagePosition.x / zoomLevel,
              y: imagePosition.y / zoomLevel,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag={isDragging}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDrag={(e, info) => {
              if (zoomLevel > 1) {
                setImagePosition({
                  x: imagePosition.x + info.delta.x,
                  y: imagePosition.y + info.delta.y,
                });
              }
            }}
          />
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
