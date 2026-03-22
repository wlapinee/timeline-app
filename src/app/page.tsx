'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Page, Task, TeamMember, LeaveRequest } from '@/types';
import { formatDate, addDays, parseDate } from '@/lib/holidays';
import Navbar from '@/components/Navbar';
import GanttPage from '@/components/GanttPage';
import TeamPage from '@/components/TeamPage';
import LeavePage from '@/components/LeavePage';
import SetupModal from '@/components/SetupModal';

export default function Home() {
  const [page, setPage] = useState<Page>('gantt');
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  const [members, setMembersState] = useState<TeamMember[]>([]);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [leaveRequests, setLeaveRequestsState] = useState<LeaveRequest[]>([]);
  const [projectName, setProjectName] = useState('My Project');

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

  // Tasks — diff old vs new to detect add/update/delete
  const setTasks: React.Dispatch<React.SetStateAction<Task[]>> = useCallback((updater) => {
    setTasksState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      syncTasks(prev, next);
      return next;
    });
  }, []);

  const setMembers: React.Dispatch<React.SetStateAction<TeamMember[]>> = useCallback((updater) => {
    setMembersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      syncMembers(prev, next);
      return next;
    });
  }, []);

  const setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>> = useCallback((updater) => {
    setLeaveRequestsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      syncLeave(prev, next);
      return next;
    });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar page={page} setPage={setPage} onSetup={() => setShowSetup(true)} />

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
      </main>

      <SetupModal open={showSetup} onClose={() => setShowSetup(false)} />
    </div>
  );
}

// --- Sync helpers ---

function syncTasks(prev: Task[], next: Task[]) {
  const prevMap = new Map(prev.map(t => [t.id, t]));
  const nextMap = new Map(next.map(t => [t.id, t]));

  // Added or updated
  for (const t of next) {
    if (!prevMap.has(t.id)) {
      // New task — id was set optimistically, but we POST to get real UUID back
      fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) })
        .catch(console.error);
    } else if (JSON.stringify(prevMap.get(t.id)) !== JSON.stringify(t)) {
      fetch(`/api/tasks/${t.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) })
        .catch(console.error);
    }
  }

  // Deleted
  for (const t of prev) {
    if (!nextMap.has(t.id)) {
      fetch(`/api/tasks/${t.id}`, { method: 'DELETE' }).catch(console.error);
    }
  }
}

function syncMembers(prev: TeamMember[], next: TeamMember[]) {
  const prevMap = new Map(prev.map(m => [m.id, m]));
  const nextMap = new Map(next.map(m => [m.id, m]));

  for (const m of next) {
    if (!prevMap.has(m.id)) {
      fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) })
        .catch(console.error);
    } else if (JSON.stringify(prevMap.get(m.id)) !== JSON.stringify(m)) {
      fetch(`/api/members/${m.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) })
        .catch(console.error);
    }
  }

  for (const m of prev) {
    if (!nextMap.has(m.id)) {
      fetch(`/api/members/${m.id}`, { method: 'DELETE' }).catch(console.error);
    }
  }
}

function syncLeave(prev: LeaveRequest[], next: LeaveRequest[]) {
  const prevMap = new Map(prev.map(l => [l.id, l]));
  const nextMap = new Map(next.map(l => [l.id, l]));

  for (const l of next) {
    if (!prevMap.has(l.id)) {
      fetch('/api/leave', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(l) })
        .catch(console.error);
    } else if (JSON.stringify(prevMap.get(l.id)) !== JSON.stringify(l)) {
      fetch(`/api/leave/${l.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(l) })
        .catch(console.error);
    }
  }

  for (const l of prev) {
    if (!nextMap.has(l.id)) {
      fetch(`/api/leave/${l.id}`, { method: 'DELETE' }).catch(console.error);
    }
  }
}
