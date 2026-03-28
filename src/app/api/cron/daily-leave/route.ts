import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { leaveRequests, teamMembers } from '@/db/schema';
import { lte, gte, eq, and } from 'drizzle-orm';
import { isNonWorkingDay } from '@/lib/holidays';

const LEAVE_TYPE_TH: Record<string, string> = {
  annual: 'ลาพักร้อน',
  sick: 'ลาป่วย',
  personal: 'ลากิจ',
  maternity: 'ลาคลอด',
  ordination: 'ลาบวช',
  other: 'อื่นๆ',
};

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

function getTodayBangkok(): string {
  const now = new Date();
  const bangkokTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return bangkokTime.toISOString().split('T')[0];
}

function formatThaiDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${THAI_MONTHS[m - 1]} ${y + 543}`;
}

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = getTodayBangkok();

  // Skip weekends and public holidays
  const [y, m, d] = today.split('-').map(Number);
  if (isNonWorkingDay(new Date(y, m - 1, d))) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'non-working day', date: today });
  }

  try {
    const db = getDb();

    // Fetch today's approved leave and all members in parallel
    const [todayLeave, members] = await Promise.all([
      db.select()
        .from(leaveRequests)
        .where(
          and(
            lte(leaveRequests.start_date, today),
            gte(leaveRequests.end_date, today),
            eq(leaveRequests.status, 'approved'),
          )
        ),
      db.select().from(teamMembers),
    ]);

    const memberMap = new Map(members.map(m => [m.id, m]));
    const thaiDate = formatThaiDate(today);

    let message: string;

    if (todayLeave.length === 0) {
      message = `📋 รายงานการลาประจำวัน\nวันที่ ${thaiDate}\n\n✅ ไม่มีผู้ลาวันนี้`;
    } else {
      const lines = todayLeave.map(lr => {
        const member = memberMap.get(lr.member_id);
        const name = member?.name ?? 'Unknown';
        const typeTh = LEAVE_TYPE_TH[lr.leave_type] ?? lr.leave_type;
        const reason = lr.reason ? ` (${lr.reason})` : '';
        return `• ${name} — ${typeTh}${reason}`;
      });
      message = `📋 รายงานการลาประจำวัน\nวันที่ ${thaiDate}\n\n👤 ผู้ลาวันนี้ (${todayLeave.length} คน):\n${lines.join('\n')}`;
    }

    // Send to LINE group
    const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: process.env.LINE_GROUP_ID,
        messages: [{ type: 'text', text: message }],
      }),
    });

    if (!lineRes.ok) {
      const err = await lineRes.text();
      console.error('LINE API error:', err);
      return NextResponse.json({ error: 'LINE API failed', detail: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true, date: today, count: todayLeave.length });
  } catch (err) {
    console.error('Cron error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
