import { Holiday } from '@/types';

export const THAI_HOLIDAYS: Holiday[] = [
  // 2025
  { date: '2025-01-01', name: "New Year's Day", nameTh: 'วันขึ้นปีใหม่' },
  { date: '2025-02-12', name: 'Makha Bucha Day', nameTh: 'วันมาฆบูชา' },
  { date: '2025-04-06', name: 'Chakri Memorial Day', nameTh: 'วันจักรี' },
  { date: '2025-04-07', name: 'Substitution for Chakri Day', nameTh: 'ชดเชยวันจักรี' },
  { date: '2025-04-13', name: 'Songkran Festival', nameTh: 'วันสงกรานต์' },
  { date: '2025-04-14', name: 'Songkran Festival', nameTh: 'วันสงกรานต์' },
  { date: '2025-04-15', name: 'Songkran Festival', nameTh: 'วันสงกรานต์' },
  { date: '2025-05-01', name: 'Labour Day', nameTh: 'วันแรงงาน' },
  { date: '2025-05-04', name: 'Coronation Day', nameTh: 'วันฉัตรมงคล' },
  { date: '2025-05-05', name: 'Substitution for Coronation Day', nameTh: 'ชดเชยวันฉัตรมงคล' },
  { date: '2025-05-12', name: 'Visakha Bucha Day', nameTh: 'วันวิสาขบูชา' },
  { date: '2025-06-03', name: "Queen Suthida's Birthday", nameTh: 'วันเฉลิมพระชนมพรรษาสมเด็จพระราชินี' },
  { date: '2025-07-10', name: 'Asalha Bucha Day', nameTh: 'วันอาสาฬหบูชา' },
  { date: '2025-07-11', name: 'Buddhist Lent Day', nameTh: 'วันเข้าพรรษา' },
  { date: '2025-07-28', name: "King's Birthday", nameTh: 'วันเฉลิมพระชนมพรรษา ร.10' },
  { date: '2025-08-12', name: "Queen Mother's Birthday", nameTh: 'วันแม่แห่งชาติ' },
  { date: '2025-10-13', name: 'King Bhumibol Memorial Day', nameTh: 'วันคล้ายวันสวรรคต ร.9' },
  { date: '2025-10-23', name: 'Chulalongkorn Day', nameTh: 'วันปิยมหาราช' },
  { date: '2025-12-05', name: "King Bhumibol's Birthday", nameTh: 'วันพ่อแห่งชาติ' },
  { date: '2025-12-10', name: 'Constitution Day', nameTh: 'วันรัฐธรรมนูญ' },
  { date: '2025-12-31', name: "New Year's Eve", nameTh: 'วันสิ้นปี' },
  // 2026
  { date: '2026-01-01', name: "New Year's Day", nameTh: 'วันขึ้นปีใหม่' },
  { date: '2026-01-02', name: 'Special Holiday', nameTh: 'วันหยุดพิเศษ' },
  { date: '2026-03-03', name: 'Makha Bucha Day', nameTh: 'วันมาฆบูชา' },
  { date: '2026-04-06', name: 'Chakri Memorial Day', nameTh: 'วันจักรี' },
  { date: '2026-04-13', name: 'Songkran Festival', nameTh: 'วันสงกรานต์' },
  { date: '2026-04-14', name: 'Songkran Festival', nameTh: 'วันสงกรานต์' },
  { date: '2026-04-15', name: 'Songkran Festival', nameTh: 'วันสงกรานต์' },
  { date: '2026-05-01', name: 'Labour Day', nameTh: 'วันแรงงาน' },
  { date: '2026-05-04', name: 'Coronation Day', nameTh: 'วันฉัตรมงคล' },
  { date: '2026-05-31', name: 'Visakha Bucha Day', nameTh: 'วันวิสาขบูชา' },
  { date: '2026-06-01', name: 'Substitution for Visakha Bucha', nameTh: 'ชดเชยวันวิสาขบูชา' },
  { date: '2026-06-03', name: "Queen Suthida's Birthday", nameTh: 'วันเฉลิมพระชนมพรรษาสมเด็จพระราชินี' },
  { date: '2026-07-28', name: "King's Birthday", nameTh: 'วันเฉลิมพระชนมพรรษา ร.10' },
  { date: '2026-07-29', name: 'Asalha Bucha Day', nameTh: 'วันอาสาฬหบูชา' },
  { date: '2026-07-30', name: 'Buddhist Lent Day', nameTh: 'วันเข้าพรรษา' },
  { date: '2026-08-12', name: "Queen Mother's Birthday", nameTh: 'วันแม่แห่งชาติ' },
  { date: '2026-10-13', name: 'King Bhumibol Memorial Day', nameTh: 'วันคล้ายวันสวรรคต ร.9' },
  { date: '2026-10-23', name: 'Chulalongkorn Day', nameTh: 'วันปิยมหาราช' },
  { date: '2026-12-05', name: "King Bhumibol's Birthday", nameTh: 'วันพ่อแห่งชาติ' },
  { date: '2026-12-10', name: 'Constitution Day', nameTh: 'วันรัฐธรรมนูญ' },
  { date: '2026-12-31', name: "New Year's Eve", nameTh: 'วันสิ้นปี' },
];

const holidaySet = new Set(THAI_HOLIDAYS.map(h => h.date));
const holidayMap: Record<string, Holiday> = {};
THAI_HOLIDAYS.forEach(h => { holidayMap[h.date] = h; });

export function getHoliday(dateStr: string): Holiday | undefined {
  return holidayMap[dateStr];
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

export function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function isWeekend(date: Date): boolean {
  const d = date.getDay();
  return d === 0 || d === 6;
}

export function isHoliday(dateStr: string): boolean {
  return holidaySet.has(dateStr);
}

export function isNonWorkingDay(date: Date): boolean {
  return isWeekend(date) || isHoliday(formatDate(date));
}

export function getWorkingDays(start: Date, end: Date): number {
  let count = 0;
  let cur = new Date(start);
  while (cur <= end) {
    if (!isNonWorkingDay(cur)) count++;
    cur = addDays(cur, 1);
  }
  return count;
}

export function getHolidaysInRange(start: string, end: string): Holiday[] {
  const holidays: Holiday[] = [];
  let cur = parseDate(start);
  const endDate = parseDate(end);
  while (cur <= endDate) {
    const ds = formatDate(cur);
    if (holidayMap[ds]) holidays.push(holidayMap[ds]);
    cur = addDays(cur, 1);
  }
  return holidays;
}

export function generateId(): string {
  return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export const TASK_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1',
];

export const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave', labelTh: 'ลาพักร้อน', color: '#3B82F6' },
  { value: 'sick', label: 'Sick Leave', labelTh: 'ลาป่วย', color: '#EF4444' },
  { value: 'personal', label: 'Personal Leave', labelTh: 'ลากิจ', color: '#F59E0B' },
  { value: 'maternity', label: 'Maternity Leave', labelTh: 'ลาคลอด', color: '#EC4899' },
  { value: 'ordination', label: 'Ordination Leave', labelTh: 'ลาบวช', color: '#8B5CF6' },
  { value: 'other', label: 'Other', labelTh: 'อื่นๆ', color: '#6B7280' },
];

export const LEAVE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7' },
  approved: { label: 'Approved', color: '#10B981', bg: '#D1FAE5' },
  rejected: { label: 'Rejected', color: '#EF4444', bg: '#FEE2E2' },
};
