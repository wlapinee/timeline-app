import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  try {
    const { name, start_date, end_date, progress, color, assignee_id, sort_order } = await req.json();
    const [row] = await db.update(tasks)
      .set({ name, start_date, end_date, progress: progress ?? 0, color: color ?? '#3B82F6', assignee_id: assignee_id ?? null, sort_order: sort_order ?? 0 })
      .where(eq(tasks.id, params.id))
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
    await db.delete(tasks).where(eq(tasks.id, params.id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
