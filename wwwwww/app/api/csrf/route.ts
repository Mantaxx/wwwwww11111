import { generateCSRFToken, setCSRFCookie } from '@/lib/csrf';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const token = generateCSRFToken();
    const response = NextResponse.json({ csrfToken: token });

    await setCSRFCookie(response, token);

    return response;
  } catch (error) {
    console.error('Błąd podczas generowania CSRF token:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas generowania CSRF token' },
      { status: 500 }
    );
  }
}
