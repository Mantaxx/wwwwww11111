import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const [totalUsers, totalAuctions, totalTransactions, disputes] = await Promise.all([
      prisma.user.count(),
      prisma.auction.count({ where: { status: 'ACTIVE' } }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'DISPUTED' } }).catch(() => 0),
    ]);

    return NextResponse.json({
      totalUsers,
      totalAuctions,
      totalTransactions,
      disputes,
    });
  } catch (e) {
    console.error('Admin stats error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
