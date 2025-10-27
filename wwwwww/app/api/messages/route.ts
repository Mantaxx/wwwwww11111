import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { requirePhoneVerification } from '@/lib/phone-verification';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createMessageSchema = z.object({
  recipientId: z.string().min(1, 'ID odbiorcy jest wymagane'),
  content: z.string().min(1, 'Treść wiadomości jest wymagana').max(1000, 'Wiadomość jest za długa'),
});

// GET /api/messages - Pobierz konwersacje użytkownika
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireFirebaseAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { decodedToken } = authResult;

    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const skip = (page - 1) * limit;

    // Pobierz konwersacje użytkownika
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participant1Id: decodedToken.uid }, { participant2Id: decodedToken.uid }],
      },
      include: {
        participant1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
        participant2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      skip,
      take: limit,
    });

    // Przekształć dane konwersacji
    const formattedConversations = conversations.map(conv => {
      const otherParticipant =
        conv.participant1Id === decodedToken.uid ? conv.participant2 : conv.participant1;

      const lastMessage = conv.messages[0];

      return {
        id: conv.id,
        otherParticipant: {
          id: otherParticipant.id,
          name:
            `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() ||
            otherParticipant.email,
          email: otherParticipant.email,
          image: otherParticipant.image,
        },
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              senderName:
                `${lastMessage.sender.firstName || ''} ${lastMessage.sender.lastName || ''}`.trim() ||
                'Użytkownik',
              isRead: lastMessage.isRead,
              createdAt: lastMessage.createdAt,
            }
          : null,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: 0, // Będzie obliczone osobno
      };
    });

    // Oblicz liczbę nieprzeczytanych wiadomości dla każdej konwersacji
    for (const conv of formattedConversations) {
      const unreadCount = await prisma.userMessage.count({
        where: {
          conversationId: conv.id,
          senderId: { not: decodedToken.uid },
          isRead: false,
        },
      });
      conv.unreadCount = unreadCount;
    }

    const total = await prisma.conversation.count({
      where: {
        OR: [{ participant1Id: decodedToken.uid }, { participant2Id: decodedToken.uid }],
      },
    });

    return NextResponse.json({
      conversations: formattedConversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Nie udało się pobrać konwersacji' }, { status: 500 });
  }
}

// POST /api/messages - Wyślij nową wiadomość
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireFirebaseAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { decodedToken } = authResult;

    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź weryfikację telefonu dla wysyłania wiadomości
    const phoneVerificationError = await requirePhoneVerification(request);
    if (phoneVerificationError) {
      return phoneVerificationError;
    }

    const body = await request.json();
    const validatedData = createMessageSchema.parse(body);

    // Sprawdź czy odbiorca istnieje
    const recipient = await prisma.user.findUnique({
      where: { id: validatedData.recipientId },
      select: { id: true, isActive: true },
    });

    if (!recipient) {
      return NextResponse.json({ error: 'Odbiorca nie istnieje' }, { status: 404 });
    }

    if (!recipient.isActive) {
      return NextResponse.json({ error: 'Odbiorca nie jest aktywny' }, { status: 400 });
    }

    if (recipient.id === decodedToken.uid) {
      return NextResponse.json(
        { error: 'Nie możesz wysłać wiadomości do siebie' },
        { status: 400 }
      );
    }

    // Znajdź lub utwórz konwersację
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: decodedToken.uid,
            participant2Id: validatedData.recipientId,
          },
          {
            participant1Id: validatedData.recipientId,
            participant2Id: decodedToken.uid,
          },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: decodedToken.uid,
          participant2Id: validatedData.recipientId,
        },
      });
    }

    // Utwórz wiadomość
    const message = await prisma.userMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: decodedToken.uid,
        content: validatedData.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
    });

    // Zaktualizuj czas ostatniej wiadomości w konwersacji
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json(
      {
        message: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          senderName:
            `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim() ||
            'Użytkownik',
          senderImage: message.sender.image,
          createdAt: message.createdAt,
        },
        conversationId: conversation.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Nie udało się wysłać wiadomości' }, { status: 500 });
  }
}
