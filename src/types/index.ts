export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role: string;
  avatar_color: string;
}

export interface Task {
  id: string;
  project_id?: string;
  name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  progress: number;
  color: string;
  assignee_id?: string;
  sort_order: number;
}

export interface LeaveRequest {
  id: string;
  member_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Holiday {
  date: string;
  name: string;
  nameTh: string;
}

export type Page = 'gantt' | 'team' | 'leave';
