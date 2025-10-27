import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-middleware';
import { prisma } from '@/lib/prisma';
import { getAdminAuth } from '@/lib/firebase-admin';

async function handler(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();

    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const decoded = await adminAuth.verifyIdToken(idToken);

    const requireAdmin = request.nextUrl.searchParams.get('requireAdmin') === '1';
    if (requireAdmin) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.uid },
        select: { role: true, isActive: true },
      });
      if (!user) {
        return NextResponse.json({ error: 'Użytkownik nie został znaleziony' }, { status: 404 });
      }
      if (!user.isActive) {
        return NextResponse.json({ error: 'Konto jest nieaktywne' }, { status: 403 });
      }
      if (user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Brak uprawnień administratora' }, { status: 403 });
      }
    }

    return NextResponse.json({ ok: true, uid: decoded.uid });
  } catch (error) {
    const err = error as { errorInfo?: { code?: string }; code?: string };
    const code = err?.errorInfo?.code || err?.code;
    if (code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Nieprawidłowy token' }, { status: 401 });
  }
}

export const POST = createApiRoute(handler, 'public');
