import { z } from 'zod';

// Dozwolone typy plików
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/psd',
  'image/bmp',
];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/psd',
  'image/bmp',
];

// Maksymalne rozmiary plików (w bajtach)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// Schemat walidacji pliku
export const fileValidationSchema = z.object({
  name: z.string().min(1, 'Nazwa pliku jest wymagana'),
  type: z.string().min(1, 'Typ pliku jest wymagany'),
  size: z.number().min(1, 'Rozmiar pliku musi być większy od 0'),
});

// Walidacja typu pliku
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

// Walidacja rozmiaru pliku
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

// Walidacja obrazu
export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!validateFileType(file, ALLOWED_IMAGE_TYPES)) {
    return {
      valid: false,
      error: `Nieprawidłowy typ pliku. Dozwolone typy: JPG, JPEG, PNG, WebP, GIF, PSD, BMP`,
    };
  }

  if (!validateFileSize(file, MAX_IMAGE_SIZE)) {
    return {
      valid: false,
      error: `Plik jest za duży. Maksymalny rozmiar: ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

// Walidacja wideo
export function validateVideo(file: File): { valid: boolean; error?: string } {
  if (!validateFileType(file, ALLOWED_VIDEO_TYPES)) {
    return {
      valid: false,
      error: `Nieprawidłowy typ pliku. Dozwolone typy: ${ALLOWED_VIDEO_TYPES.join(', ')}`,
    };
  }

  if (!validateFileSize(file, MAX_VIDEO_SIZE)) {
    return {
      valid: false,
      error: `Plik jest za duży. Maksymalny rozmiar: ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

// Walidacja dokumentu
export function validateDocument(file: File): { valid: boolean; error?: string } {
  if (!validateFileType(file, ALLOWED_DOCUMENT_TYPES)) {
    return {
      valid: false,
      error: `Nieprawidłowy typ pliku. Dozwolone typy: PDF, DOC, DOCX, JPG, JPEG, PNG, WebP, PSD, BMP`,
    };
  }

  if (!validateFileSize(file, MAX_DOCUMENT_SIZE)) {
    return {
      valid: false,
      error: `Plik jest za duży. Maksymalny rozmiar: ${MAX_DOCUMENT_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

// Generuj bezpieczną nazwę pliku
export function generateSafeFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || '';
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');

  return `${baseName}_${timestamp}_${randomString}.${extension}`;
}

// Sprawdź czy plik jest obrazem
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

// Sprawdź czy plik jest wideo
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

// Sprawdź czy plik jest dokumentem
export function isDocumentFile(file: File): boolean {
  return (
    file.type === 'application/pdf' || file.type.includes('document') || file.type.includes('text')
  );
}
