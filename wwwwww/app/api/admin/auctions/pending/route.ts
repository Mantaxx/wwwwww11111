import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Pobierz oczekujące aukcje
    const [auctions, total] = await Promise.all([
      prisma.auction.findMany({
        where: {
          status: 'PENDING',
          isApproved: false,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          startingPrice: true,
          currentPrice: true,
          buyNowPrice: true,
          reservePrice: true,
          startTime: true,
          endTime: true,
          status: true,
          isApproved: true,
          createdAt: true,
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assets: {
            select: {
              id: true,
              type: true,
              url: true,
            },
          },
        },
      }),
      prisma.auction.count({
        where: {
          status: 'PENDING',
          isApproved: false,
        },
      }),
    ]);

    return NextResponse.json({
      auctions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Błąd podczas pobierania oczekujących aukcji:', error);
    return NextResponse.json({ error: 'Wystąpił błąd podczas pobierania aukcji' }, { status: 500 });
  }
}
