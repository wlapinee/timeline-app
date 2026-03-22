import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM team_members ORDER BY created_at ASC`;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, role, avatar_color } = await req.json();
    const rows = await sql`
      INSERT INTO team_members (name, email, role, avatar_color)
      VALUES (${name}, ${email ?? null}, ${role ?? 'Member'}, ${avatar_color ?? '#3B82F6'})
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
