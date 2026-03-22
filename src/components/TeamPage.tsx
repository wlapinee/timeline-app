'use client';

import { useState, useMemo } from 'react';
import { TeamMember } from '@/types';
import { generateId, TASK_COLORS } from '@/lib/holidays';
import Modal from './Modal';

interface TeamProps {
  members: TeamMember[];
  setMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
}

export default function TeamPage({ members, setMembers }: TeamProps) {
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const defaultForm = (): Partial<TeamMember> => ({
    name: '', email: '', role: 'Member',
    avatar_color: TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)],
  });
  const [form, setForm] = useState<Partial<TeamMember>>(defaultForm());

  function openAdd() {
    setEditMember(null);
    setForm(defaultForm());
    setShowModal(true);
  }

  function openEdit(m: TeamMember) {
    setEditMember(m);
    setForm({ name: m.name, email: m.email || '', role: m.role, avatar_color: m.avatar_color });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name) return;
    if (editMember) {
      setMembers(prev => prev.map(m => m.id === editMember.id ? { ...m, ...form } as TeamMember : m));
    } else {
      setMembers(prev => [...prev, { ...form, id: generateId() } as TeamMember]);
    }
    setShowModal(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Team Members</h1>
          <p className="text-sm text-gray-500 mt-1">{members.length} members</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-dark text-white text-sm font-semibold shadow-md shadow-accent/30 hover:shadow-lg transition-shadow"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Member
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {members.map(m => (
          <div key={m.id} className="bg-surface-200 rounded-xl border border-surface-300 p-4 sm:p-5 flex items-center gap-4 group hover:border-surface-400 transition-colors">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${m.avatar_color}, ${m.avatar_color}88)` }}
            >
              {m.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm sm:text-base truncate">{m.name}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{m.role}</p>
              {m.email && <p className="text-[11px] sm:text-xs text-gray-600 font-mono mt-0.5 truncate">{m.email}</p>}
            </div>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100 md:opacity-0 md:group-hover:opacity-100">
              <button
                onClick={() => openEdit(m)}
                className="w-8 h-8 rounded-lg border border-surface-300 flex items-center justify-center text-gray-400 hover:text-white hover:bg-surface-300 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </button>
              <button
                onClick={() => setMembers(prev => prev.filter(x => x.id !== m.id))}
                className="w-8 h-8 rounded-lg border border-surface-300 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-950/50 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg font-medium">No team members yet</p>
          <p className="text-sm mt-1">Add your first team member to get started</p>
        </div>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editMember ? 'Edit Member' : 'Add Member'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Name</label>
            <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full px-3.5 py-2.5 rounded-lg border border-surface-400 bg-surface-100 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
            <input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="w-full px-3.5 py-2.5 rounded-lg border border-surface-400 bg-surface-100 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Role</label>
            <input value={form.role || ''} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Developer, Designer" className="w-full px-3.5 py-2.5 rounded-lg border border-surface-400 bg-surface-100 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Color</label>
            <div className="flex gap-2 flex-wrap">
              {TASK_COLORS.map(c => (
                <button key={c} onClick={() => setForm({ ...form, avatar_color: c })} className="w-8 h-8 rounded-lg transition-all" style={{ background: c, border: form.avatar_color === c ? '3px solid white' : '3px solid transparent' }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-surface-400/50">
          <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg bg-surface-400 text-gray-300 text-sm font-medium hover:bg-surface-400/80 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-accent to-accent-dark text-white text-sm font-semibold shadow-md shadow-accent/30">
            {editMember ? 'Update' : 'Add'} Member
          </button>
        </div>
      </Modal>
    </div>
  );
}
