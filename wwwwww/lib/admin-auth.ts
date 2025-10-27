import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from './firebase-admin';
import { prisma } from './prisma';

/**
 * Sprawdza czy użytkownik ma uprawnienia administratora
 * @param request NextRequest object
 * @returns DecodedIdToken z rolą administratora lub Response z błędem
 */
export async function requireAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);

    // Sprawdź rolę użytkownika w bazie danych
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: { role: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie został znaleziony' }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Konto jest nieaktywne' }, { status: 403 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Brak uprawnień administratora' }, { status: 403 });
    }

    return { decodedToken, user };
  } catch (error) {
    console.error('Błąd weryfikacji tokenu Firebase:', error);
    return NextResponse.json(
      { error: 'Nieprawidłowy lub wygasły token autoryzacji' },
      { status: 401 }
    );
  }
}

/**
 * Sprawdza czy użytkownik ma uprawnienia administratora lub jest właścicielem zasobu
 * @param request NextRequest object
 * @param resourceOwnerId ID właściciela zasobu (opcjonalne)
 * @returns DecodedIdToken z rolą administratora lub Response z błędem
 */
export async function requireAdminOrOwnerAuth(request: NextRequest, resourceOwnerId?: string) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);

    // Sprawdź rolę użytkownika w bazie danych
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: { role: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie został znaleziony' }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Konto jest nieaktywne' }, { status: 403 });
    }

    // Jeśli użytkownik jest administratorem, pozwól na dostęp
    if (user.role === 'ADMIN') {
      return { decodedToken, user, isAdmin: true };
    }

    // Jeśli podano resourceOwnerId, sprawdź czy użytkownik jest właścicielem
    if (resourceOwnerId && decodedToken.uid === resourceOwnerId) {
      return { decodedToken, user, isAdmin: false };
    }

    return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
  } catch (error) {
    console.error('Błąd weryfikacji tokenu Firebase:', error);
    return NextResponse.json(
      { error: 'Nieprawidłowy lub wygasły token autoryzacji' },
      { status: 401 }
    );
  }
}
