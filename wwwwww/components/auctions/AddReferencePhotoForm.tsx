'use client';

import { SmartImage } from '@/components/ui/SmartImage';
import { useAuth } from '@/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const addPhotoSchema = z.object({
  description: z.string().min(10, 'Opis musi mieć co najmniej 10 znaków.'),
  photo: z.any().refine(file => file?.length > 0, 'Zdjęcie jest wymagane.'),
});

type AddPhotoFormData = z.infer<typeof addPhotoSchema>;

interface MediaFile {
  file: File;
  preview: string;
}

export function AddReferencePhotoForm() {
  const { user } = useAuth();
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddPhotoFormData>({
    resolver: zodResolver(addPhotoSchema),
  });

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setMediaFile({
        file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    multiple: false,
  });

  const removeMediaFile = () => {
    if (mediaFile) {
      URL.revokeObjectURL(mediaFile.preview);
    }
    setMediaFile(null);
  };

  const onSubmit = async (data: AddPhotoFormData) => {
    if (!user?.phoneNumber) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('description', data.description);
      if (mediaFile?.file) {
        formData.append('file', mediaFile.file);
      }

      const response = await fetch('/api/references/photos', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        reset();
        removeMediaFile();
        // Tutaj można dodać powiadomienie o sukcesie
      } else {
        throw new Error('Błąd podczas przesyłania zdjęcia');
      }
    } catch (error) {
      console.error('Błąd:', error);
      // Tutaj można dodać powiadomienie o błędzie
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-yellow-50/10 border-l-4 border-yellow-400 p-4 rounded-md text-white">
        <div className="flex">
          <div className="flex-shrink-0">
            <ShieldAlert className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-200">
              {!user
                ? 'Musisz być zalogowany, aby dodać zdjęcie.'
                : 'Wymagana jest weryfikacja numeru telefonu.'}
              <Link
                href={!user ? '/auth/signin' : '/dashboard?tab=profile'}
                className="font-medium underline text-yellow-300 hover:text-yellow-400 ml-2"
              >
                {!user ? 'Zaloguj się' : 'Zweryfikuj numer'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/30 hover:border-white/50'}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-white/50 mx-auto mb-4" />
        <p className="text-lg font-medium text-white mb-2">
          {isDragActive ? 'Upuść zdjęcie tutaj' : 'Przeciągnij zdjęcie lub kliknij, aby wybrać'}
        </p>
        <p className="text-sm text-white/60">JPG, PNG, WebP (max 1 plik)</p>
      </div>

      {mediaFile && (
        <div className="relative w-32 h-32 group">
          <SmartImage
            src={mediaFile.preview}
            alt="Podgląd"
            width={150}
            height={150}
            fitMode="contain"
            aspectRatio="square"
            className="rounded-lg"
          />
          <button
            onClick={removeMediaFile}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Usuń plik"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errors.photo && <p className="text-red-400 text-sm">{errors.photo.message as string}</p>}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-2">
          Krótki opis
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          placeholder="Opisz swoje spotkanie lub podziel się opinią..."
        ></textarea>
        {errors.description && (
          <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-cyan-600 text-white py-3 px-4 rounded-md font-medium hover:bg-cyan-700 disabled:bg-gray-500 transition-colors"
      >
        {isSubmitting ? 'Wysyłanie...' : 'Wyślij zdjęcie i opinię'}
      </button>
    </form>
  );
}
