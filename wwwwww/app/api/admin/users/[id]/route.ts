import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  const params = await context.params;
  const id = params?.id as string;
  try {
    const body = await request.json();
    const data: {
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
      role?: 'USER' | 'ADMIN';
    } = {};
    if (typeof body.firstName === 'string') data.firstName = body.firstName;
    if (typeof body.lastName === 'string') data.lastName = body.lastName;
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive;
    if (typeof body.role === 'string' && ['USER', 'ADMIN'].includes(body.role))
      data.role = body.role as 'USER' | 'ADMIN';

    const updated = await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ success: true, user: { id: updated.id } });
  } catch (e) {
    console.error('Admin user PATCH error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  const { decodedToken } = authResult;
  const params = await context.params;
  const id = params?.id as string;

  if (id === decodedToken.uid) {
    return NextResponse.json({ error: 'Nie można usunąć własnego konta' }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Admin user DELETE error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
