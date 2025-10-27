import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź autoryzację - tylko admin
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      !(session.user as { id: string; role: string })?.id ||
      (session.user as { id: string; role: string }).role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    const { id } = await params;

    // Sprawdź czy aukcja istnieje i jest aktywna
    const auction = await prisma.auction.findUnique({
      where: { id },
      select: { id: true, status: true, isApproved: true },
    });

    if (!auction) {
      return NextResponse.json({ error: 'Aukcja nie została znaleziona' }, { status: 404 });
    }

    // Pobierz wszystkie oferty dla tej aukcji wraz z danymi licytujących
    const bids = await prisma.bid.findMany({
      where: {
        auctionId: id,
      },
      orderBy: {
        amount: 'desc',
      },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        bidder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
            // Dodatkowe statystyki licytującego
            bids: {
              select: {
                id: true,
                amount: true,
              },
            },
          },
        },
      },
    });

    // Przetwórz dane licytujących z dodatkowymi statystykami
    const biddersWithStats = bids.map(bid => ({
      id: bid.bidder.id,
      firstName: bid.bidder.firstName,
      lastName: bid.bidder.lastName,
      email: bid.bidder.email,
      amount: bid.amount,
      createdAt: bid.createdAt,
      memberSince: bid.bidder.createdAt,
      totalBids: bid.bidder.bids.length,
      // Można dodać więcej statystyk w przyszłości
      rating: null, // Placeholder dla systemu ocen
    }));

    // Usuń duplikaty licytujących (jeden użytkownik może mieć wiele ofert)
    const uniqueBidders = biddersWithStats.reduce(
      (acc: typeof biddersWithStats, current: (typeof biddersWithStats)[0]) => {
        const existing = acc.find(bidder => bidder.id === current.id);
        if (!existing) {
          acc.push(current);
        } else if (current.amount > existing.amount) {
          // Zachowaj najwyższą ofertę tego użytkownika
          const index = acc.findIndex(bidder => bidder.id === current.id);
          acc[index] = current;
        }
        return acc;
      },
      [] as typeof biddersWithStats
    );

    // Posortuj według wysokości oferty
    uniqueBidders.sort(
      (a: (typeof biddersWithStats)[0], b: (typeof biddersWithStats)[0]) => b.amount - a.amount
    );

    return NextResponse.json({
      bidders: uniqueBidders,
      total: uniqueBidders.length,
      auctionId: id,
      auctionStatus: auction.status,
    });
  } catch (error) {
    console.error('Błąd podczas pobierania licytujących:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania danych licytujących' },
      { status: 500 }
    );
  }
}
