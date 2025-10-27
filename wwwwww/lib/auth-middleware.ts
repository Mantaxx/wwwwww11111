import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware sprawdzające czy użytkownik ma zweryfikowany telefon
 * Wymagane dla funkcji takich jak: tworzenie aukcji, licytowanie, dodawanie spotkań
 */
export async function requirePhoneVerification(request: NextRequest) {
  const authResult = await requireFirebaseAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { decodedToken } = authResult;

  try {
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: {
        isPhoneVerified: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie został znaleziony' }, { status: 404 });
    }

    if (!user.isPhoneVerified) {
      return NextResponse.json(
        {
          error: 'Weryfikacja numeru telefonu jest wymagana',
          requiresPhoneVerification: true,
          phoneNumber: user.phoneNumber,
          userProfile: {
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
        { status: 403 }
      );
    }

    return null; // Brak błędu - użytkownik jest zweryfikowany
  } catch (error) {
    console.error('Błąd sprawdzania weryfikacji telefonu:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas sprawdzania weryfikacji' },
      { status: 500 }
    );
  }
}

/**
 * Middleware sprawdzające czy użytkownik ma kompletny profil
 * Wymagane dla wszystkich funkcji platformy
 */
export async function requireCompleteProfile(request: NextRequest) {
  const authResult = await requireFirebaseAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { decodedToken } = authResult;

  try {
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: {
        firstName: true,
        lastName: true,
        address: true,
        city: true,
        postalCode: true,
        phoneNumber: true,
        isProfileVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie został znaleziony' }, { status: 404 });
    }

    // Sprawdź czy profil jest kompletny
    const isProfileComplete = !!(
      user.firstName &&
      user.lastName &&
      user.address &&
      user.city &&
      user.postalCode &&
      user.phoneNumber
    );

    if (!isProfileComplete) {
      return NextResponse.json(
        {
          error: 'Profil użytkownika jest niekompletny',
          requiresProfileCompletion: true,
          missingFields: {
            firstName: !user.firstName,
            lastName: !user.lastName,
            address: !user.address,
            city: !user.city,
            postalCode: !user.postalCode,
            phoneNumber: !user.phoneNumber,
          },
        },
        { status: 403 }
      );
    }

    return null; // Brak błędu - profil jest kompletny
  } catch (error) {
    console.error('Błąd sprawdzania kompletności profilu:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas sprawdzania profilu' },
      { status: 500 }
    );
  }
}

/**
 * Middleware sprawdzające czy użytkownik ma aktywny email
 * Wymagane dla wszystkich funkcji platformy
 */
export async function requireEmailVerification(request: NextRequest) {
  const authResult = await requireFirebaseAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { decodedToken } = authResult;

  try {
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: {
        emailVerified: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie został znaleziony' }, { status: 404 });
    }

    if (!user.emailVerified || !user.isActive) {
      return NextResponse.json(
        {
          error: 'Email nie jest zweryfikowany lub konto jest nieaktywne',
          requiresEmailVerification: true,
          emailVerified: !!user.emailVerified,
          isActive: user.isActive,
        },
        { status: 403 }
      );
    }

    return null; // Brak błędu - email jest zweryfikowany
  } catch (error) {
    console.error('Błąd sprawdzania weryfikacji email:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas sprawdzania weryfikacji email' },
      { status: 500 }
    );
  }
}

/**
 * Middleware sprawdzające pełną weryfikację użytkownika
 * Kombinuje wszystkie powyższe sprawdzenia
 */
export async function requireFullVerification(request: NextRequest) {
  // Sprawdź weryfikację email
  const emailCheck = await requireEmailVerification(request);
  if (emailCheck) return emailCheck;

  // Sprawdź kompletność profilu
  const profileCheck = await requireCompleteProfile(request);
  if (profileCheck) return profileCheck;

  // Sprawdź weryfikację telefonu
  const phoneCheck = await requirePhoneVerification(request);
  if (phoneCheck) return phoneCheck;

  return null; // Wszystkie sprawdzenia przeszły pomyślnie
}

/**
 * Factory function do tworzenia middleware z różnymi poziomami weryfikacji
 */
export function createVerificationMiddleware(level: 'email' | 'profile' | 'phone' | 'full') {
  switch (level) {
    case 'email':
      return requireEmailVerification;
    case 'profile':
      return requireCompleteProfile;
    case 'phone':
      return requirePhoneVerification;
    case 'full':
      return requireFullVerification;
    default:
      return requireFirebaseAuth;
  }
}
