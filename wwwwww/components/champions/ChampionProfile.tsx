'use client';

import ImageModal from '@/components/ImageModal';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Heart, MapPin, Play, Share2, Trophy, Users, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface Champion {
  id: string;
  name: string;
  ringNumber: string;
  bloodline: string;
  gender: string;
  birthDate: string;
  color: string;
  weight: string;
  breeder: string;
  achievements: Array<{
    competition: string;
    place: number;
    date: string;
    distance: string;
    participants: number;
  }>;
  pedigree: {
    father: {
      name: string;
      ringNumber: string;
      bloodline: string;
      achievements: string[];
    };
    mother: {
      name: string;
      ringNumber: string;
      bloodline: string;
      achievements: string[];
    };
    grandfather: {
      name: string;
      ringNumber: string;
      bloodline: string;
    };
    grandmother: {
      name: string;
      ringNumber: string;
      bloodline: string;
    };
  };
  offspring: Array<{
    id: string;
    name: string;
    ringNumber: string;
    achievements: string[];
  }>;
  gallery: Array<{
    id: string;
    src: string;
    alt: string;
    thumbnail: string;
  }>;
  videos: Array<{
    title: string;
    url: string;
    duration: string;
    thumbnail: string;
  }>;
}

interface ChampionProfileProps {
  champion: Champion;
}

export function ChampionProfile({ champion }: ChampionProfileProps) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'pedigree' | 'results' | 'offspring'>(
    'gallery'
  );
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  // Funkcje nawigacji - bez useCallback na razie
  const handlePreviousImage = () => {
    console.log(
      'Previous clicked, current:',
      selectedImage,
      'gallery length:',
      champion.gallery.length
    );
    console.log('Can go previous?', selectedImage !== null && selectedImage > 0);
    if (selectedImage !== null && selectedImage > 0) {
      console.log('Setting selectedImage to:', selectedImage - 1);
      setSelectedImage(selectedImage - 1);
    } else {
      console.log('Cannot go previous - selectedImage is null or <= 0');
    }
  };

  const handleNextImage = () => {
    console.log(
      'Next clicked, current:',
      selectedImage,
      'gallery length:',
      champion.gallery.length
    );
    console.log(
      'Can go next?',
      selectedImage !== null && selectedImage < champion.gallery.length - 1
    );
    if (selectedImage !== null && selectedImage < champion.gallery.length - 1) {
      console.log('Setting selectedImage to:', selectedImage + 1);
      setSelectedImage(selectedImage + 1);
    } else {
      console.log('Cannot go next - selectedImage is null or >= gallery.length - 1');
    }
  };

  const tabs = [
    { id: 'gallery', label: 'Galeria', icon: '🖼️' },
    { id: 'pedigree', label: 'Rodowód', icon: '🌳' },
    { id: 'results', label: 'Wyniki', icon: '🏆' },
    { id: 'offspring', label: 'Potomstwo', icon: '👶' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-600 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Champion Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {champion.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </span>
                </div>
                <div>
                  <h1 className="font-display font-bold text-4xl lg:text-5xl">{champion.name}</h1>
                  <p className="text-primary-100 text-lg">{champion.ringNumber}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  <span className="text-lg">Champion Międzynarodowy</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5" />
                  <span>Linia krwi: {champion.bloodline}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5" />
                  <span>
                    Data urodzenia:{' '}
                    {format(new Date(champion.birthDate), 'dd MMMM yyyy', { locale: pl })}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5" />
                  <span>Hodowca: {champion.breeder}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>Dodaj do ulubionych</span>
                </button>
                <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Udostępnij</span>
                </button>
              </div>
            </motion.div>

            {/* Champion Photo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 rounded-3xl p-8">
                <div className="aspect-[1/1] bg-white/20 rounded-2xl overflow-hidden">
                  <Image
                    src={champion.gallery[0].src}
                    alt=""
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as 'gallery' | 'pedigree' | 'results' | 'offspring')
                }
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {activeTab === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full">
                  {champion.gallery.map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="group cursor-pointer"
                      onClick={() => setSelectedImage(index)} // Zachowujemy kliknięcie do modala
                    >
                      <div className="aspect-[16/9] w-full max-w-xs bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl overflow-hidden">
                        <Image
                          src={image.thumbnail}
                          alt=""
                          fill
                          width={400} // Zachowujemy oryginalne wymiary
                          height={225} // Zachowujemy oryginalne wymiary
                          className="w-full h-full object-cover" // Zmieniamy na object-cover i usuwamy skalowanie
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-2"></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Videos */}
                <div>
                  <h3 className="font-display font-bold text-2xl text-gray-900 mb-6">Filmy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {champion.videos.map((video, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="group cursor-pointer"
                        onClick={() => setSelectedVideo(index)}
                      >
                        <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl aspect-video overflow-hidden relative">
                          <Image
                            src={video.thumbnail}
                            alt=""
                            fill
                            width={400}
                            height={225}
                            className="w-full h-full object-cover" // Zmieniamy na object-cover
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Play className="w-12 h-12 mx-auto mb-2" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'pedigree' && (
              <motion.div
                key="pedigree"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="champion-profile-card">
                  <div className="champion-profile-card-header">
                    <h3 className="champion-profile-card-title">Drzewo Genealogiczne</h3>
                  </div>
                  <div className="champion-profile-card-content">
                    <div className="space-y-8">
                      {/* Current Champion */}
                      <div className="text-center">
                        <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-6 rounded-2xl shadow-lg">
                          <h4 className="font-bold text-xl">{champion.name}</h4>
                          <p className="text-sm opacity-90">{champion.ringNumber}</p>
                        </div>
                      </div>

                      {/* Parents */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="text-center">
                          <div className="pedigree-card">
                            <div className="pedigree-card-title text-blue-200">Ojciec</div>
                            <div className="pedigree-card-content">
                              <h6 className="font-medium text-white text-lg">
                                {champion.pedigree.father.name}
                              </h6>
                              <p className="text-blue-200">{champion.pedigree.father.ringNumber}</p>
                              <p className="text-white/80">{champion.pedigree.father.bloodline}</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="pedigree-card">
                            <div className="pedigree-card-title text-pink-200">Matka</div>
                            <div className="pedigree-card-content">
                              <h6 className="font-medium text-white text-lg">
                                {champion.pedigree.mother.name}
                              </h6>
                              <p className="text-pink-200">{champion.pedigree.mother.ringNumber}</p>
                              <p className="text-white/80">{champion.pedigree.mother.bloodline}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Grandparents */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="text-center">
                          <div className="pedigree-card">
                            <div className="pedigree-card-title text-gray-300">Dziadek (Ojca)</div>
                            <div className="pedigree-card-content">
                              <h6 className="font-medium text-white text-lg">
                                {champion.pedigree.grandfather.name}
                              </h6>
                              <p className="text-gray-300">
                                {champion.pedigree.grandfather.ringNumber}
                              </p>
                              <p className="text-white/80">
                                {champion.pedigree.grandfather.bloodline}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="pedigree-card">
                            <div className="pedigree-card-title text-gray-300">Babcia (Ojca)</div>
                            <div className="pedigree-card-content">
                              <h6 className="font-medium text-white text-lg">
                                {champion.pedigree.grandmother.name}
                              </h6>
                              <p className="text-gray-300">
                                {champion.pedigree.grandmother.ringNumber}
                              </p>
                              <p className="text-white/80">
                                {champion.pedigree.grandmother.bloodline}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200">
                    <h3 className="font-display font-bold text-2xl text-gray-900">
                      Wyniki Zawodów
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                            Zawody
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                            Miejsce
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                            Data
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                            Dystans
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                            Uczestnicy
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {champion.achievements.map((achievement, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {achievement.competition}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  achievement.place === 1
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : achievement.place === 2
                                      ? 'bg-gray-100 text-gray-800'
                                      : 'bg-orange-100 text-orange-800'
                                }`}
                              >
                                {achievement.place === 1 && <Trophy className="w-4 h-4 mr-1" />}
                                {achievement.place}. miejsce
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {format(new Date(achievement.date), 'dd MMM yyyy', { locale: pl })}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {achievement.distance}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {achievement.participants}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'offspring' && (
              <motion.div
                key="offspring"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {champion.offspring.map((child, index) => (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-bold text-lg">
                            {child.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-xl text-gray-900">
                            {child.name}
                          </h4>
                          <p className="text-primary-600 font-medium">{child.ringNumber}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-900">Osiągnięcia:</h5>
                        {child.achievements.map((achievement, idx) => (
                          <div key={idx} className="flex items-start">
                            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage !== null && (
        <ImageModal
          image={{
            id: champion.gallery[selectedImage].id || selectedImage.toString(),
            src: champion.gallery[selectedImage].src,
            alt: champion.gallery[selectedImage].alt || `Zdjęcie ${champion.name}`,
          }}
          onClose={() => setSelectedImage(null)}
          onPrevious={selectedImage > 0 ? handlePreviousImage : undefined}
          onNext={selectedImage < champion.gallery.length - 1 ? handleNextImage : undefined}
          hasPrevious={selectedImage > 0}
          hasNext={selectedImage < champion.gallery.length - 1}
        />
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999] p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-full"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                aria-label="Zamknij film"
              >
                <X className="w-8 h-8" />
              </button>
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
