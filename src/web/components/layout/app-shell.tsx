'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import {
  LayoutDashboard,
  ClipboardList,
  Library,
  FileStack,
  Users,
  Target,
  Calendar,
  Settings,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sessions', label: 'Sessions', icon: ClipboardList },
  { href: '/drills', label: 'Drill Library', icon: Library },
  { href: '/templates', label: 'Templates', icon: FileStack },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/tactical-board', label: 'Tactical Board', icon: Target },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface AppShellProps {
  user: User | null;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-56'
        } shrink-0 bg-[#0f172a] border-r border-white/10 flex flex-col transition-all duration-200`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
            <Target size={18} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold text-white truncate">Session Planner</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/10 p-2 space-y-1">
          {user ? (
            <>
              {!collapsed && (
                <div className="px-3 py-2 text-xs text-white/40 truncate">
                  {user.email}
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/60 hover:text-red-400 hover:bg-red-500/10 w-full transition-colors"
                title="Sign out"
              >
                <LogOut size={18} className="shrink-0" />
                {!collapsed && <span>Sign Out</span>}
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/60 hover:text-emerald-400 hover:bg-emerald-500/10 w-full transition-colors"
              title="Sign in"
            >
              <LogIn size={18} className="shrink-0" />
              {!collapsed && <span>Sign In</span>}
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/40 hover:text-white/60 w-full transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-[#0f172a]">
        {children}
      </main>
    </div>
  );
}
