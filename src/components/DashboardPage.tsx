'use client';

import { useMemo } from 'react';
import { TeamMember, LeaveRequest } from '@/types';
import { THAI_HOLIDAYS, LEAVE_TYPES, formatDate, parseDate } from '@/lib/holidays';

interface Props {
  leaveRequests: LeaveRequest[];
  members: TeamMember[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getLeaveTypeInfo(value: string) {
  return LEAVE_TYPES.find(t => t.value === value) ?? { label: value, color: '#6B7280' };
}

function getMemberName(members: TeamMember[], id: string) {
  return members.find(m => m.id === id)?.name ?? 'Unknown';
}

function getMemberColor(members: TeamMember[], id: string) {
  return members.find(m => m.id === id)?.avatar_color ?? '#6B7280';
}

export default function DashboardPage({ leaveRequests, members }: Props) {
  const today = formatDate(new Date());
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // --- Today's leave ---
  const todayLeave = useMemo(() =>
    leaveRequests.filter(lr => {
      if (lr.status === 'rejected') return false;
      return today >= lr.start_date && today <= lr.end_date;
    }),
    [leaveRequests, today]
  );

  // --- This month's leave ---
  const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const monthLeave = useMemo(() =>
    leaveRequests.filter(lr => {
      if (lr.status === 'rejected') return false;
      return lr.start_date <= monthEnd && lr.end_date >= monthStart;
    }),
    [leaveRequests, monthStart, monthEnd]
  );

  // --- Holidays grouped by month for current year ---
  const holidaysByMonth = useMemo(() => {
    const map: Record<number, typeof THAI_HOLIDAYS> = {};
    THAI_HOLIDAYS
      .filter(h => h.date.startsWith(String(currentYear)))
      .forEach(h => {
        const m = parseDate(h.date).getMonth();
        if (!map[m]) map[m] = [];
        map[m].push(h);
      });
    return map;
  }, [currentYear]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* On Leave Today */}
        <section className="bg-surface-200 rounded-2xl border border-surface-300 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
              On Leave Today
            </h2>
            <span className="text-3xl font-bold" style={{ color: '#EF4444' }}>{todayLeave.length}</span>
          </div>
          {todayLeave.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No one is on leave today</p>
          ) : (
            <div className="space-y-2">
              {todayLeave.map(lr => {
                const typeInfo = getLeaveTypeInfo(lr.leave_type);
                return (
                  <div key={lr.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-300/50">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: getMemberColor(members, lr.member_id) }}
                    >
                      {getMemberName(members, lr.member_id).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{getMemberName(members, lr.member_id)}</p>
                      <p className="text-xs text-gray-400">{lr.start_date} – {lr.end_date}</p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{ backgroundColor: typeInfo.color + '22', color: typeInfo.color }}
                    >
                      {typeInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Leave This Month */}
        <section className="bg-surface-200 rounded-2xl border border-surface-300 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              Leave This Month — {MONTH_NAMES[currentMonth]}
            </h2>
            <span className="text-3xl font-bold" style={{ color: '#3B82F6' }}>{monthLeave.length}</span>
          </div>
          {monthLeave.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No leave requests this month</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {monthLeave.map(lr => {
                const typeInfo = getLeaveTypeInfo(lr.leave_type);
                return (
                  <div key={lr.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-300/50">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: getMemberColor(members, lr.member_id) }}
                    >
                      {getMemberName(members, lr.member_id).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{getMemberName(members, lr.member_id)}</p>
                      <p className="text-xs text-gray-400">{lr.start_date} – {lr.end_date}</p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{ backgroundColor: typeInfo.color + '22', color: typeInfo.color }}
                    >
                      {typeInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Public Holidays — full year */}
      <section className="bg-surface-200 rounded-2xl border border-surface-300 p-5">
        <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
          Public Holidays {currentYear}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(holidaysByMonth).map(([monthIdx, holidays]) => (
            <div key={monthIdx} className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {MONTH_NAMES[Number(monthIdx)]}
              </p>
              {holidays.map(h => {
                const isPast = h.date < today;
                const isToday = h.date === today;
                return (
                  <div
                    key={h.date}
                    className={`flex items-start gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                      isToday
                        ? 'bg-yellow-500/15 border border-yellow-500/30'
                        : isPast
                        ? 'opacity-40'
                        : 'bg-surface-300/40'
                    }`}
                  >
                    <span className="text-xs font-mono text-gray-400 pt-0.5 shrink-0 w-5">
                      {h.date.slice(8)}
                    </span>
                    <div>
                      <p className={`text-xs font-medium leading-snug ${isToday ? 'text-yellow-300' : 'text-gray-200'}`}>
                        {h.nameTh}
                      </p>
                      <p className="text-[11px] text-gray-500 leading-snug">{h.name}</p>
                    </div>
                    {isToday && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/30 text-yellow-300 font-medium shrink-0">Today</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

