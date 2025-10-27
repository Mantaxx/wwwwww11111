import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź autoryzację - tylko admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    const { id: auctionId } = await params;
    const body = await request.json();
    const { title, currentPrice, endTime, status } = body;

    // Sprawdź czy aukcja istnieje
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      select: { id: true, title: true, currentPrice: true, endTime: true, status: true },
    });

    if (!auction) {
      return NextResponse.json({ error: 'Aukcja nie została znaleziona' }, { status: 404 });
    }

    // Przygotuj dane do aktualizacji
    const updateData: {
      title?: string;
      currentPrice?: number;
      endTime?: Date;
      status?: 'ACTIVE' | 'ENDED' | 'CANCELLED' | 'PENDING';
    } = {};

    if (title !== undefined && title.trim().length > 0) {
      updateData.title = title.trim();
    }

    if (currentPrice !== undefined && currentPrice >= 0) {
      updateData.currentPrice = parseFloat(currentPrice);
    }

    if (endTime !== undefined) {
      const newEndTime = new Date(endTime);
      if (!isNaN(newEndTime.getTime())) {
        updateData.endTime = newEndTime;
      }
    }

    if (status !== undefined && ['PENDING', 'ACTIVE', 'ENDED', 'CANCELLED'].includes(status)) {
      updateData.status = status as 'ACTIVE' | 'ENDED' | 'CANCELLED' | 'PENDING';
    }

    // Aktualizuj aukcję
    const updatedAuction = await prisma.auction.update({
      where: { id: auctionId },
      data: updateData,
      select: {
        id: true,
        title: true,
        currentPrice: true,
        endTime: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      auction: updatedAuction,
      message: 'Aukcja została zaktualizowana',
    });
  } catch (error) {
    console.error('Błąd podczas aktualizacji aukcji:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas aktualizacji aukcji' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź autoryzację - tylko admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    const { id: auctionId } = await params;

    // Sprawdź czy aukcja istnieje
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      select: { id: true, title: true },
    });

    if (!auction) {
      return NextResponse.json({ error: 'Aukcja nie została znaleziona' }, { status: 404 });
    }

    // Usuń aukcję (kaskadowo usuną się powiązane dane)
    await prisma.auction.delete({
      where: { id: auctionId },
    });

    return NextResponse.json({
      success: true,
      message: `Aukcja "${auction.title}" została usunięta`,
    });
  } catch (error) {
    console.error('Błąd podczas usuwania aukcji:', error);
    return NextResponse.json({ error: 'Wystąpił błąd podczas usuwania aukcji' }, { status: 500 });
  }
}
