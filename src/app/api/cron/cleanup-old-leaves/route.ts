import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { leaveRequests } from '@/db/schema';
import { lt } from 'drizzle-orm';

function getCutoffBangkok(): string {
  const now = new Date();
  const bangkokTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  bangkokTime.setUTCMonth(bangkokTime.getUTCMonth() - 3);
  return bangkokTime.toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoff = getCutoffBangkok();

  try {
    const db = getDb();
    const result = await db
      .delete(leaveRequests)
      .where(lt(leaveRequests.end_date, cutoff))
      .returning({ id: leaveRequests.id });

    return NextResponse.json({ ok: true, cutoff, deleted: result.length });
  } catch (err) {
    console.error('Cleanup cron error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
