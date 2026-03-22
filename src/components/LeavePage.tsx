'use client';

import { useState, useMemo } from 'react';
import { LeaveRequest, TeamMember } from '@/types';
import { formatDate, parseDate, getWorkingDays, getHolidaysInRange, generateId, LEAVE_TYPES, LEAVE_STATUS, diffDays } from '@/lib/holidays';
import Modal from './Modal';

interface LeaveProps {
  leaveRequests: LeaveRequest[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  members: TeamMember[];
}

export default function LeavePage({ leaveRequests, setLeaveRequests, members }: LeaveProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const defaultForm = (): Partial<LeaveRequest> => ({
    member_id: '', leave_type: 'annual', start_date: formatDate(new Date()),
    end_date: formatDate(new Date()), reason: '',
  });
  const [form, setForm] = useState<Partial<LeaveRequest>>(defaultForm());

  function handleSubmit() {
    if (!form.member_id || !form.start_date || !form.end_date) return;
    setLeaveRequests(prev => [...prev, { ...form, id: generateId(), status: 'pending' } as LeaveRequest]);
    setForm(defaultForm());
    setShowAdd(false);
  }

  function handleStatus(id: string, status: 'approved' | 'rejected') {
    setLeaveRequests(prev => prev.map(lr => lr.id === id ? { ...lr, status } : lr));
  }

  const filtered = filter === 'all' ? leaveRequests : leaveRequests.filter(lr => lr.status === filter);
  const pendingCount = leaveRequests.filter(l => l.status === 'pending').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Leave Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            {leaveRequests.length} total · {pendingCount} pending
          </p>
        </div>
        <button
          onClick={() => { setForm(defaultForm()); setShowAdd(true); }}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-dark text-white text-sm font-semibold shadow-md shadow-accent/30 hover:shadow-lg transition-shadow"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Submit Request
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-surface-200 rounded-xl p-1 border border-surface-300 overflow-x-auto w-fit max-w-full">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize whitespace-nowrap transition-colors
              ${filter === f ? 'bg-surface-300 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {f}
            <span className="ml-1 opacity-50">
              ({f === 'all' ? leaveRequests.length : leaveRequests.filter(l => l.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Request cards */}
      <div className="space-y-2.5">
        {filtered.map(lr => {
          const member = members.find(m => m.id === lr.member_id);
          const lt = LEAVE_TYPES.find(t => t.value === lr.leave_type);
          const st = LEAVE_STATUS[lr.status];
          const totalDays = diffDays(parseDate(lr.start_date), parseDate(lr.end_date)) + 1;
          const workDays = getWorkingDays(parseDate(lr.start_date), parseDate(lr.end_date));

          return (
            <div key={lr.id} className="bg-surface-200 rounded-xl border border-surface-300 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-base sm:text-lg font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${member?.avatar_color || '#64748B'}, ${member?.avatar_color || '#64748B'}88)` }}
                  >
                    {member?.name[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white text-sm sm:text-[15px]">{member?.name || 'Unknown'}</span>
                      <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-md font-medium" style={{ background: lt?.color + '22', color: lt?.color }}>
                        {lt?.label}
                      </span>
                      <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-md font-semibold" style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs sm:text-[13px] text-gray-500">
                      <span className="font-mono">
                        {parseDate(lr.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {lr.start_date !== lr.end_date && ` – ${parseDate(lr.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </span>
                      <span>{totalDays} day{totalDays > 1 ? 's' : ''} ({workDays} working)</span>
                    </div>
                    {lr.reason && <p className="text-xs text-gray-600 mt-1">{lr.reason}</p>}
                  </div>
                </div>

                {lr.status === 'pending' && (
                  <div className="flex gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleStatus(lr.id, 'approved')}
                      className="flex items-center gap-1.5 px-3 py-2 sm:px-2 sm:py-2 rounded-lg border border-green-800 bg-green-950 text-green-400 hover:bg-green-900 transition-colors text-xs sm:text-sm font-medium"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                      <span className="sm:hidden">Approve</span>
                    </button>
                    <button
                      onClick={() => handleStatus(lr.id, 'rejected')}
                      className="flex items-center gap-1.5 px-3 py-2 sm:px-2 sm:py-2 rounded-lg border border-red-800 bg-red-950 text-red-400 hover:bg-red-900 transition-colors text-xs sm:text-sm font-medium"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      <span className="sm:hidden">Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <p className="text-lg font-medium">No leave requests</p>
            <p className="text-sm mt-1">Submit a new request to get started</p>
          </div>
        )}
      </div>

      {/* Submit Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Submit Leave Request">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Team Member</label>
            <select value={form.member_id || ''} onChange={e => setForm({ ...form, member_id: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg border border-surface-400 bg-surface-100 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
              <option value="">Select member...</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Leave Type</label>
            <select value={form.leave_type || 'annual'} onChange={e => setForm({ ...form, leave_type: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg border border-surface-400 bg-surface-100 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
              {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} ({t.labelTh})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Start Date</label>
              <input type="date" value={form.start_date || ''} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg border border-surface-400 bg-surface-100 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">End Date</label>
              <input type="date" value={form.end_date || ''} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg border border-surface-400 bg-surface-100 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
          </div>

          {/* Info box */}
          {form.start_date && form.end_date && (
            <div className="bg-surface-100 rounded-xl p-3 text-sm text-gray-400">
              <strong className="text-white">{getWorkingDays(parseDate(form.start_date), parseDate(form.end_date))}</strong> working days will be used
              {(() => {
                const holidays = getHolidaysInRange(form.start_date, form.end_date);
                if (holidays.length > 0) {
                  return (
                    <div className="mt-1.5 text-xs text-amber-400">
                      ⚠ Range includes holidays (not counted): {holidays.map(h => h.name).join(', ')}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Reason (optional)</label>
            <textarea value={form.reason || ''} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for leave..." rows={3} className="w-full px-3.5 py-2.5 rounded-lg border border-surface-400 bg-surface-100 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y" />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-surface-400/50">
          <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-lg bg-surface-400 text-gray-300 text-sm font-medium hover:bg-surface-400/80 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-accent to-accent-dark text-white text-sm font-semibold shadow-md shadow-accent/30">
            Submit Request
          </button>
        </div>
      </Modal>
    </div>
  );
}
