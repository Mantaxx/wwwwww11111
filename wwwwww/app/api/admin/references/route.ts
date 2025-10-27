import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Pobierz referencje oczekujące na zatwierdzenie
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź autoryzację
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Brak uprawnień administratora' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'pending'; // pending, approved, all

    const skip = (page - 1) * limit;

    // Buduj warunki filtrowania
    const where: { isApproved?: boolean } = {};
    if (status === 'pending') {
      where.isApproved = false;
    } else if (status === 'approved') {
      where.isApproved = true;
    }
    // status === 'all' - bez filtrowania

    const [references, total] = await Promise.all([
      prisma.reference.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          breederName: true,
          location: true,
          experience: true,
          testimonial: true,
          rating: true,
          achievements: true,
          isApproved: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.reference.count({ where }),
    ]);

    const formattedReferences = references.map(ref => ({
      id: ref.id,
      breederName: ref.breederName,
      location: ref.location,
      experience: ref.experience,
      testimonial: ref.testimonial,
      rating: ref.rating,
      achievements: JSON.parse(ref.achievements || '[]'),
      isApproved: ref.isApproved,
      createdAt: ref.createdAt.toISOString(),
      updatedAt: ref.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      references: formattedReferences,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Błąd podczas pobierania referencji:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania referencji' },
      { status: 500 }
    );
  }
}
