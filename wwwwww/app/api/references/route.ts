// import { cacheKeys, withCache } from '@/lib/cache'
import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { requirePhoneVerification } from '@/lib/phone-verification';
import { prisma, withDatabaseFallback } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const achievementSchema = z.object({
  pigeon: z.string(),
  ringNumber: z.string(),
  results: z.array(
    z.object({
      competition: z.string(),
      place: z.number(),
      date: z.string(),
    })
  ),
});

const createReferenceSchema = z.object({
  breederName: z.string(),
  location: z.string(),
  experience: z.string(),
  testimonial: z.string(),
  rating: z.number().min(1).max(5),
  achievements: z.array(achievementSchema),
});

export async function GET() {
  const fallbackReferences = [
    {
      id: '1',
      breeder: {
        name: 'Jan Kowalski',
        location: 'Warszawa',
        experience: '15 lat',
        avatar: '/api/placeholder/100/100',
      },
      testimonial: 'Świetna hodowla, gołębie w doskonałej kondycji. Polecam!',
      achievements: [
        {
          pigeon: 'PL-001',
          ringNumber: 'PL-001-20-123',
          results: [
            { competition: 'Mistrzostwa Polski', place: 1, date: '2023-06-15' },
            { competition: 'Puchar Europy', place: 2, date: '2023-07-20' },
          ],
        },
      ],
      rating: 5,
      date: '2023-08-15',
    },
    {
      id: '2',
      breeder: {
        name: 'Maria Nowak',
        location: 'Kraków',
        experience: '10 lat',
        avatar: '/api/placeholder/100/100',
      },
      testimonial: 'Profesjonalna obsługa i zdrowe ptaki. Bardzo polecam.',
      achievements: [
        {
          pigeon: 'PL-002',
          ringNumber: 'PL-002-21-456',
          results: [{ competition: 'Mistrzostwa Małopolski', place: 1, date: '2023-05-10' }],
        },
      ],
      rating: 5,
      date: '2023-07-20',
    },
  ];

  const references = await withDatabaseFallback(
    async () => {
      const refs = await prisma.reference.findMany({
        where: {
          isApproved: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          breederName: true,
          location: true,
          experience: true,
          testimonial: true,
          rating: true,
          achievements: true,
          createdAt: true,
        },
      });

      return refs.map(ref => ({
        id: ref.id,
        breeder: {
          name: ref.breederName,
          location: ref.location,
          experience: ref.experience,
          avatar: '/api/placeholder/100/100',
        },
        testimonial: ref.testimonial,
        achievements: JSON.parse(ref.achievements),
        rating: ref.rating,
        date: ref.createdAt.toISOString().split('T')[0],
      }));
    },
    fallbackReferences,
    'Database not available, returning fallback references'
  );

  return NextResponse.json(references);
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź autoryzację Firebase
    const authResult = await requireFirebaseAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Sprawdź weryfikację telefonu dla dodawania referencji
    const phoneVerificationError = await requirePhoneVerification(request);
    if (phoneVerificationError) {
      return phoneVerificationError;
    }

    const body = await request.json();
    const parsedData = createReferenceSchema.parse(body);

    const reference = await prisma.reference.create({
      data: {
        breederName: parsedData.breederName,
        location: parsedData.location,
        experience: parsedData.experience,
        testimonial: parsedData.testimonial,
        rating: parsedData.rating,
        achievements: JSON.stringify(parsedData.achievements || []),
        isApproved: false, // Nowe referencje wymagają zatwierdzenia
      },
    });

    return NextResponse.json(
      {
        message: 'Referencja została dodana i oczekuje na zatwierdzenie',
        id: reference.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error creating reference:', error);
    return NextResponse.json({ error: 'Nie udało się dodać referencji' }, { status: 500 });
  }
}
