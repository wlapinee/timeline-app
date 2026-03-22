import { pgTable, uuid, text, integer, date, timestamp, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
});

export const teamMembers = pgTable('team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  role: text('role').default('Member'),
  avatar_color: text('avatar_color').default('#3B82F6'),
  created_at: timestamp('created_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  project_id: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  start_date: date('start_date').notNull(),
  end_date: date('end_date').notNull(),
  progress: integer('progress').default(0),
  color: text('color').default('#3B82F6'),
  assignee_id: uuid('assignee_id').references(() => teamMembers.id, { onDelete: 'set null' }),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => [
  check('progress_range', sql`${table.progress} >= 0 AND ${table.progress} <= 100`),
]);

export const leaveRequests = pgTable('leave_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  member_id: uuid('member_id').notNull().references(() => teamMembers.id, { onDelete: 'cascade' }),
  leave_type: text('leave_type').notNull(),
  start_date: date('start_date').notNull(),
  end_date: date('end_date').notNull(),
  reason: text('reason'),
  status: text('status').default('pending'),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => [
  check('status_values', sql`${table.status} IN ('pending', 'approved', 'rejected')`),
]);
