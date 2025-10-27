import { requirePhoneVerification } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź weryfikację telefonu
    const phoneVerificationError = await requirePhoneVerification(request);
    if (phoneVerificationError) {
      return phoneVerificationError;
    }

    const { auctionId, amount } = await request.json();

    if (!auctionId || !amount) {
      return NextResponse.json({ error: 'Auction ID i kwota są wymagane' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Kwota musi być większa od 0' }, { status: 400 });
    }

    // Sprawdź czy aukcja istnieje i jest aktywna
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: { bids: { orderBy: { amount: 'desc' } } },
    });

    if (!auction) {
      return NextResponse.json({ error: 'Aukcja nie została znaleziona' }, { status: 404 });
    }

    if (auction.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Aukcja nie jest aktywna' }, { status: 400 });
    }

    if (new Date() > auction.endTime) {
      return NextResponse.json({ error: 'Aukcja się zakończyła' }, { status: 400 });
    }

    // Sprawdź czy kwota jest wyższa od aktualnej ceny
    if (amount <= auction.currentPrice) {
      return NextResponse.json(
        { error: 'Kwota musi być wyższa od aktualnej ceny' },
        { status: 400 }
      );
    }

    // Sprawdź czy kwota jest wyższa od najwyższej oferty
    const highestBid = auction.bids[0];
    if (highestBid && amount <= highestBid.amount) {
      return NextResponse.json(
        { error: 'Kwota musi być wyższa od najwyższej oferty' },
        { status: 400 }
      );
    }

    // Pobierz ID użytkownika z tokenu Firebase
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);
    if (!token) {
      return NextResponse.json({ error: 'Brak tokenu autoryzacji' }, { status: 401 });
    }

    // Weryfikuj token i pobierz UID
    const { getAdminAuth } = await import('@/lib/firebase-admin');
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token);
    const bidderId = decodedToken.uid;

    // Użyj transakcji, aby zapewnić atomowość operacji
    const [bid] = await prisma.$transaction([
      // 1. Utwórz nową ofertę
      prisma.bid.create({
        data: {
          auctionId,
          bidderId,
          amount,
          isWinning: true,
        },
      }),
      // 2. Zaktualizuj poprzednie oferty jako nie wygrywające
      prisma.bid.updateMany({
        where: {
          auctionId,
        },
        data: { isWinning: false },
      }),
      // 3. Zaktualizuj aktualną cenę aukcji
      prisma.auction.update({
        where: { id: auctionId },
        data: { currentPrice: amount },
      }),
    ]);

    return NextResponse.json({
      success: true,
      bid,
      message: 'Oferta została złożona pomyślnie',
    });
  } catch (error) {
    console.error('Błąd składania oferty:', error);
    return NextResponse.json({ error: 'Wystąpił błąd podczas składania oferty' }, { status: 500 });
  }
}
