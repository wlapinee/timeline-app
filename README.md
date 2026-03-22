# Timeline Manager

A project timeline management platform built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## Features

### 📊 Gantt Chart Timeline
- Interactive Gantt chart with horizontal scrolling
- Thai public holidays (2025-2026) auto-skip non-working days
- Weekends and holidays visually marked with distinct patterns
- Approved leave days synced and displayed on the chart
- Responsive: desktop shows full Gantt grid, mobile shows task cards
- Zoom controls (2W / 4W / 6W views)
- Click any task to edit

### 👥 Team Management
- Add, edit, and delete team members
- Assign members to tasks
- Color-coded avatars

### 📝 Leave Requests
- Submit leave requests with Thai leave types (ลาพักร้อน, ลาป่วย, ลากิจ, etc.)
- Approve/reject workflow
- Approved leaves automatically sync to the Gantt chart
- Working days calculation excludes weekends and holidays
- Filter by status (all/pending/approved/rejected)

### 📱 Responsive Design
- Full mobile support with touch-friendly UI
- Bottom-sheet style modals on mobile
- Card-based task view on mobile, Gantt grid on desktop
- Collapsible hamburger navigation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Fonts**: DM Sans, Noto Sans Thai, JetBrains Mono

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema (click "Supabase Setup" button in the app, or see `src/lib/supabase.ts`)
3. Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Note**: The app runs with demo data by default. Once you configure Supabase credentials, it will use live data.

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Tailwind directives + custom utilities
│   ├── layout.tsx       # Root layout with fonts
│   └── page.tsx         # Main page with state management
├── components/
│   ├── GanttPage.tsx    # Gantt chart + mobile card view
│   ├── LeavePage.tsx    # Leave request management
│   ├── Modal.tsx        # Reusable responsive modal
│   ├── Navbar.tsx       # Navigation with mobile hamburger
│   ├── SetupModal.tsx   # Supabase setup instructions
│   └── TeamPage.tsx     # Team member management
├── lib/
│   ├── demo-data.ts     # Demo data generator
│   ├── holidays.ts      # Thai holidays + date utilities
│   └── supabase.ts      # Supabase client + SQL schema
└── types/
    └── index.ts         # TypeScript interfaces
```
