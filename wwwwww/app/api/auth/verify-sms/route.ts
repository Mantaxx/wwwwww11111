import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const verifySmsSchema = z.object({
  code: z.string().length(6, 'Kod musi mieć 6 cyfr'),
});

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
    const { decodedToken } = authResult;

    const body = await request.json();
    const { code } = verifySmsSchema.parse(body);

    // Pobierz dane użytkownika
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: {
        phoneVerificationCode: true,
        phoneVerificationExpires: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie został znaleziony' }, { status: 404 });
    }

    if (!user.phoneVerificationCode || !user.phoneVerificationExpires) {
      return NextResponse.json({ error: 'Brak aktywnego kodu weryfikacyjnego' }, { status: 400 });
    }

    // Sprawdź czy kod nie wygasł
    if (new Date() > user.phoneVerificationExpires) {
      return NextResponse.json({ error: 'Kod weryfikacyjny wygasł' }, { status: 400 });
    }

    // Sprawdź kod
    if (user.phoneVerificationCode !== code) {
      return NextResponse.json({ error: 'Nieprawidłowy kod weryfikacyjny' }, { status: 400 });
    }

    // Zweryfikuj telefon
    await prisma.user.update({
      where: { id: decodedToken.uid },
      data: {
        isPhoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Numer telefonu został zweryfikowany pomyślnie',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    console.error('Błąd weryfikacji SMS:', error);
    return NextResponse.json({ error: 'Wystąpił błąd podczas weryfikacji SMS' }, { status: 500 });
  }
}
