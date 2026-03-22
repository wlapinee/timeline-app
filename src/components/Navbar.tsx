'use client';

import { Page } from '@/types';
import { useState } from 'react';

interface NavProps {
  page: Page;
  setPage: (p: Page) => void;
}

const NAV_ITEMS: { key: Page; label: string; icon: React.ReactNode }[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: 'team',
    label: 'Team',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'leave',
    label: 'Leave',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

export default function Navbar({ page, setPage }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-b from-surface-200 to-surface sticky top-0 z-40 border-b border-surface-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center font-bold text-sm sm:text-base text-white">
            TL
          </div>
          <span className="text-base sm:text-lg font-semibold tracking-tight text-white">Timeline</span>
          <span className="hidden sm:inline text-[11px] px-2 py-0.5 rounded-md bg-surface-300 text-gray-400 font-medium">v1.0</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-0.5 bg-surface-200 rounded-xl p-1 border border-surface-300">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all
                ${page === item.key
                  ? 'bg-gradient-to-r from-accent to-accent-dark text-white shadow-md shadow-accent/30'
                  : 'text-gray-400 hover:text-gray-200'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-surface-300 transition-colors"
        >
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-300 bg-surface-200 px-4 py-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => { setPage(item.key); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${page === item.key
                  ? 'bg-gradient-to-r from-accent to-accent-dark text-white'
                  : 'text-gray-400 hover:bg-surface-300'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
