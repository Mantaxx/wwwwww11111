import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { sendVerificationSms } from '@/lib/phone-verification';
import { prisma } from '@/lib/prisma';
import { smsRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting dla SMS
    const rateLimitResponse = smsRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź autoryzację Firebase
    const authResult = await requireFirebaseAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { decodedToken } = authResult;

    // Pobierz numer telefonu użytkownika
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: { phoneNumber: true },
    });

    if (!user?.phoneNumber) {
      return NextResponse.json({ error: 'Brak numeru telefonu w profilu' }, { status: 400 });
    }

    // Wygeneruj kod weryfikacyjny
    const code = generateVerificationCode();
    const expires = new Date(new Date().getTime() + 10 * 60 * 1000); // 10 minut

    // Zapisz kod w bazie danych
    await prisma.user.update({
      where: { id: decodedToken.uid },
      data: {
        phoneVerificationCode: code,
        phoneVerificationExpires: expires,
      },
    });

    // Wyślij SMS
    const smsResult = await sendVerificationSms(user.phoneNumber, code);

    if (!smsResult.success) {
      return NextResponse.json(
        { error: smsResult.error || 'Nie udało się wysłać SMS' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kod weryfikacyjny został wysłany',
    });
  } catch (error) {
    console.error('Błąd wysyłania SMS:', error);
    return NextResponse.json({ error: 'Wystąpił błąd podczas wysyłania SMS' }, { status: 500 });
  }
}
