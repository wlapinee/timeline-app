'use client';

import { useState } from 'react';
import Modal from './Modal';

const NEON_SQL = `-- Run this in Neon SQL Editor to initialize tables
-- (or call POST /api/setup to do it automatically)

CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'Member',
  avatar_color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  color TEXT DEFAULT '#3B82F6',
  assignee_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO projects (name, description)
VALUES ('My Project', 'Project timeline')
ON CONFLICT DO NOTHING;`;

export default function SetupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [setupStatus, setSetupStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  function handleCopy() {
    navigator.clipboard.writeText(NEON_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleAutoSetup() {
    setSetupStatus('loading');
    try {
      const res = await fetch('/api/setup', { method: 'POST' });
      setSetupStatus(res.ok ? 'ok' : 'error');
    } catch {
      setSetupStatus('error');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="NeonDB Setup" maxWidth="max-w-2xl">
      <p className="text-sm text-gray-400 mb-4">
        Connect your app to a NeonDB Postgres database.
      </p>

      <div className="bg-surface-100 rounded-xl p-4 text-sm text-gray-400 leading-relaxed space-y-2 mb-4">
        <p className="font-semibold text-white">Setup Steps:</p>
        <p>1. Create a free project at <span className="text-indigo-400">console.neon.tech</span></p>
        <p>2. Copy your connection string from the <strong className="text-white">Connect</strong> button</p>
        <p>3. Create a <code className="bg-surface-300 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code> file in the project root:</p>
        <pre className="bg-surface rounded-lg p-3 text-xs font-mono text-indigo-300 mt-1">
{`DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`}
        </pre>
        <p>4. Initialize tables — click the button below or run the SQL manually:</p>
      </div>

      <button
        onClick={handleAutoSetup}
        disabled={setupStatus === 'loading' || setupStatus === 'ok'}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold mb-4 transition-colors
          ${setupStatus === 'ok'
            ? 'bg-emerald-950 border border-emerald-700 text-emerald-400'
            : setupStatus === 'error'
            ? 'bg-red-950 border border-red-700 text-red-400'
            : 'bg-gradient-to-r from-accent to-accent-dark text-white shadow-md shadow-accent/30 hover:shadow-lg'}`}
      >
        {setupStatus === 'loading' ? 'Setting up...'
          : setupStatus === 'ok' ? '✓ Tables created successfully'
          : setupStatus === 'error' ? '✗ Failed — check DATABASE_URL'
          : 'Auto-setup tables (POST /api/setup)'}
      </button>

      <details className="group">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition-colors select-none">
          Or run SQL manually
        </summary>
        <div className="relative mt-2">
          <pre className="bg-surface p-4 rounded-xl border border-surface-300 text-xs font-mono text-indigo-300 overflow-auto max-h-64 leading-relaxed">
            {NEON_SQL}
          </pre>
          <button
            onClick={handleCopy}
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors
              ${copied
                ? 'border-emerald-700 bg-emerald-950 text-emerald-400'
                : 'border-surface-400 bg-surface-300 text-gray-400 hover:text-white'}`}
          >
            {copied ? 'Copied!' : 'Copy SQL'}
          </button>
        </div>
      </details>

      <div className="flex justify-end mt-5 pt-4 border-t border-surface-400/50">
        <button onClick={onClose} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-accent to-accent-dark text-white text-sm font-semibold shadow-md shadow-accent/30">
          Got it
        </button>
      </div>
    </Modal>
  );
}
