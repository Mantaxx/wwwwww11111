'use client';

import { SmartImage } from '@/components/ui/SmartImage';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// References data from database

export function ReferencesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [references, setReferences] = useState<
    Array<{
      id: string;
      breederName: string;
      location: string;
      pigeonName: string;
      achievements: string;
      opinion: string;
      rating: number;
      images: string[];
      createdAt: string;
    }>
  >([]);
  const [formData, setFormData] = useState({
    breederName: '',
    location: '',
    pigeonName: '',
    achievements: '',
    opinion: '',
    rating: 5,
    images: [] as File[],
  });
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load references from API
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const response = await fetch('/api/references');
        if (response.ok) {
          const data = await response.json();
          setReferences(data);
        }
      } catch (error) {
        console.error('Błąd podczas ładowania referencji:', error);
      }
    };

    fetchReferences();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));

      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...previews]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);

    setFormData(prev => ({ ...prev, images: newImages }));
    setPreviewImages(newPreviews);
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sprawdź, czy użytkownik jest zalogowany i ma zweryfikowany telefon
    if (!user) {
      setSubmitError('Musisz być zalogowany, aby dodać opinię. Zaloguj się i spróbuj ponownie.');
      return;
    }

    // Sprawdź czy użytkownik ma zweryfikowany telefon (można dodać tę właściwość do Firebase user)
    // if (!user.phoneNumber) {
    //   setSubmitError('Musisz mieć zweryfikowany numer telefonu, aby dodać opinię. Zweryfikuj swój numer telefonu w ustawieniach profilu.')
    //   return
    // }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Symulacja wysyłania danych do API
      // const response = await fetch('/api/references', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })

      // if (!response.ok) throw new Error('Nie udało się dodać referencji')

      // Dodaj nową referencję do listy
      const newReference = {
        id: Date.now().toString(),
        breederName: formData.breederName,
        location: formData.location,
        pigeonName: formData.pigeonName,
        achievements: formData.achievements,
        opinion: formData.opinion,
        rating: formData.rating,
        images: formData.images.map(file => URL.createObjectURL(file)), // Convert File[] to string[]
        createdAt: new Date().toISOString(),
      };

      setReferences(prev => [newReference, ...prev]);
      setSubmitSuccess(true);

      // Resetuj formularz
      setFormData({
        breederName: '',
        location: '',
        pigeonName: '',
        achievements: '',
        opinion: '',
        rating: 5,
        images: [],
      });

      // Wyczyść podgląd zdjęć
      previewImages.forEach(preview => URL.revokeObjectURL(preview));
      setPreviewImages([]);

      // Po 3 sekundach ukryj komunikat o sukcesie
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError('Wystąpił błąd podczas dodawania opinii. Spróbuj ponownie.');
      console.error('Error submitting reference:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
      />
    ));
  };

  return (
    <>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 pt-8 pb-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">Opinie o Gołębiach</h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto"
          >
            Poznaj osiągnięcia gołębi, które super latają u innych hodowców
          </motion.p>
        </div>
      </motion.section>

      {/* Success Message */}
      {submitSuccess && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-white text-center">
          Dziękujemy za dodanie opinii! Twoja opinia o gołębiach została pomyślnie zapisana.
        </div>
      )}

      {/* Add Reference Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <UnifiedCard variant="glass" glow={false} className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-white">Dodaj Opinię o Gołębiach</h2>
            <p className="text-white/80 text-lg">
              Podziel się osiągnięciami gołębi, które super latają u innych hodowców
            </p>
          </div>

          {user ? (
            <>
              {submitError && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center">
                  <span className="text-red-400">{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Nazwa hodowcy *
                    </label>
                    <input
                      type="text"
                      name="breederName"
                      value={formData.breederName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/15 hover:border-white/40 hover:shadow-lg hover:shadow-white/20"
                      placeholder="Jan Kowalski"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Lokalizacja *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/15 hover:border-white/40 hover:shadow-lg hover:shadow-white/20"
                      placeholder="Warszawa"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Nazwa gołębia</label>
                  <input
                    type="text"
                    name="pigeonName"
                    value={formData.pigeonName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/15 hover:border-white/40 hover:shadow-lg hover:shadow-white/20"
                    placeholder="np. Biały Orzeł"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Osiągnięcia gołębia
                  </label>
                  <textarea
                    name="achievements"
                    value={formData.achievements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/15 hover:border-white/40 hover:shadow-lg hover:shadow-white/20 resize-none"
                    placeholder="Opisz osiągnięcia gołębia, miejsca w konkursach, dystanse..."
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Twoja opinia *
                  </label>
                  <textarea
                    name="opinion"
                    value={formData.opinion}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/15 hover:border-white/40 hover:shadow-lg hover:shadow-white/20 resize-none"
                    placeholder="Podziel się swoją opinią o gołębiach, ich charakterystyce, wynikach..."
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Ocena</label>
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleRatingChange(index + 1)}
                        className="focus:outline-none hover:scale-110 transition-transform duration-200"
                        title={`Oceń na ${index + 1} ${index + 1 === 1 ? 'gwiazdkę' : 'gwiazdek'}`}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            index < formData.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Zdjęcia gołębia (opcjonalnie)
                  </label>
                  <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-white/50 hover:bg-white/5 hover:shadow-lg hover:shadow-white/20 transition-all duration-300">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center space-y-4"
                    >
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-8 h-8 text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">Kliknij aby wybrać zdjęcia</p>
                        <p className="text-white/60 text-sm">lub przeciągnij i upuść</p>
                      </div>
                    </label>
                  </div>
                  {previewImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-white/70 text-sm mb-3">
                        Wybrano {previewImages.length} zdjęć
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {previewImages.map((preview, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group aspect-square"
                          >
                            <SmartImage
                              src={preview}
                              alt={`Podgląd ${index + 1}`}
                              width={150}
                              height={150}
                              fitMode="contain"
                              aspectRatio="square"
                              className="w-full h-full rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              title="Usuń zdjęcie"
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600/70 hover:bg-blue-600/90 text-white rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-white/20"
                  >
                    {isSubmitting ? 'Wysyłanie...' : 'Dodaj opinię'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4 text-white">Dołącz do naszej społeczności!</h2>
              <p className="text-white/80 text-lg mb-6 max-w-md mx-auto">
                Aby dodać opinię o gołębiach, musisz być zalogowanym użytkownikiem.
              </p>
              <button
                onClick={() => router.push('/auth/signin?callbackUrl=/references')}
                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Zaloguj się lub Zarejestruj
              </button>
            </div>
          )}
        </UnifiedCard>
      </motion.div>

      {/* References Grid */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {references.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {references.map((reference, index) => (
                <motion.div
                  key={reference.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <UnifiedCard variant="glass" className="p-6">
                    <div className="flex items-start mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                          {reference.images && reference.images.length > 0 ? (
                            <SmartImage
                              src={reference.images[0]}
                              alt={reference.breederName}
                              width={48}
                              height={48}
                              fitMode="contain"
                              aspectRatio="auto"
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xl font-semibold">
                              {reference.breederName[0]}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-white">
                          {reference.breederName}
                        </h3>
                        <p className="text-sm text-gray-300">{reference.location}</p>
                        {reference.pigeonName && (
                          <p className="text-sm text-blue-300 font-medium">
                            {reference.pigeonName}
                          </p>
                        )}
                        <div className="flex items-center mt-1">
                          {renderStars(reference.rating)}
                        </div>
                      </div>
                    </div>
                    {reference.achievements && (
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-white/80 mb-1">Osiągnięcia:</h4>
                        <p className="text-sm text-white/70">{reference.achievements}</p>
                      </div>
                    )}
                    <p className="text-white/90 mb-4">{reference.opinion}</p>
                    <div className="text-sm text-gray-400">
                      {new Date(reference.createdAt).toLocaleDateString('pl-PL')}
                    </div>
                  </UnifiedCard>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/70">
              <p>Brak opinii do wyświetlenia. Bądź pierwszy i dodaj swoją opinię o gołębiach!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
