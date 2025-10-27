import { createApiRoute } from '@/lib/api-middleware';
import { AppErrors, handlePrismaError } from '@/lib/error-handling';
import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// Skip database queries during build
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.DOCKER_BUILD === 'true';

async function handler(request: NextRequest) {
  // Sprawdź autoryzację Firebase
  const authResult = await requireFirebaseAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }
  const { decodedToken } = authResult; // Contains uid, email, etc.

  console.log('🔄 Auth sync API called');

  console.log('🔄 Auth sync - decoded token:', {
    uid: decodedToken.uid,
    email: decodedToken.email,
    email_verified: decodedToken.email_verified,
  });

  // Pobierz dane z body requestu
  let requestBody: { firstName?: string; lastName?: string } = {};
  try {
    requestBody = await request.json();
  } catch (e) { /* Ignoruj błąd, jeśli body jest puste */ }

  let user: Partial<User>;

  // Skip database operations during build time
  if (isBuildTime) {
    console.log('🔄 Skipping database operations during build time');
    user = {
      id: 'build-time-user',
      email: decodedToken.email!,
      firstName: requestBody.firstName || decodedToken.name?.split(' ')[0] || '',
      lastName: requestBody.lastName || decodedToken.name?.split(' ').slice(1).join(' ') || '',
      role: 'USER',
      isActive: true,
      isProfileVerified: false,
      isPhoneVerified: false,
      emailVerified: decodedToken.email_verified ? new Date() : null,
    };
  } else {
    try {
      // Użyj `upsert` do atomowego znalezienia lub utworzenia użytkownika.
      // `email` jest unikalnym identyfikatorem, który chcemy sprawdzić.
      user = await prisma.user.upsert({
        where: { email: decodedToken.email! },
        update: {
          // Co zaktualizować, jeśli użytkownik o tym emailu już istnieje.
          // Upewnij się, że ID z Firebase jest powiązane z kontem.
          firebaseUid: decodedToken.uid,
          // Aktualizuj status weryfikacji email, jeśli się zmienił.
          emailVerified: decodedToken.email_verified ? new Date() : null,
          // Opcjonalnie: zaktualizuj imię i nazwisko, jeśli pochodzą z social media.
          firstName: requestBody.firstName || decodedToken.name?.split(' ')[0],
          lastName: requestBody.lastName || decodedToken.name?.split(' ').slice(1).join(' ') || null,
        },
        create: {
          // Co stworzyć, jeśli użytkownik o tym emailu nie istnieje.
          firebaseUid: decodedToken.uid,
          email: decodedToken.email!,
          firstName: requestBody.firstName || decodedToken.name?.split(' ')[0] || '',
          lastName: requestBody.lastName || decodedToken.name?.split(' ').slice(1).join(' ') || '',
          isActive: true,
          role: 'USER',
          emailVerified: decodedToken.email_verified ? new Date() : null,
        },
      });
    } catch (dbError) {
      console.error('🔴 Database operation failed during auth sync:', dbError);
      if (dbError instanceof Error && 'code' in dbError) {
        throw handlePrismaError(dbError);
      }
      throw AppErrors.database('Nie można zsynchronizować użytkownika z bazą danych.');
    }
  }

  // Przygotuj spójny obiekt odpowiedzi, niezależnie od źródła danych (DB czy fallback)
  const responseUser = {
    id: user.id,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    role: user.role,
    isActive: user.isActive,
    isProfileVerified: user.isProfileVerified ?? false,
    isPhoneVerified: user.isPhoneVerified ?? false,
    emailVerified: !!user.emailVerified,
  };

  return NextResponse.json({
    message: 'Synchronizacja zakończona pomyślnie',
    user: responseUser,
  });
}

export const POST = createApiRoute(handler, {
  requireAuth: false, // Auth jest sprawdzane ręcznie wewnątrz
  enableCSRF: false, // Zazwyczaj niepotrzebne dla endpointu sync
  enableRateLimit: true,
  enableSanitization: false,
  enableLogging: true,
});