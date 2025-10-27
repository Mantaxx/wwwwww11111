import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authResult = await requireFirebaseAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  const { decodedToken } = authResult;

  try {
    // Sprawdź rolę użytkownika w bazie danych
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: { role: true },
    });

    return NextResponse.json({
      isAdmin: user?.role === 'ADMIN',
    });
  } catch (error) {
    console.error('Błąd sprawdzania statusu administratora:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
