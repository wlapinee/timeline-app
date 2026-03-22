import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM leave_requests ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { member_id, leave_type, start_date, end_date, reason, status } = await req.json();
    const rows = await sql`
      INSERT INTO leave_requests (member_id, leave_type, start_date, end_date, reason, status)
      VALUES (${member_id}, ${leave_type}, ${start_date}, ${end_date}, ${reason ?? null}, ${status ?? 'pending'})
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
