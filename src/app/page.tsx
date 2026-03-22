'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Page, Task, TeamMember, LeaveRequest } from '@/types';
import { formatDate, addDays, parseDate } from '@/lib/holidays';
import Navbar from '@/components/Navbar';
import GanttPage from '@/components/GanttPage';
import TeamPage from '@/components/TeamPage';
import LeavePage from '@/components/LeavePage';
import DashboardPage from '@/components/DashboardPage';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function Home() {
  const [page, setPage] = useState<Page>('dashboard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [members, setMembersState] = useState<TeamMember[]>([]);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [leaveRequests, setLeaveRequestsState] = useState<LeaveRequest[]>([]);
  const [projectName, setProjectName] = useState('My Project');

  const membersRef = useRef<TeamMember[]>([]);
  const tasksRef = useRef<Task[]>([]);
  const leaveRef = useRef<LeaveRequest[]>([]);
  membersRef.current = members;
  tasksRef.current = tasks;
  leaveRef.current = leaveRequests;

  // Load all data from DB on mount
  const loadData = useCallback(async () => {
    try {
      const [membersRes, tasksRes, leaveRes, projectRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/tasks'),
        fetch('/api/leave'),
        fetch('/api/projects'),
      ]);
      const [membersData, tasksData, leaveData, projectData] = await Promise.all([
        membersRes.json(),
        tasksRes.json(),
        leaveRes.json(),
        projectRes.json(),
      ]);
      if (Array.isArray(membersData)) setMembersState(membersData);
      if (Array.isArray(tasksData)) setTasksState(tasksData);
      if (Array.isArray(leaveData)) setLeaveRequestsState(leaveData);
      if (projectData?.name) setProjectName(projectData.name);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Tasks — sync runs outside the state updater to avoid React StrictMode double-invoke
  const setTasks: React.Dispatch<React.SetStateAction<Task[]>> = useCallback((updater) => {
    const prev = tasksRef.current;
    const next = typeof updater === 'function' ? updater(prev) : updater;
    tasksRef.current = next;
    setTasksState(next);
    setSaving(true);
    syncTasks(prev, next).finally(() => setSaving(false));
  }, []);

  const setMembers: React.Dispatch<React.SetStateAction<TeamMember[]>> = useCallback((updater) => {
    const prev = membersRef.current;
    const next = typeof updater === 'function' ? updater(prev) : updater;
    membersRef.current = next;
    setMembersState(next);
    setSaving(true);
    syncMembers(prev, next).finally(() => setSaving(false));
  }, []);

  const setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>> = useCallback((updater) => {
    const prev = leaveRef.current;
    const next = typeof updater === 'function' ? updater(prev) : updater;
    leaveRef.current = next;
    setLeaveRequestsState(next);
    setSaving(true);
    syncLeave(prev, next).finally(() => setSaving(false));
  }, []);

  // Build set of approved leave day strings for gantt overlay
  const approvedLeaveDays = useMemo(() => {
    const set = new Set<string>();
    leaveRequests
      .filter(lr => lr.status === 'approved')
      .forEach(lr => {
        let cur = parseDate(lr.start_date);
        const end = parseDate(lr.end_date);
        while (cur <= end) {
          set.add(`${lr.member_id}:${formatDate(cur)}`);
          cur = addDays(cur, 1);
        }
      });
    return set;
  }, [leaveRequests]);

  if (loading) return <LoadingOverlay message="Loading..." />;

  return (
    <div className="min-h-screen">
      {saving && <LoadingOverlay message="Saving..." />}
      <Navbar page={page} setPage={setPage} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {page === 'gantt' && (
          <GanttPage
            tasks={tasks}
            setTasks={setTasks}
            members={members}
            projectName={projectName}
            approvedLeaveDays={approvedLeaveDays}
            leaveRequests={leaveRequests}
          />
        )}
        {page === 'team' && (
          <TeamPage members={members} setMembers={setMembers} />
        )}
        {page === 'leave' && (
          <LeavePage
            leaveRequests={leaveRequests}
            setLeaveRequests={setLeaveRequests}
            members={members}
          />
        )}
        {page === 'dashboard' && (
          <DashboardPage
            leaveRequests={leaveRequests}
            members={members}
          />
        )}
      </main>

    </div>
  );
}

// --- Sync helpers ---

async function syncTasks(prev: Task[], next: Task[]): Promise<void> {
  const prevMap = new Map(prev.map(t => [t.id, t]));
  const nextMap = new Map(next.map(t => [t.id, t]));
  const promises: Promise<unknown>[] = [];

  for (const t of next) {
    if (!prevMap.has(t.id)) {
      promises.push(fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) }));
    } else if (JSON.stringify(prevMap.get(t.id)) !== JSON.stringify(t)) {
      promises.push(fetch(`/api/tasks/${t.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) }));
    }
  }
  for (const t of prev) {
    if (!nextMap.has(t.id)) {
      promises.push(fetch(`/api/tasks/${t.id}`, { method: 'DELETE' }));
    }
  }
  await Promise.all(promises);
}

async function syncMembers(prev: TeamMember[], next: TeamMember[]): Promise<void> {
  const prevMap = new Map(prev.map(m => [m.id, m]));
  const nextMap = new Map(next.map(m => [m.id, m]));
  const promises: Promise<unknown>[] = [];

  for (const m of next) {
    if (!prevMap.has(m.id)) {
      promises.push(fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) }));
    } else if (JSON.stringify(prevMap.get(m.id)) !== JSON.stringify(m)) {
      promises.push(fetch(`/api/members/${m.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) }));
    }
  }
  for (const m of prev) {
    if (!nextMap.has(m.id)) {
      promises.push(fetch(`/api/members/${m.id}`, { method: 'DELETE' }));
    }
  }
  await Promise.all(promises);
}

async function syncLeave(prev: LeaveRequest[], next: LeaveRequest[]): Promise<void> {
  const prevMap = new Map(prev.map(l => [l.id, l]));
  const nextMap = new Map(next.map(l => [l.id, l]));
  const promises: Promise<unknown>[] = [];

  for (const l of next) {
    if (!prevMap.has(l.id)) {
      promises.push(fetch('/api/leave', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(l) }));
    } else if (JSON.stringify(prevMap.get(l.id)) !== JSON.stringify(l)) {
      promises.push(fetch(`/api/leave/${l.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(l) }));
    }
  }
  for (const l of prev) {
    if (!nextMap.has(l.id)) {
      promises.push(fetch(`/api/leave/${l.id}`, { method: 'DELETE' }));
    }
  }
  await Promise.all(promises);
}
