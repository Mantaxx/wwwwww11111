import { auth } from '@/lib/firebase';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  password: z.string().min(8, 'Hasło musi mieć minimum 8 znaków'),
  firstName: z.string().min(2, 'Imię musi mieć minimum 2 znaki'),
  lastName: z.string().min(2, 'Nazwisko musi mieć minimum 2 znaki'),
  phoneNumber: z.string().regex(/^\+48\d{9}$/, 'Nieprawidłowy format numeru telefonu'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting dla rejestracji
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Użytkownik z tym emailem już istnieje' }, { status: 400 });
    }

    // Sprawdź czy numer telefonu już istnieje
    const existingPhone = await prisma.user.findFirst({
      where: { phoneNumber: validatedData.phoneNumber },
    });

    if (existingPhone) {
      return NextResponse.json(
        { error: 'Użytkownik z tym numerem telefonu już istnieje' },
        { status: 400 }
      );
    }

    // Utwórz użytkownika w Firebase
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      validatedData.email,
      validatedData.password
    );

    const firebaseUser = userCredential.user;

    // Wyślij email weryfikacyjny
    await sendEmailVerification(firebaseUser);

    // Utwórz użytkownika w bazie danych
    const user = await prisma.user.create({
      data: {
        id: firebaseUser.uid,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phoneNumber: validatedData.phoneNumber,
        isActive: false, // Nieaktywny do weryfikacji email
        role: 'USER',
      },
    });

    return NextResponse.json(
      {
        message: 'Rejestracja zakończona pomyślnie. Sprawdź email w celu weryfikacji.',
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    if ((error as { code?: string }).code === 'auth/email-already-in-use') {
      return NextResponse.json({ error: 'Użytkownik z tym emailem już istnieje' }, { status: 400 });
    }

    if ((error as { code?: string }).code === 'auth/weak-password') {
      return NextResponse.json({ error: 'Hasło jest zbyt słabe' }, { status: 400 });
    }

    console.error('Błąd rejestracji:', error);
    return NextResponse.json({ error: 'Wystąpił błąd podczas rejestracji' }, { status: 500 });
  }
}
