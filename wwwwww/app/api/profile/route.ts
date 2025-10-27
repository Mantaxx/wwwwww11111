import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Imię musi mieć co najmniej 2 znaki')
    .max(50, 'Imię nie może być dłuższe niż 50 znaków'),
  lastName: z
    .string()
    .min(2, 'Nazwisko musi mieć co najmniej 2 znaki')
    .max(50, 'Nazwisko nie może być dłuższe niż 50 znaków'),
  address: z
    .string()
    .min(5, 'Adres musi mieć co najmniej 5 znaków')
    .max(100, 'Adres nie może być dłuższy niż 100 znaków'),
  city: z
    .string()
    .min(2, 'Miasto musi mieć co najmniej 2 znaki')
    .max(50, 'Miasto nie może być dłuższe niż 50 znaków'),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/, 'Kod pocztowy musi być w formacie XX-XXX'),
  phoneNumber: z.string().regex(/^\+48\d{9}$/, 'Numer telefonu musi być w formacie +48XXXXXXXXX'),
});

// GET - Pobierz dane profilu użytkownika
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź autoryzację Firebase
    const authResult = await requireFirebaseAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { decodedToken } = authResult;

    // Pobierz dane użytkownika
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        address: true,
        city: true,
        postalCode: true,
        phoneNumber: true,
        isPhoneVerified: true,
        isProfileVerified: true,
        isActive: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie został znaleziony' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Błąd podczas pobierania profilu:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania profilu' },
      { status: 500 }
    );
  }
}

// PATCH - Aktualizuj dane profilu użytkownika
export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź autoryzację Firebase
    const authResult = await requireFirebaseAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { decodedToken } = authResult;

    // Parsuj i waliduj dane
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Sprawdź czy użytkownik istnieje
    const existingUser = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Użytkownik nie został znaleziony' }, { status: 404 });
    }

    // Jeśli numer telefonu się zmienił, resetuj weryfikację
    const phoneChanged = existingUser.phoneNumber !== validatedData.phoneNumber;

    // Sprawdź czy profil jest kompletny (wszystkie wymagane pola uzupełnione)
    const isProfileComplete =
      validatedData.firstName &&
      validatedData.lastName &&
      validatedData.address &&
      validatedData.city &&
      validatedData.postalCode &&
      validatedData.phoneNumber;

    const updateData: {
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      postalCode: string;
      phoneNumber: string;
      isPhoneVerified?: boolean;
      phoneVerificationCode?: null;
      phoneVerificationExpires?: null;
      isProfileVerified?: boolean;
    } = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      address: validatedData.address,
      city: validatedData.city,
      postalCode: validatedData.postalCode,
      phoneNumber: validatedData.phoneNumber,
    };

    if (phoneChanged) {
      updateData.isPhoneVerified = false;
      updateData.phoneVerificationCode = null;
      updateData.phoneVerificationExpires = null;
    }

    // Administratorzy są automatycznie w pełni zweryfikowani
    if (existingUser.role === 'ADMIN') {
      updateData.isProfileVerified = true;
      updateData.isPhoneVerified = true;
    } else if (isProfileComplete) {
      updateData.isProfileVerified = true;
    }

    // Aktualizuj profil użytkownika
    const updatedUser = await prisma.user.update({
      where: { id: decodedToken.uid },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        address: true,
        city: true,
        postalCode: true,
        phoneNumber: true,
        isPhoneVerified: true,
        isProfileVerified: true,
        isActive: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: 'Profil został zaktualizowany pomyślnie',
      user: {
        ...updatedUser,
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
      phoneVerificationReset: phoneChanged,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Błędne dane',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Błąd podczas aktualizacji profilu:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas aktualizacji profilu' },
      { status: 500 }
    );
  }
}
