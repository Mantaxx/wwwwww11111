'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

interface FullscreenImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  title?: string;
}

export function FullscreenImageModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  title,
}: FullscreenImageModalProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset state when modal opens/closes or image changes
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(currentIndex);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      // Blokuj przewijanie strony
      document.body.style.overflow = 'hidden';
    } else {
      // Przywróć przewijanie strony
      document.body.style.overflow = 'unset';
    }

    // Cleanup przy unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex]);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setActiveIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setActiveIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          handleRotate();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, onClose, goToPrevious, goToNext]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between text-white">
            <div>
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              <p className="text-sm text-white/70">
                {activeIndex + 1} z {images.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Zamknij (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center gap-2 text-white">
            <button
              onClick={e => {
                e.stopPropagation();
                handleZoomOut();
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Pomniejsz (-)"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            <span className="text-sm px-2 min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>

            <button
              onClick={e => {
                e.stopPropagation();
                handleZoomIn();
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Powiększ (+)"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                handleRotate();
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Obróć (R)"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                resetView();
              }}
              className="px-3 py-1 text-sm hover:bg-white/10 rounded transition-colors"
              title="Resetuj widok"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={e => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/10 rounded-full transition-colors z-10"
              title="Poprzednie zdjęcie (←)"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/10 rounded-full transition-colors z-10"
              title="Następne zdjęcie (→)"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* Image */}
        <div
          className={`relative w-full h-full flex items-center justify-center ${zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
          onClick={e => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <motion.div
            className="relative max-w-full max-h-full"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            }}
            transition={{ type: 'tween', duration: 0.1 }}
          >
            <Image
              src={images[activeIndex]}
              alt={`${title || 'Zdjęcie'} ${activeIndex + 1}`}
              width={1920}
              height={1080}
              className="max-w-[90vw] max-h-[90vh] object-contain select-none"
              priority
              draggable={false}
            />
          </motion.div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/30 rounded-lg backdrop-blur-sm">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={e => {
                  e.stopPropagation();
                  setActiveIndex(index);
                }}
                className={`relative w-12 h-12 rounded overflow-hidden border-2 transition-colors ${
                  index === activeIndex ? 'border-white' : 'border-white/30 hover:border-white/60'
                }`}
                title={`Przejdź do zdjęcia ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`Miniaturka ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
