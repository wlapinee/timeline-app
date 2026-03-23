'use client';

import { useState, useRef, useEffect } from 'react';
import { isWeekend, isHoliday, formatDate, parseDate, getHoliday } from '@/lib/holidays';

interface Props {
  value: string;
  onChange: (val: string) => void;
  hasError?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const grid: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= total; d++) grid.push(d);
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

export default function DatePickerInput({ value, onChange, hasError }: Props) {
  const initial = value ? parseDate(value) : new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function selectDay(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    const ds = formatDate(d);
    if (isWeekend(d) || isHoliday(ds)) return;
    onChange(ds);
    setOpen(false);
  }

  const days = getDays(viewYear, viewMonth);
  const today = formatDate(new Date());
  const displayDate = value
    ? parseDate(value).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full px-3.5 py-2.5 rounded-lg border bg-surface-100 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors ${
          hasError ? 'border-red-500 ring-1 ring-red-500/50' : 'border-surface-400'
        }`}
      >
        <span className={displayDate ? 'text-white' : 'text-gray-500'}>
          {displayDate || 'Select date'}
        </span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="opacity-40 flex-shrink-0 text-white">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 bg-surface-200 border border-surface-400 rounded-xl shadow-2xl p-3 w-64">
          {/* Month/year navigation */}
          <div className="flex items-center justify-between mb-2.5">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-400 text-gray-400 hover:text-white transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="text-sm font-semibold text-white">{MONTHS[viewMonth]} {viewYear}</span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-400 text-gray-400 hover:text-white transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={`text-center text-[10px] font-semibold py-1 ${i === 0 || i === 6 ? 'text-gray-600' : 'text-gray-500'}`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {days.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;

              const d = new Date(viewYear, viewMonth, day);
              const ds = formatDate(d);
              const weekend = isWeekend(d);
              const holiday = isHoliday(ds);
              const disabled = weekend || holiday;
              const selected = ds === value;
              const isToday = ds === today;
              const holidayInfo = getHoliday(ds);

              let cls = 'relative w-full aspect-square flex items-center justify-center text-xs rounded-lg transition-colors ';

              if (selected) {
                cls += 'bg-accent text-white font-bold';
              } else if (holiday) {
                cls += 'text-amber-400/60 bg-amber-500/10 cursor-not-allowed';
              } else if (weekend) {
                cls += 'text-gray-600 cursor-not-allowed';
              } else {
                cls += 'text-gray-300 hover:bg-surface-400 hover:text-white cursor-pointer';
                if (isToday) cls += ' ring-1 ring-inset ring-accent/60 text-accent font-semibold';
              }

              return (
                <div key={ds} className="relative group">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDay(day)}
                    className={cls}
                    title={holidayInfo?.name}
                  >
                    {day}
                    {holiday && !selected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400/60" />
                    )}
                  </button>
                  {/* Holiday tooltip */}
                  {holidayInfo && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10 whitespace-nowrap bg-surface-100 border border-surface-400 text-amber-300 text-[10px] rounded-md px-2 py-1 shadow-lg">
                      {holidayInfo.nameTh}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-2.5 pt-2 border-t border-surface-400/40 flex gap-4 text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 inline-block" />
              Holiday
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 inline-block" />
              Weekend
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
