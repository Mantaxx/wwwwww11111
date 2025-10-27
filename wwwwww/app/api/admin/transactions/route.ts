import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Nieautoryzowany dostęp' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        commission: true,
        status: true,
        createdAt: true,
        auction: { select: { title: true } },
        buyer: { select: { firstName: true, lastName: true, email: true } },
        seller: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.transaction.count(),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}
