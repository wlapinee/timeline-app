import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { teamMembers } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  const db = getDb();
  try {
    const rows = await db.select().from(teamMembers).orderBy(asc(teamMembers.created_at));
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const db = getDb();
  try {
    const { name, email, role, avatar_color } = await req.json();
    const [row] = await db.insert(teamMembers).values({
      name,
      email: email ?? null,
      role: role ?? 'Member',
      avatar_color: avatar_color ?? '#3B82F6',
    }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
