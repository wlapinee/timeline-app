import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, start_date, end_date, progress, color, assignee_id, sort_order } = await req.json();
    const rows = await sql`
      UPDATE tasks
      SET name = ${name}, start_date = ${start_date}, end_date = ${end_date},
          progress = ${progress ?? 0}, color = ${color ?? '#3B82F6'},
          assignee_id = ${assignee_id ?? null}, sort_order = ${sort_order ?? 0}
      WHERE id = ${params.id}
      RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await sql`DELETE FROM tasks WHERE id = ${params.id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
