import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { leaveRequests, teamMembers } from '@/db/schema';
import { lte, gte, eq, and } from 'drizzle-orm';
import { isNonWorkingDay } from '@/lib/holidays';

const LEAVE_TYPE_TH: Record<string, string> = {
  annual: 'ลาพักร้อน',
  annual_half: 'ลาพักร้อนครึ่งวัน',
  sick: 'ลาป่วย',
  sick_half: 'ลาป่วยครึ่งวัน',
  personal: 'ลากิจ',
  personal_half: 'ลากิจครึ่งวัน',
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

    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const noLeaveTemplates = [
      `🚨 ประกาศด่วน!! 🚨\n📅 ${thaiDate}\n\nวันนี้ไม่มีใครลาแฮะ 🤩\nไปทำงานที่เรารักกกกั๊นนนนนนนน 😒💀`,
      `☀️ อรุณสวัสดิ์ทุกคน!\n📅 ${thaiDate}\n\nข่าวดีคือ... วันนี้ไม่มีใครลาเลย 🥳\nข่าวร้ายคือ... ทุกคนต้องทำงานหมดเลย 😇\nสู้ๆ นะจ๊ะ 🔒`,
      `📢 morning check-in~\n📅 ${thaiDate}\n\nสแกนชื่อครบทุกคน ✅\nไม่มีใครหาย ไม่มีใครหนี\nวันนี้ทีมพร้อม 100% 💪`,
    ];

    const hasLeaveTemplates = (lines: string[]) => [
      `🚨 ประกาศด่วน!! 🚨\n📅 ${thaiDate}\n\nมีคนได้รับอนุญาตให้นอนอยู่บ้านวันนี้ถึง ${todayLeave.length} คน!!! 😤\nขณะที่พวกเราต้องมาทนนั่งทำงาน โห...\n\n${lines.join('\n')}\n\nส่วนที่เหลือ... ยินดีด้วยนะที่ยังมีชีวิตอยู่ในออฟฟิศ 🫠\nทำงานไปก่อนเน้อ สู้ๆ 💪 (ไม่มีใครช่วยได้)`,
      `🕵️ รายงานลับสุดยอด\n📅 ${thaiDate}\n\nพบผู้ต้องสงสัยที่ไม่มาทำงานวันนี้ ${todayLeave.length} ราย 🚔\n\n${lines.join('\n')}\n\nทีมสืบสวนกำลังตรวจสอบ... 🔍\nที่เหลือรีบเปิด laptop ก่อนโดนจับด้วยน้า 😂`,
      `💌 จดหมายเปิดผนึกถึงทีม\n📅 ${thaiDate}\n\nเรียน ทุกคนที่มาทำงานวันนี้,\n\nขอแจ้งให้ทราบว่ามีเพื่อนร่วมงานของท่านจำนวน ${todayLeave.length} คน\nตัดสินใจเลือกชีวิตที่ดีกว่าในวันนี้ 😌✨\n\n${lines.join('\n')}\n\nขอบคุณที่ท่านยังคงเสียสละมาทำงาน\nด้วยความเคารพ,\nระบบ HR 🤖`,
    ];

    let message: string;

    if (todayLeave.length === 0) {
      message = pick(noLeaveTemplates);
    } else {
      const lines = todayLeave.map(lr => {
        const member = memberMap.get(lr.member_id);
        const name = member?.name ?? 'Unknown';
        const typeTh = LEAVE_TYPE_TH[lr.leave_type] ?? lr.leave_type;
        const reason = lr.reason ? ` เหตุผล: "${lr.reason}" (ไม่รู้จริงมั้ยนะ 🤨)` : ' (ไม่บอกเหตุผลเลย หนีเที่ยวชัวร์ 👀)';
        return `• ${name} — ${typeTh}${reason}`;
      });
      message = pick(hasLeaveTemplates(lines));
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
