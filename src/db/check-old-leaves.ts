import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { desc, eq } from 'drizzle-orm';
import { leaveRequests, teamMembers } from './schema';

function getCutoffBangkok(): string {
  const now = new Date();
  const bangkokTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  bangkokTime.setUTCMonth(bangkokTime.getUTCMonth() - 3);
  return bangkokTime.toISOString().split('T')[0];
}

async function main() {
  const url = (process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!)
    .replace('-pooler', '')
    .replace('&channel_binding=require', '')
    .replace('?channel_binding=require', '');
  const sql = neon(url);
  const db = drizzle(sql);

  const cutoff = getCutoffBangkok();
  console.log(`Cutoff date (3 months ago, Bangkok): ${cutoff}`);
  console.log('Rows with end_date < cutoff will be deleted by the cron.\n');

  const rows = await db
    .select({
      id: leaveRequests.id,
      member_id: leaveRequests.member_id,
      member_name: teamMembers.name,
      leave_type: leaveRequests.leave_type,
      start_date: leaveRequests.start_date,
      end_date: leaveRequests.end_date,
      status: leaveRequests.status,
      created_at: leaveRequests.created_at,
    })
    .from(leaveRequests)
    .leftJoin(teamMembers, eq(leaveRequests.member_id, teamMembers.id))
    .orderBy(desc(leaveRequests.end_date));

  console.log(`Total leave_requests rows: ${rows.length}`);
  const missingEnd = rows.filter(r => !r.end_date);
  console.log(`Rows with missing end_date: ${missingEnd.length}`);

  const toDelete = rows.filter(r => r.end_date && r.end_date < cutoff);
  const toKeep = rows.filter(r => !r.end_date || r.end_date >= cutoff);

  console.log(`\nWould DELETE (${toDelete.length}):`);
  for (const r of toDelete) {
    console.log(
      `  • ${r.start_date} → ${r.end_date}  ${r.member_name ?? r.member_id}  [${r.leave_type}/${r.status}]`,
    );
  }

  console.log(`\nWould KEEP (${toKeep.length}):`);
  for (const r of toKeep) {
    console.log(
      `  • ${r.start_date} → ${r.end_date ?? '(NULL)'}  ${r.member_name ?? r.member_id}  [${r.leave_type}/${r.status}]`,
    );
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
