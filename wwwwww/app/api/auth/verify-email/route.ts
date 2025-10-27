import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { getAdminAuth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'Brak tokenu weryfikacji' }, { status: 400 });
    }

    // Weryfikuj token Firebase
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken.email_verified) {
      return NextResponse.json({ error: 'Email nie został zweryfikowany' }, { status: 400 });
    }

    // Aktywuj użytkownika w bazie danych
    const user = await prisma.user.update({
      where: { id: decodedToken.uid },
      data: {
        isActive: true,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Email został zweryfikowany pomyślnie',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Błąd weryfikacji email:', error);
    return NextResponse.json({ error: 'Wystąpił błąd podczas weryfikacji email' }, { status: 500 });
  }
}
