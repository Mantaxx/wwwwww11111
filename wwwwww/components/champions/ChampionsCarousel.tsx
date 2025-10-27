'use client';

import { SmartImage } from '@/components/ui/SmartImage';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Champion {
  id: string;
  images: string[];
  pedigreeImage?: string;
}

interface ChampionsCarouselProps {
  champions: Champion[];
  onImageClick: (imageSrc: string, index: number) => void;
  onPedigreeClick: (pedigreeImage: string) => void;
}

interface ChampionImage {
  championId: string;
  imageSrc: string;
  championIndex: number;
  imageIndex: number;
}

export function ChampionsCarousel({
  champions,
  onImageClick,
  onPedigreeClick,
}: ChampionsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Przygotuj wszystkie zdjęcia z wszystkich championów
  const allImages: ChampionImage[] = champions.flatMap((champion, championIndex) =>
    champion.images.map((imageSrc, imageIndex) => ({
      championId: champion.id,
      imageSrc: imageSrc,
      championIndex,
      imageIndex,
    }))
  );

  console.log('ChampionsCarousel - Total champions:', champions.length);
  console.log('ChampionsCarousel - Total images:', allImages.length);
  console.log(
    'ChampionsCarousel - Champions data:',
    champions.map(c => ({ id: c.id, imagesCount: c.images.length }))
  );

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % allImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (allImages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white">Brak zdjęć championów do wyświetlenia.</p>
      </div>
    );
  }

  // Wybierz zdjęcia do wyświetlenia (aktualne + 4 po bokach = 5 łącznie)
  const getVisibleImages = () => {
    const visible: Array<{
      imageData: {
        championId: string;
        imageSrc: string;
        championIndex: number;
        imageIndex: number;
      };
      champion: {
        id: string;
        images: string[];
        pedigreeImage?: string;
      };
      position: number;
      index: number;
      championIndex: number;
    }> = [];
    const total = allImages.length;

    // Jeśli mamy mniej niż 5 zdjęć, powtarzaj zdjęcia
    if (total === 0) return visible;

    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + total) % total;
      const imageData = allImages[index];
      const champion = champions[imageData.championIndex];

      visible.push({
        imageData,
        champion,
        position: i, // -2: far left, -1: left, 0: center, 1: right, 2: far right
        index,
        championIndex: imageData.championIndex,
      });
    }

    return visible;
  };

  const visibleImages = getVisibleImages();

  console.log('Visible images count:', visibleImages.length);
  console.log(
    'Visible images positions:',
    visibleImages.map(v => ({ position: v.position, championId: v.champion.id }))
  );

  return (
    <div className="relative w-full max-w-[1600px] mx-auto px-4">
      {/* Carousel Container */}
      <div
        className="relative h-[580px] sm:h-[660px] overflow-hidden pb-8"
        style={{ perspective: '1200px' }}
      >
        <AnimatePresence>
          {visibleImages.map(({ imageData, champion, position, index }) => (
            <motion.div
              key={`${imageData.championId}-${imageData.imageIndex}-${index}`}
              className={`absolute inset-0 flex items-start justify-center pt-2 ${
                position === 0 ? 'z-30' : position === -1 || position === 1 ? 'z-20' : 'z-10'
              }`}
              initial={{
                opacity: 0,
                x: position * 24 + '%',
                rotateY: position * -30,
                scale: position === 0 ? 1 : Math.abs(position) === 1 ? 0.9 : 0.82,
                filter: Math.abs(position) >= 2 ? 'blur(1.5px)' : 'blur(0px)',
              }}
              animate={{
                opacity: position === 0 ? 1 : Math.abs(position) === 1 ? 0.9 : 0.7,
                x: position * 24 + '%',
                rotateY: position * -30,
                scale: position === 0 ? 1 : Math.abs(position) === 1 ? 0.9 : 0.82,
                filter: Math.abs(position) >= 2 ? 'blur(1.5px)' : 'blur(0px)',
              }}
              exit={{ opacity: 0, x: position * 24 + '%', rotateY: position * -30, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 90, damping: 20, mass: 0.8 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Champion Card */}
              <motion.div
                className={`relative bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white overflow-hidden shadow-2xl cursor-pointer ${
                  position === 0
                    ? 'w-[612px] h-[460px]'
                    : position === -1 || position === 1
                      ? 'w-[508px] h-[380px]'
                      : 'w-[372px] h-[280px]'
                }`}
                whileHover={{
                  scale: position === 0 ? 1.02 : 0.97,
                  boxShadow: '0 0 28px rgba(255, 255, 255, 0.6)',
                  transition: { duration: 0.25 },
                }}
                onClick={() => {
                  if (position === 0) {
                    onImageClick(imageData.imageSrc, index);
                  } else if (position !== 0) {
                    goToSlide(index);
                  }
                }}
              >
                {/* Champion Image */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <SmartImage
                    src={imageData.imageSrc}
                    alt={`Champion ${champion.id} - Zdjęcie ${imageData.imageIndex + 1}`}
                    width={0}
                    height={0}
                    fitMode="cover"
                    aspectRatio="auto"
                    className={`w-full h-full transition-all duration-500 ${position === 0 ? 'grayscale-0' : 'grayscale'}`}
                    sizes="100vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Dots Indicator removed */}

        {/* Przycisk Rodowód pod karuzelą */}
        <div className="mt-[500px] flex justify-center">
          <button
            onClick={() => {
              const centerImage = visibleImages.find(v => v.position === 0);
              const currentChampion = centerImage
                ? champions[centerImage.championIndex]
                : champions[0];
              const pedigreeImage =
                currentChampion?.pedigreeImage || '/champions/1/pedigree/DV-02906-11-98.1.jpg';
              onPedigreeClick(pedigreeImage);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-white/20"
          >
            RODOWÓD
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {allImages.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-300 hover:scale-110"
            aria-label="Poprzedni champion"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-300 hover:scale-110"
            aria-label="Następny champion"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}
    </div>
  );
}
