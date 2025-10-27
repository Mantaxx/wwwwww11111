import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Wymagaj autoryzacji Firebase
    const authResult = await requireFirebaseAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { decodedToken } = authResult;

    const { email, name, picture } = decodedToken;

    // Dzieli 'name' na imię i nazwisko, jeśli istnieje
    const [firstName, ...lastNameParts] = name?.split(' ') || [];
    const lastName = lastNameParts.join(' ');

    // 2. Znajdź lub stwórz użytkownika w bazie danych (upsert)
    const user = await prisma.user.upsert({
      where: { email: email! },
      update: {
        // Aktualizuj tylko jeśli dane z dostawcy są nowsze lub brak danych
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        image: picture || undefined,
      },
      create: {
        id: decodedToken.uid, // Użyj UID z Firebase jako ID w swojej bazie
        email: email!,
        emailVerified: decodedToken.email_verified ? new Date() : null,
        firstName: firstName || '',
        lastName: lastName || '',
        image: picture || null,
        role: 'USER',
        isActive: decodedToken.email_verified || false,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Błąd podczas synchronizacji użytkownika:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera' }, { status: 500 });
  }
}
