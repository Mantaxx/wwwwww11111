import {
  generateSafeFileName,
  validateDocument,
  validateImage,
  validateVideo,
} from '@/lib/file-validation';
import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { requirePhoneVerification } from '@/lib/phone-verification';
import { apiRateLimit } from '@/lib/rate-limit';
import { mkdir, writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź autoryzację Firebase
    const authResult = await requireFirebaseAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Sprawdź weryfikację telefonu dla uploadu plików
    const phoneVerificationError = await requirePhoneVerification(request);
    if (phoneVerificationError) {
      return phoneVerificationError;
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const type = formData.get('type') as string; // 'image', 'video', 'document'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Brak plików do przesłania' }, { status: 400 });
    }

    if (!type || !['image', 'video', 'document'].includes(type)) {
      return NextResponse.json({ error: 'Nieprawidłowy typ pliku' }, { status: 400 });
    }

    const uploadedFiles: string[] = [];

    for (const file of files) {
      // Walidacja pliku
      let validation;
      switch (type) {
        case 'image':
          validation = validateImage(file);
          break;
        case 'video':
          validation = validateVideo(file);
          break;
        case 'document':
          validation = validateDocument(file);
          break;
        default:
          return NextResponse.json({ error: 'Nieprawidłowy typ pliku' }, { status: 400 });
      }

      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Generuj bezpieczną nazwę pliku
      const safeFileName = generateSafeFileName(file.name);
      const uploadDir = join(process.cwd(), 'public', 'uploads', type);
      const filePath = join(uploadDir, safeFileName);

      try {
        // Utwórz katalog jeśli nie istnieje
        await mkdir(uploadDir, { recursive: true });

        // Zapisz plik
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Dodaj URL do listy
        uploadedFiles.push(`/uploads/${type}/${safeFileName}`);
      } catch (error) {
        console.error('Błąd podczas zapisywania pliku:', error);
        return NextResponse.json({ error: 'Błąd podczas zapisywania pliku' }, { status: 500 });
      }
    }

    return NextResponse.json({
      message: 'Pliki zostały przesłane pomyślnie',
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Błąd podczas uploadu plików:', error);
    return NextResponse.json({ error: 'Wystąpił błąd podczas uploadu plików' }, { status: 500 });
  }
}
