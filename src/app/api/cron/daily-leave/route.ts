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
      `☀️ อรุณสวัสดิ์ทุกคน!\n📅 ${thaiDate}\n\nข่าวดีคือ... วันนี้ไม่มีใครลาเลย 🥳\nข่าวร้ายคือ... ทุกคนต้องทำงานหมดเลย 😇\nสู้ๆ นะจ๊ะ ไม่มีทางหนี 🔒`,
      `📢 morning check-in~\n📅 ${thaiDate}\n\nสแกนชื่อครบทุกคน ✅\nไม่มีใครหาย ไม่มีใครหนี\nวันนี้ทีมพร้อม 100% 💪 (จะชอบหรือไม่ก็ตาม 555)`,
      `🫡 ราย งาน ประ จำ วัน\n📅 ${thaiDate}\n\nตรวจสอบแล้ว... ไม่มีใครกล้าลาวันนี้ 😶\nทุกคนมาครบ ระบบทำงานปกติ\nขอให้มีความสุขในการทำงานนะ (บังคับ) 🙂`,
      `🌅 good morning bestie~\n📅 ${thaiDate}\n\nวันนี้ทีมมาครบ full house เลย 🏠✨\nไม่มีใครลา ไม่มีใครหนี ไม่มีใครรอด 😈\nไปลุยกันได้เบยยย`,
      `🤖 ระบบแจ้งเตือนอัตโนมัติ\n📅 ${thaiDate}\n\nผลการสแกน: ไม่พบผู้ขาดงาน\nสถานะทีม: ONLINE ทุกคน 🟢\nคำแนะนำ: เปิด VS Code / Figma ได้เลย แล้วก็อย่าหนี 🫵`,
      `💅 วันนี้ใครจะลาบ้าง?\n📅 ${thaiDate}\n\n...\n...\n...\nไม่มีใครเลยแฮะ 😑\nโอเค งั้นทุกคนทำงานกันไปก่อนน้าา สู้สู้ 🥹`,
      `🧘 เช้านี้ขอให้ทุกคนสงบจิตสงบใจ\n📅 ${thaiDate}\n\nหายใจเข้า... หายใจออก...\nแล้วก็เปิด laptop ทำงานได้เลยนะคะ 😌\nวันนี้ไม่มีใครลา ทุกคนรอด (ไม่รอด) 🍃`,
      `💀 ข่าวร้ายสำหรับทุกคน\n📅 ${thaiDate}\n\nวันนี้ไม่มีใครลาเลยสักคน\nทุกคนต้องมาเจอหน้ากันครบ ไม่มีข้อยกเว้น\nขอแสดงความเสียใจอย่างจริงใจ 😔\nสู้ๆ นะ เดี๋ยวก็เย็น (หรือเปล่า?)`,
      `🎰 ผลสลากการลาประจำวัน\n📅 ${thaiDate}\n\nหมุนแล้ว... 🎡\n🍋 🍋 🍋\nไม่มีใครถูกรางวัลลาวันนี้!\nทุกคนต้องมาทำงานตามปกติ ขอบคุณที่เล่น 🙏`,
    ];

    const hasLeaveTemplates = (lines: string[]) => [
      `🚨 ประกาศด่วน!! 🚨\n📅 ${thaiDate}\n\nมีคนได้รับอนุญาตให้นอนอยู่บ้านวันนี้ถึง ${todayLeave.length} คน!!! 😤\nขณะที่พวกเราต้องมาทนนั่งทำงาน โห...\n\n${lines.join('\n')}\n\nส่วนที่เหลือ... ยินดีด้วยนะที่ยังมีชีวิตอยู่ในออฟฟิศ 🫠\nทำงานไปก่อนเน้อ สู้ๆ 💪 (ไม่มีใครช่วยได้)`,
      `🕵️ รายงานลับสุดยอด\n📅 ${thaiDate}\n\nพบผู้ต้องสงสัยที่ไม่มาทำงานวันนี้ ${todayLeave.length} ราย 🚔\n\n${lines.join('\n')}\n\nทีมสืบสวนกำลังตรวจสอบ... 🔍\nที่เหลือรีบเปิด laptop ก่อนโดนจับด้วยน้า 😂`,
      `💌 จดหมายเปิดผนึกถึงทีม\n📅 ${thaiDate}\n\nเรียน ทุกคนที่มาทำงานวันนี้,\n\nขอแจ้งให้ทราบว่ามีเพื่อนร่วมงานของท่านจำนวน ${todayLeave.length} คน\nตัดสินใจเลือกชีวิตที่ดีกว่าในวันนี้ 😌✨\n\n${lines.join('\n')}\n\nขอบคุณที่ท่านยังคงเสียสละมาทำงาน\nด้วยความเคารพ,\nระบบ HR 🤖`,
      `📸 วันนี้ใครไม่อยู่บ้าง?\n📅 ${thaiDate}\n\nเช็คชื่อแล้ว! ขาดไป ${todayLeave.length} คนน้า 👇\n\n${lines.join('\n')}\n\nฝากบอก... เราอิจฉามากกก 😭\nที่เหลือสู้ต่อไปนะ เราเชื่อในตัวเธอ 🫶`,
      `🎭 ละครชีวิต ประจำวัน\n📅 ${thaiDate}\n\nบทที่ ${todayLeave.length}: "วันที่เพื่อนได้นอนแต่เราไม่ได้"\n\n${lines.join('\n')}\n\nพระเอก/นางเอกที่เหลือ: จงทำงานต่อไปด้วยใจที่แข็งแกร่ง 💔\n(ฉากนี้ไม่มี happy ending นะ)`,
      `🌤️ อัปเดตสภาพอากาศออฟฟิศ\n📅 ${thaiDate}\n\nสภาพอากาศ: มีเมฆ ${todayLeave.length} ก้อนขาดหาย ⛅\n\n${lines.join('\n')}\n\nพยากรณ์: วันนี้ที่เหลือจะทำงานหนักขึ้น ${todayLeave.length * 10}% 🌧️\nขอให้โชคดีกับทุกคนนะ 🙏`,
      `🏆 รางวัลแห่งวัน\n📅 ${thaiDate}\n\nขอมอบรางวัล "คนกล้าลา" ประจำวันนี้ให้กับ...\n\n${lines.join('\n')}\n\nส่วนที่ไม่ได้รางวัล... ยังมีพรุ่งนี้นะ 😤\nวันนี้ทำงานไปก่อนเน้อ ไม่มีตัวเลือกอื่น 😇`,
      `😤 โอเค เข้าใจแล้ว\n📅 ${thaiDate}\n\nมีคนฉลาดกว่าเรา ${todayLeave.length} คนในวันนี้\n\n${lines.join('\n')}\n\nส่วนพวกเรา... ก็ได้แค่นั่งมองปฏิทินวันหยุดไปก่อนนะ 📅\nสู้ๆ เดี๋ยวก็ถึงวันลาของเราบ้าง (เมื่อไหร่ก็ไม่รู้) 🥲`,
      `🛌 breaking news\n📅 ${thaiDate}\n\nขณะที่คุณกำลังอ่านข้อความนี้อยู่\nคนพวกนี้กำลังนอนหลับอยู่อย่างสบายใจ 😴\n\n${lines.join('\n')}\n\nแต่ช่างมัน! พวกเรามีกันและกัน 🤝\nเปิด meeting แรกของวันได้เลยยย (ร้องไห้)`,
      `🎰 ผลสลากการลาประจำวัน\n📅 ${thaiDate}\n\nหมุนแล้ว... 🎡\n🎊 มีผู้โชคดีที่ถูกรางวัลลาวันนี้ ${todayLeave.length} คน! 🎊\n\n${lines.join('\n')}\n\nผู้ที่ไม่ถูกรางวัล: ขอแสดงความเสียใจ และขอให้ทำงานด้วยความสุขนะ 🙂\n(ลุ้นใหม่ได้พรุ่งนี้เช้า)`,
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
