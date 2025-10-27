'use client';

import { SmartImage } from '@/components/ui/SmartImage';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { getImagesFromFolder } from '@/utils/getImagesFromFolder';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Eye, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Photo {
  id: string;
  src: string;
  alt: string;
  title: string;
}

interface Pedigree {
  id: string;
  src: string;
  title: string;
  type: 'jpeg' | 'pdf';
}

const pedigrees: Pedigree[] = [
  {
    id: '1',
    src: '/golden-pair/pedigrees/rodowod-samca.pdf',
    title: 'Rodowód Samca',
    type: 'pdf',
  },
  {
    id: '2',
    src: '/golden-pair/pedigrees/rodowod-samicy.pdf',
    title: 'Rodowód Samicy',
    type: 'pdf',
  },
];

export default function GoldenPairSection() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [selectedPedigree, setSelectedPedigree] = useState<Pedigree | null>(null);

  // Optymalizacja wydajności
  const { trackAction, trackEvent } = usePerformanceOptimization('GoldenPairSection', {
    enableTracking: true,
    trackRenderTime: true,
  });

  // Load photos on component mount z optymalizacją
  useEffect(() => {
    async function loadPhotos() {
      const startTime = Date.now();
      try {
        trackAction('loadPhotos_start');
        const goldenPairImages = await getImagesFromFolder('/golden-pair/photos');

        const photoData: Photo[] = goldenPairImages.map((src, index) => {
          const filename = src.split('/').pop() || '';
          let title = 'Złota Para';
          let alt = 'Złota Para';

          if (filename.includes('1360')) {
            title = 'Samiec - 1360';
            alt = 'Samiec Złotej Pary - 1360';
          } else if (filename.includes('1184')) {
            title = 'Samica - 1184';
            alt = 'Samica Złotej Pary - 1184';
          } else if (filename.includes('golden-pair')) {
            title = 'Złota Para - razem';
            alt = 'Złota Para razem';
          }

          return {
            id: (index + 1).toString(),
            src,
            alt,
            title,
          };
        });

        setPhotos(photoData);
        trackEvent('photos_loaded', photoData.length);
      } catch (error) {
        console.error('Error loading photos:', error);
        trackEvent('photos_load_error', 1);
      } finally {
        setIsLoading(false);
        const duration = Date.now() - startTime;
        trackAction('loadPhotos_complete', duration);
      }
    }

    loadPhotos();
  }, [trackAction, trackEvent]);

  const openPhotoModal = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setSelectedPhotoIndex(index);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
    setSelectedPhotoIndex(null);
  };

  const nextPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      const nextIndex = selectedPhotoIndex + 1;
      setSelectedPhoto(photos[nextIndex]);
      setSelectedPhotoIndex(nextIndex);
    }
  };

  const prevPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      const prevIndex = selectedPhotoIndex - 1;
      setSelectedPhoto(photos[prevIndex]);
      setSelectedPhotoIndex(prevIndex);
    }
  };

  const openPedigreeModal = (pedigree: Pedigree) => {
    setSelectedPedigree(pedigree);
  };

  const closePedigreeModal = () => {
    setSelectedPedigree(null);
  };

  const downloadPedigree = (pedigree: Pedigree) => {
    const link = document.createElement('a');
    link.href = pedigree.src;
    link.download = `${pedigree.title}.${pedigree.type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="golden-pair" className="pt-2 pb-20 bg-transparent">
      <div className="w-full pl-4 sm:pl-6 lg:pl-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mb-6">
            Złota Para
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Fundament genetyczny naszej hodowli. Para gołębi, która dała początek wszystkim naszym
            sukcesom i mistrzowskim liniom.
          </p>
        </motion.div>

        {/* Photos Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Galeria Zdjęć</h3>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              {/* 2 kontenery ze zdjęciami wyrównane z logo */}
              {[0, 1].map(index => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer w-96" // Usuwamy hover:scale-105
                  onClick={() => photos[index] && openPhotoModal(photos[index], index)}
                >
                  <div className="relative overflow-hidden rounded-lg shadow-lg bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="relative h-[36rem]">
                      {photos[index] ? (
                        <SmartImage
                          src={photos[index].src}
                          alt={photos[index].alt}
                          width={400}
                          height={576}
                          fitMode="contain"
                          aspectRatio="auto"
                          className="w-full h-full"
                        />
                      ) : null}
                      <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
                        <span className="text-gray-500">Brak zdjęcia</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Trzeci kontener - Złota Para (rozszerzony) */}
              {photos[2] && (
                <motion.div
                  key="golden-pair"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer w-[52rem]" // Usuwamy hover:scale-105
                  onClick={() => openPhotoModal(photos[2], 2)}
                >
                  <div className="relative overflow-hidden rounded-lg shadow-lg bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="relative h-[36rem]">
                      <SmartImage
                        src={photos[2].src}
                        alt={photos[2].alt}
                        width={832}
                        height={576}
                        fitMode="contain"
                        aspectRatio="auto"
                        className="w-full h-full"
                      />
                      <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
                        <span className="text-gray-500">Brak zdjęcia</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Pedigrees Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Rodowody</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {pedigrees.map((pedigree, index) => (
              <motion.div
                key={pedigree.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{pedigree.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                      {pedigree.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => openPedigreeModal(pedigree)}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
                    aria-label={`Podgląd rodowodu ${pedigree.title}`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Podgląd</span>
                  </button>
                  <button
                    onClick={() => downloadPedigree(pedigree)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
                    aria-label={`Pobierz rodowód ${pedigree.title}`}
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Photo Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999] p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={closePhotoModal}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                aria-label="Zamknij podgląd zdjęcia"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Navigation Arrows */}
              {selectedPhotoIndex !== null && selectedPhotoIndex > 0 && (
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  aria-label="Poprzednie zdjęcie"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1 && (
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  aria-label="Następne zdjęcie"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              <div className="bg-white rounded-xl overflow-hidden">
                <SmartImage
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt}
                  width={800}
                  height={600}
                  fitMode="contain"
                  aspectRatio="auto"
                  className="w-full h-full max-h-[80vh]"
                />
              </div>

              {/* Photo Info */}
              <div className="mt-4 bg-black/70 text-white p-4 rounded-lg">
                <h3 className="font-medium text-lg">{selectedPhoto.title}</h3>
                <p className="text-sm opacity-90">
                  Zdjęcie {selectedPhotoIndex !== null ? selectedPhotoIndex + 1 : 1} z{' '}
                  {photos.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pedigree Modal */}
        {selectedPedigree && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999] p-4">
            <div className="relative max-w-6xl max-h-full w-full">
              <button
                onClick={closePedigreeModal}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200 z-10"
                aria-label="Zamknij podgląd rodowodu"
              >
                <X className="w-8 h-8" />
              </button>
              <div className="bg-white rounded-2xl overflow-hidden h-full max-h-[80vh]">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedPedigree.title}</h3>
                </div>
                <div className="p-6 h-full overflow-auto">
                  {selectedPedigree.type === 'pdf' ? (
                    <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Download className="w-8 h-8 text-red-600" />
                        </div>
                        <p className="text-lg text-gray-700 font-medium mb-2">Podgląd PDF</p>
                        <p className="text-sm text-gray-500 mb-4">
                          Kliknij &quot;Pobierz&quot; aby otworzyć rodowód
                        </p>
                        <button
                          onClick={() => downloadPedigree(selectedPedigree)}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors duration-200"
                        >
                          <Download className="w-4 h-4" />
                          <span>Pobierz PDF</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Eye className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-lg text-gray-700 font-medium">Podgląd obrazu</p>
                        <p className="text-sm text-gray-500">Obraz będzie wyświetlany tutaj</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
