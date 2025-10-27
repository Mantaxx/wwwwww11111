'use client';

import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileVerification } from '@/hooks/useProfileVerification';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Image as LucideImage, RotateCcw, Video, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const createAuctionSchema = z
  .object({
    category: z.enum(['Pigeon', 'Supplements', 'Accessories'], {
      required_error: 'Wybierz kategorię',
    }),
    title: z.string().min(5, 'Tytuł musi mieć co najmniej 5 znaków'),
    description: z.string().min(20, 'Opis musi mieć co najmniej 20 znaków'),

    // Pola specyficzne dla gołębi
    ringNumber: z.string().optional(),
    bloodline: z.string().optional(),
    sex: z.enum(['male', 'female']).optional(),
    pedigreeFile: z.any().optional(),
    eyeColor: z.string().optional(),
    featherColor: z.string().optional(),
    purpose: z.array(z.string()).optional(),

    // Dodatkowe szczegóły gołębia
    size: z.string().optional(),
    bodyStructure: z.string().optional(),
    vitality: z.string().optional(),
    colorDensity: z.string().optional(),
    length: z.string().optional(),
    endurance: z.string().optional(),

    // Cena
    startingPrice: z.number().min(0, 'Cena wywoławcza nie może być ujemna').optional(),
    buyNowPrice: z.number().optional(),

    // Czas trwania aukcji
    duration: z.number().min(1).max(30),

    // Lokalizacja
    location: z.string().min(2, 'Wybierz lokalizację z listy').optional(),
  })
  .refine(
    data => {
      // Sprawdź czy przynajmniej jedna cena jest podana
      return data.startingPrice || data.buyNowPrice;
    },
    {
      message: 'Musisz podać przynajmniej jedną cenę (wywoławczą lub Kup teraz)',
      path: ['startingPrice'],
    }
  );

type CreateAuctionFormData = z.infer<typeof createAuctionSchema>;

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video' | 'document';
  category: 'pigeon_images' | 'videos' | 'pedigree';
}

interface CreateAuctionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showHeader?: boolean;
}

export default function CreateAuctionForm({
  onSuccess,
  onCancel,
  showHeader = true,
}: CreateAuctionFormProps) {
  const { user, loading } = useAuth();
  const {
    canCreateAuctions,
    missingFields,
    loading: verificationLoading,
  } = useProfileVerification();
  const router = useRouter();
  const [pigeonImages, setPigeonImages] = useState<MediaFile[]>([]);
  const [videos, setVideos] = useState<MediaFile[]>([]);
  const [pedigreeFiles, setPedigreeFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hasStartingPrice, setHasStartingPrice] = useState(true);
  const [hasBuyNowPrice, setHasBuyNowPrice] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: string;
    lon: string;
    display_name: string;
    address: {
      city?: string;
      town?: string;
      village?: string;
      county?: string;
      state?: string;
      country?: string;
      postcode?: string;
    };
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAuctionFormData>({
    resolver: zodResolver(createAuctionSchema),
    mode: 'onChange',
  });

  const watchedCategory = watch('category');

  // Funkcje do obsługi różnych typów plików
  const createMediaFile = (
    file: File,
    category: 'pigeon_images' | 'videos' | 'pedigree'
  ): MediaFile => {
    const fileType = file.type.startsWith('video/')
      ? 'video'
      : file.type.startsWith('image/')
        ? 'image'
        : 'document';

    return {
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      type: fileType,
      category,
    };
  };

  const onDropPigeonImages = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => createMediaFile(file, 'pigeon_images'));
    setPigeonImages(prev => [...prev, ...newFiles]);
  };

  const onDropVideos = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => createMediaFile(file, 'videos'));
    setVideos(prev => [...prev, ...newFiles]);
  };

  const onDropPedigree = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => createMediaFile(file, 'pedigree'));
    setPedigreeFiles(prev => [...prev, ...newFiles]);
  };

  // Dropzone hooks dla różnych typów plików
  const {
    getRootProps: getPigeonImagesRootProps,
    getInputProps: getPigeonImagesInputProps,
    isDragActive: isPigeonImagesDragActive,
  } = useDropzone({
    onDrop: onDropPigeonImages,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 8,
  });

  const {
    getRootProps: getVideosRootProps,
    getInputProps: getVideosInputProps,
    isDragActive: isVideosDragActive,
  } = useDropzone({
    onDrop: onDropVideos,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi'],
    },
    maxFiles: 3,
  });

  const {
    getRootProps: getPedigreeRootProps,
    getInputProps: getPedigreeInputProps,
    isDragActive: isPedigreeDragActive,
  } = useDropzone({
    onDrop: onDropPedigree,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 2,
  });

  // Funkcje usuwania plików
  const removePigeonImage = (id: string) => {
    setPigeonImages(prev => prev.filter(file => file.id !== id));
  };

  const removeVideo = (id: string) => {
    setVideos(prev => prev.filter(file => file.id !== id));
  };

  const removePedigreeFile = (id: string) => {
    setPedigreeFiles(prev => prev.filter(file => file.id !== id));
  };

  const openPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const refreshForm = () => {
    // Resetuj tylko pola formularza, zachowaj pliki i stan checkboxów
    setValue('title', '');
    setValue('description', '');
    setValue('category', 'Pigeon');
    setValue('ringNumber', '');
    setValue('bloodline', '');
    setValue('sex', undefined);
    setValue('eyeColor', '');
    setValue('featherColor', '');
    setValue('purpose', []);
    setValue('startingPrice', undefined);
    setValue('buyNowPrice', undefined);
    setValue('location', '');
    setValue('duration', 7);

    // Resetuj lokalizację
    setSelectedLocation(null);

    // Zachowaj checkboxy i pliki
    // hasStartingPrice, hasBuyNowPrice, pigeonImages, videos, pedigreeFiles pozostają
  };

  const onSubmit = async (data: CreateAuctionFormData) => {
    console.log('🚀 ONSUBMIT STARTED!');
    console.log('📝 Form data:', data);

    setIsSubmitting(true);

    try {
      // Upload files by category
      let uploadedImages: string[] = [];
      let uploadedVideos: string[] = [];
      let uploadedDocuments: string[] = [];

      // Upload pigeon images
      if (pigeonImages.length > 0) {
        const imageFormData = new FormData();
        imageFormData.append('type', 'image');
        pigeonImages.forEach(file => {
          imageFormData.append('files', file.file);
        });

        const imageResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });

        if (imageResponse.ok) {
          const imageResult = await imageResponse.json();
          uploadedImages = imageResult.files || [];
        } else {
          const error = await imageResponse.json();
          console.error('Błąd uploadu obrazów:', error);
        }
      }

      // Upload videos
      if (videos.length > 0) {
        const videoFormData = new FormData();
        videoFormData.append('type', 'video');
        videos.forEach(file => {
          videoFormData.append('files', file.file);
        });

        const videoResponse = await fetch('/api/upload', {
          method: 'POST',
          body: videoFormData,
        });

        if (videoResponse.ok) {
          const videoResult = await videoResponse.json();
          uploadedVideos = videoResult.files || [];
        } else {
          const error = await videoResponse.json();
          console.error('Błąd uploadu filmów:', error);
        }
      }

      // Upload pedigree documents
      if (pedigreeFiles.length > 0) {
        const pedigreeFormData = new FormData();
        pedigreeFormData.append('type', 'document');
        pedigreeFiles.forEach(file => {
          pedigreeFormData.append('files', file.file);
        });

        const pedigreeResponse = await fetch('/api/upload', {
          method: 'POST',
          body: pedigreeFormData,
        });

        if (pedigreeResponse.ok) {
          const pedigreeResult = await pedigreeResponse.json();
          uploadedDocuments = pedigreeResult.files || [];
        } else {
          const error = await pedigreeResponse.json();
          console.error('Błąd uploadu dokumentów:', error);
        }
      }

      const now = new Date();
      const endTime = new Date(now.getTime() + (data.duration || 7) * 24 * 60 * 60 * 1000);

      const requestData = {
        title: data.title,
        description: data.description,
        category: data.category,
        startingPrice:
          hasStartingPrice && data.startingPrice && !isNaN(data.startingPrice)
            ? data.startingPrice
            : 0,
        buyNowPrice:
          hasBuyNowPrice && data.buyNowPrice && !isNaN(data.buyNowPrice)
            ? data.buyNowPrice
            : undefined,
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        images: uploadedImages,
        videos: uploadedVideos,
        documents: uploadedDocuments,
        location: data.location || 'Nie podano',
        locationData: selectedLocation
          ? {
              lat: parseFloat(selectedLocation.lat),
              lon: parseFloat(selectedLocation.lon),
              displayName: selectedLocation.display_name,
              address: selectedLocation.address,
            }
          : null,
        // Dane specyficzne dla gołębi
        ...(data.category === 'Pigeon' && {
          pigeon: {
            ringNumber: data.ringNumber,
            bloodline: data.bloodline,
            sex: data.sex,
            eyeColor: data.eyeColor,
            featherColor: data.featherColor,
            purpose: data.purpose || [],
            size: data.size,
            bodyStructure: data.bodyStructure,
            vitality: data.vitality,
            colorDensity: data.colorDensity,
            length: data.length,
            endurance: data.endurance,
          },
        }),
      };

      const response = await fetch('/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Aukcja utworzona pomyślnie:', result);
        alert('✅ Aukcja została utworzona pomyślnie!');

        if (onSuccess) {
          onSuccess();
        } else {
          // Jeśli nie ma callback, przekieruj do aukcji i odśwież
          router.push('/auctions');
          // Odśwież stronę po krótkim opóźnieniu żeby router zdążył przekierować
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } else {
        const error = await response.json();
        console.error('❌ Błąd API:', error);
        alert('❌ Wystąpił błąd podczas tworzenia aukcji: ' + (error.message || 'Nieznany błąd'));
      }
    } catch (error) {
      console.error('❌ Błąd podczas tworzenia aukcji:', error);
      alert('❌ Wystąpił błąd podczas tworzenia aukcji');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || verificationLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p>Ładowanie...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
        <p className="text-xs text-red-700">
          Musisz być zalogowany, aby utworzyć aukcję.
          <Link
            href="/auth/signin"
            className="font-medium underline text-red-800 hover:text-red-900 ml-2"
          >
            Zaloguj się
          </Link>
        </p>
      </div>
    );
  }

  if (!canCreateAuctions) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Weryfikacja profilu wymagana</strong>
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Aby utworzyć aukcję, musisz uzupełnić wszystkie dane w profilu i zweryfikować numer
              telefonu.
            </p>
            {missingFields.length > 0 && (
              <p className="text-sm text-yellow-700 mt-1">
                Brakujące pola: {missingFields.join(', ')}
              </p>
            )}
            <div className="mt-3">
              <Link
                href="/dashboard?tab=profile"
                className="font-medium underline text-yellow-800 hover:text-yellow-900"
              >
                Uzupełnij profil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border-2 border-white rounded-2xl shadow-[0_0_14px_3px_rgba(255,255,255,0.55)] max-h-[95vh] overflow-y-auto text-black relative">
      {/* Przyciski na górze */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <button
          onClick={refreshForm}
          className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
          title="Odśwież formularz"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              // Jeśli nie ma callback, przekieruj do aukcji
              router.push('/auctions');
            }
          }}
          className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
          title="Zamknij"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="p-4">
        {showHeader && (
          <div className="mb-4">
            <h1 className="text-xl font-bold text-black mb-1">Utwórz nową aukcję</h1>
            <p className="text-black/90 text-sm">
              Wypełnij wszystkie wymagane pola i opublikuj swoją aukcję
            </p>
          </div>
        )}

        {/* Kategoria */}
        <h2 className="text-sm font-semibold text-black mb-2">Kategoria *</h2>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { value: 'Pigeon', label: 'Gołąb Pocztowy', icon: '🐦' },
            { value: 'Supplements', label: 'Suplementy', icon: '💊' },
            { value: 'Accessories', label: 'Akcesoria', icon: '🏠' },
          ].map(category => (
            <label
              key={category.value}
              className={`relative flex flex-col items-center p-2 border-2 rounded-lg cursor-pointer transition-colors ${
                watchedCategory === category.value
                  ? 'border-white bg-white/20'
                  : 'border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/15'
              }`}
            >
              <input
                type="radio"
                value={category.value}
                {...register('category')}
                className="sr-only"
              />
              <span className="text-xl mb-1">{category.icon}</span>
              <span className="text-xs font-medium text-black">{category.label}</span>
            </label>
          ))}
        </div>
        {errors.category && <p className="text-red-600 text-xs mb-3">{errors.category.message}</p>}

        {/* Podstawowe informacje */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Tytuł aukcji *</label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-3 py-2 bg-white/50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-black placeholder-gray-500"
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Lokalizacja *</label>
            <LocationAutocomplete
              value={watch('location') || ''}
              onChange={value => {
                setValue('location', value);
              }}
              onLocationSelect={location => {
                setSelectedLocation(location);
              }}
              error={errors.location?.message}
            />
          </div>
        </div>

        {/* Opis */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-black mb-1">Opis *</label>
          <textarea
            {...register('description')}
            rows={2}
            className="w-full px-2 py-1 text-sm bg-white/50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-black placeholder-gray-500"
          />
          {errors.description && (
            <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Szczegóły gołębia (tylko dla kategorii Pigeon) */}
        {watchedCategory === 'Pigeon' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-black mb-1">Numer obrączki</label>
                <input
                  type="text"
                  {...register('ringNumber')}
                  className="w-full px-2 py-1 text-sm bg-white/50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-black placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-1">Linia krwi</label>
                <input
                  type="text"
                  {...register('bloodline')}
                  className="w-full px-2 py-1 text-sm bg-white/50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-black placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-1">Płeć</label>
                <select
                  {...register('sex')}
                  className="w-full px-2 py-1 text-sm bg-white/50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                >
                  <option value="">Wybierz</option>
                  <option value="male">Samiec</option>
                  <option value="female">Samica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-1">Kolor oczu</label>
                <select
                  {...register('eyeColor')}
                  className="w-full px-2 py-1 text-sm bg-white/50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                >
                  <option value="">Wybierz</option>
                  <option value="yellow">Żółte</option>
                  <option value="red">Czerwone</option>
                  <option value="glass">Szklane</option>
                  <option value="mixed">Mieszane</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Kolor upierzenia
                </label>
                <select
                  {...register('featherColor')}
                  className="w-full px-2 py-1 text-sm bg-white/50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                >
                  <option value="">Wybierz</option>
                  <option value="speckled">Nakrapiany</option>
                  <option value="blue">Niebieski</option>
                  <option value="blue_white_flight">Niebieski białolot</option>
                  <option value="speckled_white_flight">Nakrapiany białolot</option>
                  <option value="red">Czerwony</option>
                  <option value="dun">Płowy</option>
                  <option value="dark">Ciemny</option>
                  <option value="mottled">Pstry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Czas trwania aukcji
                </label>
                <select
                  {...register('duration', { valueAsNumber: true })}
                  className="w-full px-2 py-1 text-sm bg-white/50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                >
                  <option value={1}>1 dzień</option>
                  <option value={3}>3 dni</option>
                  <option value={7}>7 dni</option>
                  <option value={14}>14 dni</option>
                  <option value={30}>30 dni</option>
                </select>
              </div>
            </div>

            {/* Przeznaczenie */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-black mb-1">Przeznaczenie</label>
              <div className="grid grid-cols-3 gap-1">
                {['Krótki dystans', 'Średni dystans', 'Długi dystans'].map(purpose => (
                  <label key={purpose} className="flex items-center space-x-1 text-black text-xs">
                    <input
                      type="checkbox"
                      value={purpose}
                      {...register('purpose')}
                      className="rounded border-gray-300 bg-white/50 text-black focus:ring-gray-400"
                    />
                    <span>{purpose}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Cena */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <input
                type="checkbox"
                checked={hasStartingPrice}
                onChange={e => setHasStartingPrice(e.target.checked)}
                className="text-gray-600 focus:ring-gray-500"
                title="Zaznacz aby włączyć licytację"
              />
              <label className="text-xs font-medium text-black">Cena wywoławcza (zł)</label>
            </div>
            <input
              type="number"
              {...register('startingPrice', { valueAsNumber: true })}
              disabled={!hasStartingPrice}
              className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-black placeholder-gray-500 ${
                !hasStartingPrice ? 'bg-gray-200' : 'bg-white/50'
              }`}
            />
            {errors.startingPrice && (
              <p className="text-red-600 text-xs mt-1">{errors.startingPrice.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-1">
              <input
                type="checkbox"
                checked={hasBuyNowPrice}
                onChange={e => setHasBuyNowPrice(e.target.checked)}
                className="text-gray-600 focus:ring-gray-500"
                title="Zaznacz aby włączyć opcję Kup teraz"
              />
              <label className="text-xs font-medium text-black">Cena Kup teraz (zł)</label>
            </div>
            <input
              type="number"
              {...register('buyNowPrice', { valueAsNumber: true })}
              disabled={!hasBuyNowPrice}
              className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-black placeholder-gray-500 ${
                !hasBuyNowPrice ? 'bg-gray-200' : 'bg-white/50'
              }`}
            />
            {errors.buyNowPrice && (
              <p className="text-red-600 text-xs mt-1">{errors.buyNowPrice.message}</p>
            )}
          </div>
        </div>

        {/* Upload plików */}
        <div className="mb-2">
          <h2 className="text-sm font-medium text-black mb-2">Pliki *</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Lewa kolumna - zdjęcia i filmy */}
            <div>
              <h2 className="text-sm font-medium text-black mb-2">Zdjęcia i filmy *</h2>
              <div className="grid grid-cols-2 gap-2">
                {/* Zdjęcia gołębia */}
                <div
                  {...getPigeonImagesRootProps()}
                  className={`border border-dashed rounded p-2 text-center cursor-pointer transition-colors ${
                    isPigeonImagesDragActive
                      ? 'border-gray-400 bg-white/70'
                      : 'border-gray-300 bg-white/50 hover:border-gray-400 hover:bg-white/60'
                  }`}
                >
                  <input {...getPigeonImagesInputProps()} />
                  <LucideImage className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-xs text-black">Zdjęcia</p>
                  <p className="text-xs text-black/60">({pigeonImages.length}/8)</p>
                </div>

                {/* Filmy */}
                <div
                  {...getVideosRootProps()}
                  className={`border border-dashed rounded p-2 text-center cursor-pointer transition-colors ${
                    isVideosDragActive
                      ? 'border-gray-400 bg-white/70'
                      : 'border-gray-300 bg-white/50 hover:border-gray-400 hover:bg-white/60'
                  }`}
                >
                  <input {...getVideosInputProps()} />
                  <Video className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-xs text-black">Filmy</p>
                  <p className="text-xs text-black/60">({videos.length}/3)</p>
                </div>
              </div>

              {/* Miniaturki zdjęć gołębia */}
              {pigeonImages.length > 0 && (
                <div className="mt-2">
                  <div className="space-y-1">
                    {pigeonImages.map(file => (
                      <div key={file.id} className="relative group flex items-center space-x-2">
                        <div
                          className="w-8 h-8 relative rounded overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openPreview(file.preview)}
                          title="Kliknij aby powiększyć"
                        >
                          <Image
                            src={file.preview}
                            alt="Preview"
                            width={100}
                            height={100}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs text-black truncate flex-1">{file.file.name}</span>
                        <button
                          onClick={() => removePigeonImage(file.id)}
                          className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          title="Usuń"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Prawa kolumna - rodowód */}
            <div>
              <h2 className="text-sm font-medium text-black mb-2">Rodowód *</h2>
              {watchedCategory === 'Pigeon' && (
                <div
                  {...getPedigreeRootProps()}
                  className={`border border-dashed rounded p-2 text-center cursor-pointer transition-colors ${
                    isPedigreeDragActive
                      ? 'border-gray-400 bg-white/70'
                      : 'border-gray-300 bg-white/50 hover:border-gray-400 hover:bg-white/60'
                  }`}
                >
                  <input {...getPedigreeInputProps()} />
                  <FileText className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-xs text-black">Rodowód</p>
                  <p className="text-xs text-black/60">({pedigreeFiles.length}/2)</p>
                </div>
              )}

              {/* Miniaturki rodowodu */}
              {pedigreeFiles.length > 0 && watchedCategory === 'Pigeon' && (
                <div className="mt-2">
                  <div className="space-y-1">
                    {pedigreeFiles.map(file => (
                      <div key={file.id} className="relative group flex items-center space-x-2">
                        <div
                          className={`w-8 h-8 relative rounded overflow-hidden bg-gray-100 flex-shrink-0 ${file.type === 'image' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                          onClick={
                            file.type === 'image' ? () => openPreview(file.preview) : undefined
                          }
                          title={file.type === 'image' ? 'Kliknij aby powiększyć' : undefined}
                        >
                          {file.type === 'image' ? (
                            <Image
                              src={file.preview}
                              alt="Preview"
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-500 text-xs">PDF</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-black truncate flex-1">{file.file.name}</span>
                        <button
                          onClick={() => removePedigreeFile(file.id)}
                          className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          title="Usuń"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Podgląd plików */}
          {videos.length > 0 && (
            <div className="mt-3 space-y-2">
              {videos.length > 0 && (
                <div>
                  <p className="text-xs text-black/60 mb-1">Filmy:</p>
                  <div className="space-y-1">
                    {videos.map(file => (
                      <div key={file.id} className="relative group flex items-center space-x-2">
                        <div className="w-8 h-8 relative rounded overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Video className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-xs text-black truncate flex-1">{file.file.name}</span>
                        <button
                          onClick={() => removeVideo(file.id)}
                          className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          title="Usuń"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="flex justify-end mt-8 pt-6 border-t border-white/20">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
          >
            {isSubmitting ? 'Publikuję...' : 'Opublikuj aukcję'}
          </button>
        </div>
      </form>

      {/* Modal z podglądem obrazu */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closePreview}
        >
          <div className="relative max-w-4xl max-h-4xl p-4">
            <button
              onClick={closePreview}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-10"
              title="Zamknij"
            >
              <X className="w-4 h-4" />
            </button>
            <Image
              src={previewImage}
              alt="Podgląd"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
