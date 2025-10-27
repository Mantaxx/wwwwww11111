import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering

// GET - Pobierz spotkania z hodowcami oczekujące na zatwierdzenie
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

    const [meetings, total] = await Promise.all([
      prisma.breederMeeting.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          date: true,
          images: true,
          isApproved: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.breederMeeting.count({ where }),
    ]);

    const formattedMeetings = meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      location: meeting.location,
      date: meeting.date.toISOString(),
      images: JSON.parse(meeting.images || '[]'),
      isApproved: meeting.isApproved,
      createdAt: meeting.createdAt.toISOString(),
      updatedAt: meeting.updatedAt.toISOString(),
      user: meeting.user,
    }));

    return NextResponse.json({
      meetings: formattedMeetings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Błąd podczas pobierania spotkań:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania spotkań' },
      { status: 500 }
    );
  }
}
