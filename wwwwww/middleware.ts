import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './lib/firebase-admin';

// Trasy wymagające autoryzacji
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/seller',
  '/auctions/create',
  '/profile',
  '/settings',
];

// Trasy wymagające uprawnień administratora
const adminRoutes = ['/admin'];

// Funkcja sprawdzająca czy request jest HTTPS
function isHttps(request: NextRequest): boolean {
  return (
    request.headers.get('x-forwarded-proto') === 'https' ||
    request.headers.get('x-forwarded-protocol') === 'https' ||
    request.url.startsWith('https://')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Wymuszenie HTTPS w produkcji
  if (process.env.NODE_ENV === 'production' && !isHttps(request)) {
    const httpsUrl = `https://${request.headers.get('host')}${pathname}${request.url.split('?')[1] ? '?' + request.url.split('?')[1] : ''}`;
    return NextResponse.redirect(httpsUrl, 301);
  }

  // Sprawdź czy trasa wymaga autoryzacji
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    // Preferuj nagłówek Authorization: Bearer <token>, w przeciwnym razie użyj ciasteczka
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const cookieToken = request.cookies.get('firebase-auth-token')?.value;
    const bearerToken =
      authHeader && authHeader.toLowerCase().startsWith('bearer ')
        ? authHeader.substring(7)
        : undefined;
    const token = bearerToken || cookieToken;

    if (!token) {
      const loginUrl = new URL('/auth/signin', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    // Bezpośrednia weryfikacja tokenu Firebase Admin w middleware (Node.js Runtime)
    let decodedToken;
    try {
      const { getAdminAuth } = await import('./lib/firebase-admin');
      const adminAuth = getAdminAuth();
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      const loginUrl = new URL('/auth/signin', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'InvalidToken');
      return NextResponse.redirect(loginUrl);
    }

    // Sprawdź rolę administratora jeśli wymagana
    if (isAdminRoute) {
      // Załóżmy, że rola jest w custom claims lub sprawdzana przez email
      const isAdmin = decodedToken.admin === true || decodedToken.email === process.env.ADMIN_EMAIL;
      if (!isAdmin) {
        const loginUrl = new URL('/auth/signin', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        loginUrl.searchParams.set('error', 'Forbidden');
        return NextResponse.redirect(loginUrl);
      }
    }

    // ✅ SPRAWDŹ CZY EMAIL JEST ZWERYFIKOWANY
    if (!decodedToken.email_verified) {
      console.log('🔒 Middleware: Email nie zweryfikowany, przekierowuję do signin');
      const loginUrl = new URL('/auth/signin', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('reason', 'email_not_verified');
      return NextResponse.redirect(loginUrl);
    }

    // Weryfikacja OK – przepuść żądanie bez ujawniania tokenu w odpowiedzi
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware authentication error:', error);

    // W przypadku błędu, przekieruj do logowania
    const loginUrl = new URL('/auth/signin', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'AuthenticationError');
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|auth).*)',
  ],
  runtime: 'nodejs', // Użyj Node.js runtime zamiast Edge dla Firebase Admin
};
