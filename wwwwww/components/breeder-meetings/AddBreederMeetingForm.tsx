'use client';

import { SmartImage } from '@/components/ui/SmartImage';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileVerification } from '@/hooks/useProfileVerification';
import { AlertCircle, Camera, CheckCircle, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddBreederMeetingForm() {
  const { user, loading } = useAuth();
  const { canAddPhotos, missingFields, loading: verificationLoading } = useProfileVerification();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    images: [] as File[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('date', formData.date);

      // Dodaj zdjęcia
      formData.images.forEach(image => {
        formDataToSend.append(`images`, image);
      });

      const response = await fetch('/api/breeder-meetings', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          title: '',
          description: '',
          location: '',
          date: '',
          images: [],
        });
        setPreviewImages([]);

        // Przekieruj po 2 sekundach
        setTimeout(() => {
          router.push('/breeder-meetings');
        }, 2000);
      } else {
        const errorData = await response.json();
        setSubmitStatus('error');
        setErrorMessage(errorData.error || 'Wystąpił błąd podczas dodawania spotkania');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Wystąpił błąd podczas wysyłania formularza');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: files,
      }));

      // Stwórz podgląd zdjęć
      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);

    setFormData(prev => ({
      ...prev,
      images: newImages,
    }));
    setPreviewImages(newPreviews);
  };

  // Jeśli użytkownik nie jest zalogowany, pokaż loading
  if (loading || verificationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg text-white">Sprawdzanie autoryzacji...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-white">Dodaj Zdjęcia ze Spotkania</h1>
          <p className="text-white/80 text-lg">
            Podziel się zdjęciami z naszych spotkań z hodowcami
          </p>
        </div>

        {user ? (
          <>
            {/* Sprawdzenie weryfikacji profilu */}
            {!canAddPhotos ? (
              <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-200">
                      <strong>Weryfikacja profilu wymagana</strong>
                    </p>
                    <p className="text-sm text-yellow-200 mt-1">
                      Aby dodawać zdjęcia ze spotkań, musisz uzupełnić wszystkie dane w profilu i
                      zweryfikować numer telefonu.
                    </p>
                    {missingFields.length > 0 && (
                      <p className="text-sm text-yellow-200 mt-1">
                        Brakujące pola: {missingFields.join(', ')}
                      </p>
                    )}
                    <div className="mt-3">
                      <Link
                        href="/dashboard?tab=profile"
                        className="font-medium underline text-yellow-300 hover:text-yellow-400"
                      >
                        Uzupełnij profil
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-green-400">
                      Spotkanie zostało dodane pomyślnie! Przekierowujemy...
                    </span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                    <span className="text-red-400">{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ... reszta formularza ... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Tytuł spotkania *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="np. Spotkanie w Lubaniu 2024"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Data spotkania *
                      </label>
                      <input
                        type="text"
                        value={formData.date}
                        onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        onFocus={e => (e.target.type = 'date')}
                        onBlur={e => (e.target.type = 'text')}
                        placeholder="Wybierz datę spotkania"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        title="Wybierz datę spotkania"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Lokalizacja *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Gdzie odbyło się spotkanie?"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Opis spotkania
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 h-24 resize-none"
                      placeholder="Opisz przebieg spotkania, uczestników, tematy rozmów..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Zdjęcia ze spotkania *
                    </label>
                    <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        required
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center space-y-4"
                      >
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Camera className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Kliknij aby wybrać zdjęcia</p>
                          <p className="text-white/60 text-sm">lub przeciągnij i upuść</p>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-400">
                          <Upload className="w-4 h-4" />{' '}
                          <span className="text-sm">Wybierz pliki</span>
                        </div>
                      </label>
                    </div>
                    {previewImages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-white/70 text-sm mb-3">
                          Wybrano {previewImages.length} zdjęć
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {previewImages.map((preview, index) => (
                            <div key={index} className="relative group">
                              <SmartImage
                                src={preview}
                                alt={`Podgląd ${index + 1}`}
                                width={96}
                                height={96}
                                fitMode="contain"
                                aspectRatio="square"
                                className="w-full h-24 rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                title="Usuń zdjęcie"
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Dodawanie...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Camera className="w-5 h-5 mr-2" />
                          Dodaj Spotkanie
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Dołącz do naszej społeczności!</h2>
            <p className="text-white/80 text-lg mb-6 max-w-md mx-auto">
              Aby dodać zdjęcia ze spotkania, musisz być zalogowanym użytkownikiem.
            </p>
            <button
              onClick={() =>
                router.push('/auth/signin?callbackUrl=/breeder-meetings/dodaj-zdjecie')
              }
              className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Zaloguj się lub Zarejestruj
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
