import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM projects ORDER BY created_at ASC LIMIT 1`;
    return NextResponse.json(rows[0] ?? null);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
