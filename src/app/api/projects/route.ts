import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { projects } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  const db = getDb();
  try {
    const [row] = await db.select().from(projects).orderBy(asc(projects.created_at)).limit(1);
    return NextResponse.json(row ?? null);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
