import { TeamMember, Task, LeaveRequest } from '@/types';
import { formatDate, addDays } from './holidays';

export function createDemoData() {
  const members: TeamMember[] = [
    { id: 'm1', name: 'Somchai K.', email: 'somchai@example.com', role: 'Lead Developer', avatar_color: '#3B82F6' },
    { id: 'm2', name: 'Nattaya P.', email: 'nattaya@example.com', role: 'Designer', avatar_color: '#EC4899' },
    { id: 'm3', name: 'Wichai S.', email: 'wichai@example.com', role: 'Backend Dev', avatar_color: '#10B981' },
    { id: 'm4', name: 'Ploy R.', email: 'ploy@example.com', role: 'QA Engineer', avatar_color: '#F59E0B' },
    { id: 'm5', name: 'Krit T.', email: 'krit@example.com', role: 'DevOps', avatar_color: '#8B5CF6' },
  ];

  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 5);

  const tasks: Task[] = [
    { id: 't1', name: 'UI/UX Design', start_date: formatDate(start), end_date: formatDate(addDays(start, 8)), progress: 80, color: '#EC4899', assignee_id: 'm2', sort_order: 0 },
    { id: 't2', name: 'API Development', start_date: formatDate(addDays(start, 3)), end_date: formatDate(addDays(start, 14)), progress: 45, color: '#10B981', assignee_id: 'm3', sort_order: 1 },
    { id: 't3', name: 'Frontend Build', start_date: formatDate(addDays(start, 7)), end_date: formatDate(addDays(start, 20)), progress: 20, color: '#3B82F6', assignee_id: 'm1', sort_order: 2 },
    { id: 't4', name: 'Integration Testing', start_date: formatDate(addDays(start, 18)), end_date: formatDate(addDays(start, 25)), progress: 0, color: '#F59E0B', assignee_id: 'm4', sort_order: 3 },
    { id: 't5', name: 'Database Migration', start_date: formatDate(addDays(start, 2)), end_date: formatDate(addDays(start, 6)), progress: 100, color: '#8B5CF6', assignee_id: 'm5', sort_order: 4 },
    { id: 't6', name: 'CI/CD Pipeline', start_date: formatDate(addDays(start, 5)), end_date: formatDate(addDays(start, 10)), progress: 60, color: '#06B6D4', assignee_id: 'm5', sort_order: 5 },
    { id: 't7', name: 'UAT', start_date: formatDate(addDays(start, 22)), end_date: formatDate(addDays(start, 28)), progress: 0, color: '#F97316', assignee_id: 'm4', sort_order: 6 },
  ];

  const leaveRequests: LeaveRequest[] = [
    { id: 'l1', member_id: 'm2', leave_type: 'annual', start_date: formatDate(addDays(today, 10)), end_date: formatDate(addDays(today, 12)), reason: 'Family vacation', status: 'approved' },
    { id: 'l2', member_id: 'm1', leave_type: 'sick', start_date: formatDate(addDays(today, -2)), end_date: formatDate(addDays(today, -1)), reason: 'Not feeling well', status: 'approved' },
    { id: 'l3', member_id: 'm3', leave_type: 'personal', start_date: formatDate(addDays(today, 15)), end_date: formatDate(addDays(today, 15)), reason: 'Personal errand', status: 'pending' },
  ];

  return { members, tasks, leaveRequests, project: { id: 'p1', name: '7-Eleven App Redesign' } };
}
