import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM tasks ORDER BY sort_order ASC, created_at ASC`;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { project_id, name, start_date, end_date, progress, color, assignee_id, sort_order } = await req.json();
    const rows = await sql`
      INSERT INTO tasks (project_id, name, start_date, end_date, progress, color, assignee_id, sort_order)
      VALUES (
        ${project_id ?? null}, ${name}, ${start_date}, ${end_date},
        ${progress ?? 0}, ${color ?? '#3B82F6'}, ${assignee_id ?? null}, ${sort_order ?? 0}
      )
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
