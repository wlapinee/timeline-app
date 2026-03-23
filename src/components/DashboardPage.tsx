'use client';

import { useMemo, useState } from 'react';
import { TeamMember, LeaveRequest } from '@/types';
import { LEAVE_TYPES, formatDate, parseDate, addDays, isWeekend, isHoliday, getHoliday } from '@/lib/holidays';

interface Props {
  leaveRequests: LeaveRequest[];
  members: TeamMember[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
  const currentMonth = now.getMonth();

  const todayLeave = useMemo(() =>
    leaveRequests.filter(lr => lr.status !== 'rejected' && today >= lr.start_date && today <= lr.end_date),
    [leaveRequests, today]
  );

  const monthStart = `${now.getFullYear()}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(now.getFullYear(), currentMonth + 1, 0).getDate();
  const monthEnd = `${now.getFullYear()}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const monthLeave = useMemo(() =>
    leaveRequests.filter(lr => lr.status !== 'rejected' && lr.start_date <= monthEnd && lr.end_date >= monthStart),
    [leaveRequests, monthStart, monthEnd]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{ backgroundColor: typeInfo.color + '22', color: typeInfo.color }}>
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
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{ backgroundColor: typeInfo.color + '22', color: typeInfo.color }}>
                      {typeInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Leave Calendar */}
      <section className="bg-surface-200 rounded-2xl border border-surface-300 p-5">
        <LeaveCalendar leaveRequests={leaveRequests} members={members} today={today} />
      </section>
    </div>
  );
}

function LeaveCalendar({ leaveRequests, members, today }: {
  leaveRequests: LeaveRequest[];
  members: TeamMember[];
  today: string;
}) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  // Build leave map for any date
  const leaveMap = useMemo(() => {
    const map = new Map<string, { member: TeamMember | undefined; lr: LeaveRequest }[]>();
    leaveRequests
      .filter(lr => lr.status !== 'rejected')
      .forEach(lr => {
        let cur = parseDate(lr.start_date);
        const end = parseDate(lr.end_date);
        while (cur <= end) {
          const ds = formatDate(cur);
          if (!map.has(ds)) map.set(ds, []);
          map.get(ds)!.push({ member: members.find(m => m.id === lr.member_id), lr });
          cur = addDays(cur, 1);
        }
      });
    return map;
  }, [leaveRequests, members]);

  // Build full 6-row grid (42 cells) including overflow days
  type GridDay = { day: number; date: string; isCurrentMonth: boolean };
  const grid: GridDay[] = [];
  const pad = (n: number) => String(n).padStart(2, '0');

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const pm = viewMonth === 0 ? 12 : viewMonth;
    const py = viewMonth === 0 ? viewYear - 1 : viewYear;
    grid.push({ day: d, date: `${py}-${pad(pm)}-${pad(d)}`, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({ day: d, date: `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`, isCurrentMonth: true });
  }
  const remaining = 42 - grid.length;
  for (let d = 1; d <= remaining; d++) {
    const nm = viewMonth === 11 ? 1 : viewMonth + 2;
    const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
    grid.push({ day: d, date: `${ny}-${pad(nm)}-${pad(d)}`, isCurrentMonth: false });
  }

  const MAX_SHOW = 3;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent inline-block" />
          Leave Calendar
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-400 text-gray-400 hover:text-white transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span className="text-sm font-semibold text-white w-36 text-center">{MONTH_NAMES[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-400 text-gray-400 hover:text-white transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="border border-surface-400/30 rounded-xl overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-surface-400/30">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className={`text-center text-[11px] font-semibold py-2.5 ${i !== 6 ? 'border-r border-surface-400/30' : ''} ${i === 0 || i === 6 ? 'text-gray-600' : 'text-gray-400'}`}>
              {w}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {grid.map(({ day, date, isCurrentMonth }, i) => {
            const d = new Date(date + 'T00:00:00');
            const weekend = isWeekend(d);
            const holiday = isHoliday(date);
            const holidayInfo = getHoliday(date);
            const isToday = date === today;
            const leave = leaveMap.get(date) ?? [];
            const isLastCol = (i % 7) === 6;
            const isLastRow = i >= grid.length - 7;

            let cellBg = '';
            if (!isCurrentMonth) cellBg = 'bg-surface-100/10';
            else if (isToday) cellBg = 'bg-accent/5';
            else if (holiday) cellBg = 'bg-amber-500/5';
            else if (weekend) cellBg = 'bg-surface-100/5';

            return (
              <div
                key={`${date}-${i}`}
                className={`min-h-[100px] p-2 flex flex-col gap-1 ${cellBg}
                  ${!isLastCol ? 'border-r border-surface-400/30' : ''}
                  ${!isLastRow ? 'border-b border-surface-400/30' : ''}
                  ${isToday ? 'ring-1 ring-inset ring-accent/30' : ''}`}
              >
                {/* Day number row */}
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm font-semibold leading-none ${
                    !isCurrentMonth ? 'text-gray-700'
                    : isToday ? 'text-white'
                    : holiday ? 'text-amber-400'
                    : weekend ? 'text-gray-600'
                    : 'text-gray-300'
                  }`}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 text-accent uppercase tracking-wide">Today</span>
                  )}
                </div>

                {/* Holiday label */}
                {holidayInfo && isCurrentMonth && (
                  <p className="text-[9px] leading-tight text-amber-400/70 truncate">{holidayInfo.nameTh}</p>
                )}

                {/* Leave bars */}
                {isCurrentMonth && leave.slice(0, MAX_SHOW).map(({ member, lr }) => {
                  const color = member?.avatar_color ?? '#6B7280';
                  const typeInfo = getLeaveTypeInfo(lr.leave_type);
                  return (
                    <div key={lr.id} className="relative group">
                      <div
                        className="text-[11px] text-white/90 rounded px-1.5 py-0.5 truncate cursor-default leading-tight"
                        style={{ backgroundColor: color + '28', borderLeft: `3px solid ${color}` }}
                      >
                        {member?.name ?? 'Unknown'}
                      </div>
                      {/* Hover tooltip */}
                      <div className="pointer-events-none absolute bottom-full left-0 mb-1.5 hidden group-hover:block z-20 min-w-[140px]">
                        <div className="bg-surface-100 border border-surface-400 rounded-lg px-2.5 py-2 shadow-xl text-xs">
                          <p className="font-semibold text-white">{member?.name ?? 'Unknown'}</p>
                          <p className="text-gray-400 mt-0.5" style={{ color: typeInfo.color }}>{typeInfo.label}</p>
                          <p className="text-gray-500 mt-0.5 text-[10px]">{lr.start_date} – {lr.end_date}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isCurrentMonth && leave.length > MAX_SHOW && (
                  <p className="text-[10px] text-gray-500 px-1">+{leave.length - MAX_SHOW} more</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500/10 border border-amber-400/30 inline-block" />Public Holiday</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-surface-100/10 inline-block" />Weekend</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-accent/10 border border-accent/30 inline-block" />Today</span>
      </div>
    </div>
  );
}
