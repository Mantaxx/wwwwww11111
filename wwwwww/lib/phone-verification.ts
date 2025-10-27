import { NextRequest, NextResponse } from 'next/server';
import { requireFirebaseAuth } from './firebase-auth';
import { prisma } from './prisma';
import { validatePhoneNumber } from './phone-validation';
import { smsService } from './sms-service';

/**
 * Sends a verification SMS to a given phone number.
 * Używa skonfigurowanego providera SMS (Twilio, SMSAPI, lub Firebase Phone Auth)
 * @param phoneNumber The recipient's phone number.
 * @param verificationCode The 6-digit code to send.
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function sendVerificationSms(phoneNumber: string, verificationCode: string) {
  try {
    // Walidacja numeru telefonu
    const validation = validatePhoneNumber(phoneNumber, 'PL');

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'Nieprawidłowy numer telefonu',
      };
    }

    // Użyj skonfigurowanego serwisu SMS
    return await smsService.sendVerificationSMS(validation.formattedNumber, verificationCode);
  } catch (error) {
    console.error('❌ Błąd podczas wysyłania SMS:', error);
    return {
      success: false,
      error: 'Wystąpił błąd podczas wysyłania SMS. Spróbuj ponownie za chwilę.',
    };
  }
}

export async function requirePhoneVerification(request: NextRequest) {
  const authResult = await requireFirebaseAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { decodedToken } = authResult;

  try {
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: { isPhoneVerified: true, phoneNumber: true },
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

export function createPhoneVerificationMiddleware() {
  return async (request: NextRequest) => {
    return await requirePhoneVerification(request);
  };
}
