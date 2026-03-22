import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { leaveRequests } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const db = getDb();
  try {
    const rows = await db.select().from(leaveRequests).orderBy(desc(leaveRequests.created_at));
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const db = getDb();
  try {
    const { member_id, leave_type, start_date, end_date, reason, status } = await req.json();
    const [row] = await db.insert(leaveRequests).values({
      member_id,
      leave_type,
      start_date,
      end_date,
      reason: reason ?? null,
      status: status ?? 'pending',
    }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
