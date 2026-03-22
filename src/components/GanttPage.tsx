'use client';

import { useState, useMemo, useRef } from 'react';
import { Task, TeamMember, LeaveRequest } from '@/types';
import {
  formatDate, parseDate, addDays, diffDays, isWeekend, isHoliday,
  getHoliday, getWorkingDays, getHolidaysInRange, generateId,
  TASK_COLORS, LEAVE_TYPES, THAI_HOLIDAYS,
} from '@/lib/holidays';
import Modal from './Modal';

interface GanttProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  members: TeamMember[];
  projectName: string;
  approvedLeaveDays: Set<string>;
  leaveRequests: LeaveRequest[];
}

export default function GanttPage({ tasks, setTasks, members, projectName, approvedLeaveDays, leaveRequests }: GanttProps) {
  const [viewStart, setViewStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 5); return d;
  });
  const [daysToShow, setDaysToShow] = useState(28);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Responsive cell sizes
  const CELL_W = 36;
  const ROW_H = 42;

  const dates = useMemo(() =>
    Array.from({ length: daysToShow }, (_, i) => addDays(viewStart, i)),
    [viewStart, daysToShow]
  );

  const months = useMemo(() => {
    const m: { index: number; date: Date; key: string }[] = [];
    let cur = '';
    dates.forEach((d, i) => {
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (k !== cur) { m.push({ index: i, date: d, key: k }); cur = k; }
    });
    return m;
  }, [dates]);

  const todayStr = formatDate(new Date());
  const todayIndex = diffDays(viewStart, new Date());

  function handleSave(task: Task) {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    } else {
      setTasks(prev => [...prev, { ...task, id: generateId(), sort_order: prev.length }]);
    }
    setEditingTask(null);
    setShowAddTask(false);
  }

  function handleDelete(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
    setEditingTask(null);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{projectName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tasks.length} tasks · {members.length} members
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom */}
          <div className="flex gap-0.5 bg-surface-200 rounded-lg p-0.5 border border-surface-300">
            {[{ d: 14, l: '2W' }, { d: 28, l: '4W' }, { d: 42, l: '6W' }].map(({ d, l }) => (
              <button
                key={d}
                onClick={() => setDaysToShow(d)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${daysToShow === d ? 'bg-surface-300 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Nav */}
          <div className="flex gap-1">
            <button onClick={() => setViewStart(addDays(viewStart, -7))} className="w-8 h-8 rounded-lg border border-surface-300 bg-surface-200 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button onClick={() => { const d = new Date(); d.setDate(d.getDate() - 5); setViewStart(d); }} className="px-3 h-8 rounded-lg border border-surface-300 bg-surface-200 text-gray-400 hover:text-white text-xs font-medium transition-colors">
              Today
            </button>
            <button onClick={() => setViewStart(addDays(viewStart, 7))} className="w-8 h-8 rounded-lg border border-surface-300 bg-surface-200 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-dark text-white text-sm font-semibold shadow-md shadow-accent/30 hover:shadow-lg transition-shadow"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm holiday-stripe border border-red-900/30" />Holiday
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-surface-100 border border-surface-300" />Weekend
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm leave-stripe border border-purple-900/30" />On Leave
        </span>
      </div>

      {/* MOBILE: Card view */}
      <div className="block lg:hidden space-y-2">
        {tasks.map(task => {
          const assignee = members.find(m => m.id === task.assignee_id);
          const workDays = getWorkingDays(parseDate(task.start_date), parseDate(task.end_date));
          const holidays = getHolidaysInRange(task.start_date, task.end_date);
          return (
            <div
              key={task.id}
              onClick={() => setEditingTask(task)}
              className="bg-surface-200 rounded-xl border border-surface-300 p-4 active:bg-surface-300 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: task.color }} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{task.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      {assignee && (
                        <span className="flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: assignee.avatar_color }}>
                            {assignee.name[0]}
                          </span>
                          {assignee.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono flex-shrink-0 ${task.progress === 100 ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {task.progress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-surface-300 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${task.progress}%`, background: task.color }} />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                <span>{task.start_date} → {task.end_date}</span>
                <span>{workDays} work days</span>
              </div>

              {holidays.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {holidays.map(h => (
                    <span key={h.date} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                      {h.nameTh}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DESKTOP: Gantt chart */}
      <div className="hidden lg:block bg-surface-200 rounded-2xl border border-surface-300 overflow-hidden relative">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]">
          <div className="flex" style={{ minWidth: 260 + daysToShow * CELL_W }}>
            {/* Left labels */}
            <div className="w-[260px] flex-shrink-0 border-r border-surface-300 bg-surface-100 z-10 sticky left-0">
              <div className="h-8 border-b border-surface-300" />
              <div className="h-10 border-b border-surface-300 flex items-center px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tasks
              </div>
              {tasks.map(task => {
                const assignee = members.find(m => m.id === task.assignee_id);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-2.5 px-3 cursor-pointer hover:bg-surface-200/50 transition-colors"
                    style={{ height: ROW_H }}
                    onClick={() => setEditingTask(task)}
                  >
                    <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: task.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white truncate">{task.name}</p>
                      {assignee && (
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ background: assignee.avatar_color }}>
                            {assignee.name[0]}
                          </span>
                          {assignee.name}
                        </p>
                      )}
                    </div>
                    <span className={`text-[11px] font-bold font-mono ${task.progress === 100 ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {task.progress}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Right grid */}
            <div className="flex-1">
              {/* Months */}
              <div className="flex h-8 border-b border-surface-300">
                {months.map((m, i) => {
                  const next = months[i + 1];
                  const span = (next ? next.index : daysToShow) - m.index;
                  return (
                    <div key={m.key} className="flex items-center justify-center text-xs font-semibold text-gray-400 border-r border-surface-300" style={{ width: span * CELL_W }}>
                      {m.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  );
                })}
              </div>

              {/* Day headers */}
              <div className="flex h-10 border-b border-surface-300">
                {dates.map((d, i) => {
                  const ds = formatDate(d);
                  const isToday = ds === todayStr;
                  const holiday = getHoliday(ds);
                  const weekend = isWeekend(d);
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center relative"
                      style={{ width: CELL_W }}
                      onMouseEnter={e => {
                        if (holiday) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({ x: rect.left, y: rect.bottom + 4, text: `${holiday.name}\n${holiday.nameTh}` });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <span className={`text-[10px] uppercase tracking-wider ${isToday ? 'text-accent font-bold' : holiday ? 'text-red-400' : weekend ? 'text-gray-600' : 'text-gray-500'}`}>
                        {d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                      </span>
                      <span className={`text-[11px] font-mono font-semibold ${isToday ? 'text-accent' : holiday ? 'text-red-400' : weekend ? 'text-gray-600' : 'text-gray-400'}`}>
                        {d.getDate()}
                      </span>
                      {holiday && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-red-500" />}
                    </div>
                  );
                })}
              </div>

              {/* Task rows */}
              {tasks.map(task => {
                const startDate = parseDate(task.start_date);
                const endDate = parseDate(task.end_date);
                const left = diffDays(viewStart, startDate) * CELL_W;
                const width = (diffDays(startDate, endDate) + 1) * CELL_W;

                return (
                  <div key={task.id} className="relative" style={{ height: ROW_H }}>
                    {/* Grid bg cells */}
                    {dates.map((d, i) => {
                      const ds = formatDate(d);
                      const weekend = isWeekend(d);
                      const holiday = isHoliday(ds);
                      const onLeave = task.assignee_id && approvedLeaveDays.has(`${task.assignee_id}:${ds}`);
                      const isToday = ds === todayStr;
                      let cls = 'gantt-grid-line';
                      if (isToday) cls += ' today-bg';
                      else if (holiday) cls += ' holiday-stripe';
                      else if (onLeave) cls += ' leave-stripe';
                      else if (weekend) cls += ' weekend-bg';
                      return <div key={i} className={`absolute top-0 ${cls}`} style={{ left: i * CELL_W, width: CELL_W, height: ROW_H }} />;
                    })}

                    {/* Today line */}
                    {todayIndex >= 0 && todayIndex < daysToShow && (
                      <div className="absolute top-0 w-0.5 bg-accent/40 z-[2]" style={{ left: todayIndex * CELL_W + CELL_W / 2, height: ROW_H }} />
                    )}

                    {/* Task bar */}
                    <div
                      className="absolute z-[3] rounded-md cursor-pointer hover:brightness-110 transition-all group"
                      style={{
                        left: left + 2, top: 7, height: ROW_H - 14,
                        width: Math.max(width - 4, 6),
                        background: `linear-gradient(135deg, ${task.color}cc, ${task.color}99)`,
                        boxShadow: `0 2px 8px ${task.color}33`,
                      }}
                      onClick={() => setEditingTask(task)}
                    >
                      <div className="absolute inset-y-0 left-0 rounded-md transition-all" style={{ width: `${task.progress}%`, background: task.color }} />
                      {width > 70 && (
                        <span className="relative z-[1] text-[11px] font-semibold text-white pl-2 leading-[28px] whitespace-nowrap drop-shadow-sm">
                          {task.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-surface-300 text-white px-3 py-2 rounded-lg text-xs border border-surface-400 shadow-xl whitespace-pre-line pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming holidays */}
        <div className="bg-surface-200 rounded-xl border border-surface-300 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <span className="text-red-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
            </span>
            Upcoming Thai Holidays
          </h3>
          <div className="space-y-1.5">
            {THAI_HOLIDAYS.filter(h => parseDate(h.date) >= new Date()).slice(0, 5).map(h => (
              <div key={h.date} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-100 text-sm">
                <div className="min-w-0">
                  <span className="font-medium text-white text-[13px]">{h.name}</span>
                  <span className="text-gray-500 text-xs ml-2">{h.nameTh}</span>
                </div>
                <span className="text-xs font-mono text-gray-400 flex-shrink-0 ml-2">
                  {parseDate(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Approved leaves */}
        <div className="bg-surface-200 rounded-xl border border-surface-300 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <span className="text-purple-400">📋</span>
            Approved Leaves on Timeline
          </h3>
          <div className="space-y-1.5">
            {leaveRequests.filter(lr => lr.status === 'approved').map(lr => {
              const member = members.find(m => m.id === lr.member_id);
              const lt = LEAVE_TYPES.find(t => t.value === lr.leave_type);
              return (
                <div key={lr.id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-100 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: member?.avatar_color }}>
                      {member?.name[0]}
                    </span>
                    <span className="font-medium text-white text-[13px] truncate">{member?.name}</span>
                    <span className="text-[11px] flex-shrink-0" style={{ color: lt?.color }}>{lt?.label}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-400 flex-shrink-0 ml-2">
                    {lr.start_date === lr.end_date
                      ? parseDate(lr.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : `${parseDate(lr.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${parseDate(lr.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </span>
                </div>
              );
            })}
            {leaveRequests.filter(lr => lr.status === 'approved').length === 0 && (
              <p className="text-gray-600 text-sm text-center py-6">No approved leaves</p>
            )}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskFormModal
        open={!!editingTask || showAddTask}
        task={editingTask}
        members={members}
        onSave={handleSave}
        onDelete={editingTask ? () => handleDelete(editingTask.id) : undefined}
        onClose={() => { setEditingTask(null); setShowAddTask(false); }}
      />
    </div>
  );
}

// Task form modal
function TaskFormModal({ open, task, members, onSave, onDelete, onClose }: {
  open: boolean;
  task: Task | null;
  members: TeamMember[];
  onSave: (t: Task) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const defaults: Task = {
    id: '', name: '', start_date: formatDate(new Date()),
    end_date: formatDate(addDays(new Date(), 7)), progress: 0,
    color: TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)],
    assignee_id: '', sort_order: 0,
  };
  const [form, setForm] = useState<Task>(task || defaults);

  // Reset form when task changes
  const key = task?.id || 'new';
  useMemo(() => { setForm(task || { ...defaults, color: TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)] }); }, [key]);

  const holidays = form.start_date && form.end_date ? getHolidaysInRange(form.start_date, form.end_date) : [];
  const workDays = form.start_date && form.end_date ? getWorkingDays(parseDate(form.start_date), parseDate(form.end_date)) : 0;

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit Task' : 'New Task'}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Task Name</label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Enter task name..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-surface-400 bg-surface-100 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Start Date</label>
            <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg border border-surface-400 bg-surface-100 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">End Date</label>
            <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg border border-surface-400 bg-surface-100 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Progress: {form.progress}%</label>
          <input type="range" min={0} max={100} value={form.progress} onChange={e => setForm({ ...form, progress: +e.target.value })} className="w-full accent-accent" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Assignee</label>
          <select value={form.assignee_id || ''} onChange={e => setForm({ ...form, assignee_id: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg border border-surface-400 bg-surface-100 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
            <option value="">Unassigned</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Color</label>
          <div className="flex gap-2 flex-wrap">
            {TASK_COLORS.map(c => (
              <button key={c} onClick={() => setForm({ ...form, color: c })} className="w-8 h-8 rounded-lg transition-all" style={{ background: c, border: form.color === c ? '3px solid white' : '3px solid transparent' }} />
            ))}
          </div>
        </div>

        {/* Working days info */}
        <div className="bg-surface-100 rounded-xl p-3 text-sm text-gray-400">
          <strong className="text-white">{workDays}</strong> working days (excl. weekends &amp; holidays)
          {holidays.length > 0 && (
            <div className="mt-2 text-xs">
              <span className="text-red-400">Holidays in range:</span>
              {holidays.map(h => (
                <div key={h.date} className="ml-2 mt-0.5">• {h.name} ({h.nameTh}) — {h.date}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-6 pt-4 border-t border-surface-400/50">
        {onDelete ? (
          <button onClick={onDelete} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-red-950 text-red-300 text-sm font-medium hover:bg-red-900 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            Delete
          </button>
        ) : <div />}
        <div className="flex gap-2">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg bg-surface-400 text-gray-300 text-sm font-medium hover:bg-surface-400/80 transition-colors">Cancel</button>
          <button
            onClick={() => { if (form.name && form.start_date && form.end_date) onSave(form); }}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-accent to-accent-dark text-white text-sm font-semibold shadow-md shadow-accent/30 hover:shadow-lg transition-shadow"
          >
            {task ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
