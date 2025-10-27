import { NextRequest, NextResponse } from 'next/server';
import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';

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

    const { code } = await request.json();

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json({ error: 'Nieprawidłowy format kodu.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: { phoneVerificationCode: true, phoneVerificationExpires: true },
    });

    if (!user || !user.phoneVerificationCode || !user.phoneVerificationExpires) {
      return NextResponse.json(
        { error: 'Nie znaleziono kodu weryfikacyjnego. Spróbuj wysłać go ponownie.' },
        { status: 400 }
      );
    }

    if (new Date() > user.phoneVerificationExpires) {
      return NextResponse.json({ error: 'Kod weryfikacyjny wygasł.' }, { status: 400 });
    }

    if (user.phoneVerificationCode !== code) {
      return NextResponse.json({ error: 'Nieprawidłowy kod weryfikacyjny.' }, { status: 400 });
    }

    // If code is correct, update the user's profile
    await prisma.user.update({
      where: { id: decodedToken.uid },
      data: {
        isPhoneVerified: true,
        phoneVerificationCode: null, // Clear the code after successful verification
        phoneVerificationExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Numer telefonu został pomyślnie zweryfikowany.',
    });
  } catch (error) {
    console.error('Error in check-verification endpoint:', error);
    return NextResponse.json({ error: 'Wystąpił wewnętrzny błąd serwera.' }, { status: 500 });
  }
}
