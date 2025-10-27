import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

    // Pobierz dane z body
    const body = await request.json();
    const { firstName, lastName, address, city, postalCode, phoneNumber } = body;

    // Walidacja wymaganych pól
    if (!firstName?.trim() || !lastName?.trim() || !address?.trim()) {
      return NextResponse.json({ error: 'Imię, nazwisko i adres są wymagane' }, { status: 400 });
    }

    // Aktualizuj profil użytkownika
    const updatedUser = await prisma.user.update({
      where: { id: decodedToken.uid },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: address.trim(),
        city: city?.trim() || null,
        postalCode: postalCode?.trim() || null,
        phoneNumber: phoneNumber?.trim() || null,
        isProfileVerified: true, // Oznacz profil jako zweryfikowany po uzupełnieniu
      },
    });

    return NextResponse.json({
      message: 'Profil został uzupełniony pomyślnie',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        address: updatedUser.address,
        city: updatedUser.city,
        postalCode: updatedUser.postalCode,
        phoneNumber: updatedUser.phoneNumber,
        isProfileVerified: updatedUser.isProfileVerified,
        isPhoneVerified: updatedUser.isPhoneVerified,
      },
    });
  } catch (error) {
    console.error('Błąd uzupełniania profilu:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas aktualizacji profilu' },
      { status: 500 }
    );
  }
}
