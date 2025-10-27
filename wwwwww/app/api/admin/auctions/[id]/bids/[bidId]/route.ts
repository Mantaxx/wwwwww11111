import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bidId: string }> }
) {
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

    const { id: auctionId, bidId } = await params;
    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Nieprawidłowa kwota licytacji' }, { status: 400 });
    }

    // Sprawdź czy aukcja i licytacja istnieją
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      select: { id: true, status: true, currentPrice: true },
    });

    if (!auction) {
      return NextResponse.json({ error: 'Aukcja nie została znaleziona' }, { status: 404 });
    }

    const bid = await prisma.bid.findUnique({
      where: { id: bidId, auctionId },
      select: { id: true, amount: true, bidderId: true },
    });

    if (!bid) {
      return NextResponse.json({ error: 'Licytacja nie została znaleziona' }, { status: 404 });
    }

    // Aktualizuj licytację
    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: { amount },
    });

    // Sprawdź czy to była najwyższa oferta i zaktualizuj cenę aukcji
    const highestBid = await prisma.bid.findFirst({
      where: { auctionId },
      orderBy: { amount: 'desc' },
      select: { amount: true },
    });

    if (highestBid) {
      await prisma.auction.update({
        where: { id: auctionId },
        data: { currentPrice: highestBid.amount },
      });
    }

    return NextResponse.json({
      success: true,
      bid: updatedBid,
      message: 'Licytacja została zaktualizowana',
    });
  } catch (error) {
    console.error('Błąd podczas aktualizacji licytacji:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas aktualizacji licytacji' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bidId: string }> }
) {
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

    const { id: auctionId, bidId } = await params;

    // Sprawdź czy aukcja i licytacja istnieją
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      select: { id: true, status: true },
    });

    if (!auction) {
      return NextResponse.json({ error: 'Aukcja nie została znaleziona' }, { status: 404 });
    }

    const bid = await prisma.bid.findUnique({
      where: { id: bidId, auctionId },
      select: { id: true, amount: true },
    });

    if (!bid) {
      return NextResponse.json({ error: 'Licytacja nie została znaleziona' }, { status: 404 });
    }

    // Usuń licytację
    await prisma.bid.delete({
      where: { id: bidId },
    });

    // Zaktualizuj cenę aukcji na podstawie pozostałych licytacji
    const highestBid = await prisma.bid.findFirst({
      where: { auctionId },
      orderBy: { amount: 'desc' },
      select: { amount: true },
    });

    const newCurrentPrice = highestBid ? highestBid.amount : 0;

    await prisma.auction.update({
      where: { id: auctionId },
      data: { currentPrice: newCurrentPrice },
    });

    return NextResponse.json({
      success: true,
      message: 'Licytacja została usunięta',
      newCurrentPrice,
    });
  } catch (error) {
    console.error('Błąd podczas usuwania licytacji:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas usuwania licytacji' },
      { status: 500 }
    );
  }
}
