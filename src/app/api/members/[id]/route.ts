import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  try {
    const { name, email, role, avatar_color } = await req.json();
    const [row] = await db.update(teamMembers)
      .set({ name, email: email ?? null, role: role ?? 'Member', avatar_color: avatar_color ?? '#3B82F6' })
      .where(eq(teamMembers.id, params.id))
      .returning();
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  try {
    await db.delete(teamMembers).where(eq(teamMembers.id, params.id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
