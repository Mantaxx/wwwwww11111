import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { requirePhoneVerification } from '@/lib/phone-verification';
import { prisma, withDatabaseFallback } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź autoryzację Firebase
    const authResult = await requireFirebaseAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { decodedToken } = authResult;

    // Sprawdź czy użytkownik ma zweryfikowany telefon
    const phoneVerificationError = await requirePhoneVerification(request);
    if (phoneVerificationError) {
      return phoneVerificationError;
    }

    // Parsuj formularz
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const date = formData.get('date') as string;
    const images = formData.getAll('images') as File[];

    // Walidacja
    if (!title || !location || !date || images.length === 0) {
      return NextResponse.json(
        { error: 'Wszystkie wymagane pola muszą być wypełnione' },
        { status: 400 }
      );
    }

    // Walidacja zdjęć
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const image of images) {
      if (image.size > maxFileSize) {
        return NextResponse.json(
          { error: `Zdjęcie ${image.name} jest za duże. Maksymalny rozmiar to 5MB.` },
          { status: 400 }
        );
      }

      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          {
            error: `Nieprawidłowy format zdjęcia ${image.name}. Dozwolone formaty: JPG, PNG, WebP.`,
          },
          { status: 400 }
        );
      }
    }

    // Stwórz folder dla zdjęć
    const uploadDir = join(process.cwd(), 'public', 'meetings with breeders');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Zapisz zdjęcia
    const imagePaths: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const timestamp = Date.now();
      const fileName = `${timestamp}_${i}_${image.name}`;
      const filePath = join(uploadDir, fileName);

      const bytes = await image.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      imagePaths.push(`/meetings with breeders/${fileName}`);
    }

    // Zapisz spotkanie do bazy danych
    const meeting = await prisma.breederMeeting.create({
      data: {
        title,
        description: description || '',
        location,
        date: new Date(date),
        images: JSON.stringify(imagePaths),
        userId: decodedToken.uid,
        isApproved: false, // Nowe spotkania wymagają zatwierdzenia
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Spotkanie zostało dodane i oczekuje na zatwierdzenie przez administratora',
      meeting: {
        id: meeting.id,
        title: meeting.title,
        location: meeting.location,
        date: meeting.date,
        imagesCount: imagePaths.length,
      },
    });
  } catch (error) {
    console.error('Błąd podczas dodawania spotkania:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas dodawania spotkania' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Statyczne spotkania ze zdjęciami z folderów
  const staticMeetings = [
    {
      id: 'geert-munnik',
      name: 'Spotkanie z Geert Munnik',
      location: 'Holandia',
      date: '2024-01-15',
      description: 'Spotkanie z hodowcą Geert Munnik w jego hodowli w Holandii',
      images: [
        '/meetings with breeders/Geert Munnik/DSC_0031.jpg',
        '/meetings with breeders/Geert Munnik/DSC_0038.jpg',
        '/meetings with breeders/Geert Munnik/DSC_0044.jpg',
        '/meetings with breeders/Geert Munnik/DSC_0399.jpg',
        '/meetings with breeders/Geert Munnik/DSC_03991.jpg',
        '/meetings with breeders/Geert Munnik/DSC_0409.jpg',
      ],
    },
    {
      id: 'jan-oost',
      name: 'Spotkanie z Jan Oost',
      location: 'Holandia',
      date: '2024-02-20',
      description: 'Wizyta u hodowcy Jana Oosta - dyskusje o hodowli gołębi pocztowych',
      images: [
        '/meetings with breeders/Jan Oost/DSC_0002.jpg',
        '/meetings with breeders/Jan Oost/DSC_0004.jpg',
        '/meetings with breeders/Jan Oost/DSC_0006.jpg',
        '/meetings with breeders/Jan Oost/DSC_0011.jpg',
        '/meetings with breeders/Jan Oost/DSC_0017.jpg',
        '/meetings with breeders/Jan Oost/DSC_0018.jpg',
        '/meetings with breeders/Jan Oost/DSC_0422.jpg',
        '/meetings with breeders/Jan Oost/DSC_0423.jpg',
        '/meetings with breeders/Jan Oost/DSC_0426.jpg',
      ],
    },
    {
      id: 'marginus-oostenbrink',
      name: 'Spotkanie z Marginus Oostenbrink',
      location: 'Holandia',
      date: '2024-03-10',
      description: 'Spotkanie z doświadczonym hodowcą Marginus Oostenbrink',
      images: [
        '/meetings with breeders/Marginus Oostenbrink/DSC_0431.jpg',
        '/meetings with breeders/Marginus Oostenbrink/DSC_0433.jpg',
        '/meetings with breeders/Marginus Oostenbrink/DSC_0435.jpg',
      ],
    },
    {
      id: 'theo-lehnen',
      name: 'Spotkanie z Theo Lehnen',
      location: 'Niemcy',
      date: '2024-04-05',
      description: 'Wizyta u niemieckiego hodowcy Theo Lehnen',
      images: [
        '/meetings with breeders/Theo Lehnen/Theo-1.jpg',
        '/meetings with breeders/Theo Lehnen/Theo-2.jpg',
        '/meetings with breeders/Theo Lehnen/Theo-3.jpg',
        '/meetings with breeders/Theo Lehnen/Theo.jpg',
      ],
    },
    {
      id: 'toni-van-ravenstein',
      name: 'Spotkanie z Toni van Ravenstein',
      location: 'Holandia',
      date: '2024-05-12',
      description: 'Spotkanie z hodowcą Toni van Ravenstein - wymiana doświadczeń',
      images: [
        '/meetings with breeders/Toni van Ravenstein/DSC_0001.jpg',
        '/meetings with breeders/Toni van Ravenstein/DSC_0003.jpg',
        '/meetings with breeders/Toni van Ravenstein/DSCF2556.jpg',
        '/meetings with breeders/Toni van Ravenstein/DSCF2559.jpg',
        '/meetings with breeders/Toni van Ravenstein/DSCF2578.jpg',
        '/meetings with breeders/Toni van Ravenstein/TONI-1.jpg',
        '/meetings with breeders/Toni van Ravenstein/TONI-2.jpg',
      ],
    },
  ];

  const dbMeetings = await withDatabaseFallback(
    async () => {
      const meetings = await prisma.breederMeeting.findMany({
        where: {
          isApproved: true,
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          date: true,
          images: true,
        },
      });

      return meetings.map(meeting => ({
        id: meeting.id,
        name: meeting.title,
        location: meeting.location,
        date: meeting.date.toISOString().split('T')[0],
        description: meeting.description || '',
        images: JSON.parse(meeting.images || '[]'),
      }));
    },
    [],
    'Database not available, returning only static meetings'
  );

  // Połącz wszystkie spotkania
  const allMeetings = [...staticMeetings, ...dbMeetings];

  return NextResponse.json(allMeetings);
}
