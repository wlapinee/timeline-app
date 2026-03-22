import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { leaveRequests } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  try {
    const { member_id, leave_type, start_date, end_date, reason, status } = await req.json();
    const [row] = await db.update(leaveRequests)
      .set({ member_id, leave_type, start_date, end_date, reason: reason ?? null, status: status ?? 'pending' })
      .where(eq(leaveRequests.id, params.id))
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
    await db.delete(leaveRequests).where(eq(leaveRequests.id, params.id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
