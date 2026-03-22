import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { tasks } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  const db = getDb();
  try {
    const rows = await db.select().from(tasks).orderBy(asc(tasks.sort_order), asc(tasks.created_at));
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const db = getDb();
  try {
    const { project_id, name, start_date, end_date, progress, color, assignee_id, sort_order } = await req.json();
    const [row] = await db.insert(tasks).values({
      project_id: project_id ?? null,
      name,
      start_date,
      end_date,
      progress: progress ?? 0,
      color: color ?? '#3B82F6',
      assignee_id: assignee_id ?? null,
      sort_order: sort_order ?? 0,
    }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
