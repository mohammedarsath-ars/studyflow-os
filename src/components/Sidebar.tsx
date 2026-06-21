import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  ClipboardList,
  CalendarClock,
  BookOpen,
  Activity,
  Target,
  BarChart3,
  BookOpenCheck,
  HeartPulse,
  Bell,
  User,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Layout,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navGroups = [
  {
    label: 'Core',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Tasks', path: '/tasks', icon: CheckSquare },
      { name: 'Focus', path: '/focus', icon: Target },
      { name: 'Calendar', path: '/calendar', icon: CalendarDays },
    ],
  },
  {
    label: 'Academic',
    items: [
      { name: 'Assignments', path: '/assignments', icon: ClipboardList },
      { name: 'Exams', path: '/exams', icon: CalendarClock },
      { name: 'Subjects', path: '/subjects', icon: BookOpen },
      { name: 'GPA Tracker', path: '/gpa', icon: BookOpenCheck },
    ],
  },
  {
    label: 'Insights',
    items: [
      { name: 'Analytics', path: '/analytics', icon: Activity },
      { name: 'Goals', path: '/goals', icon: BarChart3 },
      { name: 'Notes', path: '/notes', icon: GraduationCap },
      { name: 'Habits', path: '/habits', icon: HeartPulse },
      { name: 'Reminders', path: '/reminders', icon: Bell },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Profile', path: '/profile', icon: User },
    ],
  },
];

const workspaces = [
  { id: 'sem1', name: 'Spring Semester', icon: GraduationCap, color: '#7c7ff9' },
  { id: 'personal', name: 'Personal Board', icon: Layout, color: '#bf97ff' },
  { id: 'projects', name: 'Research Projects', icon: Target, color: '#34d06e' },
];

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '72px' : '240px');
  }, [isCollapsed]);

  return (
    <motion.aside
      className="hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 overflow-hidden border-r"
      style={{
        background: 'var(--sidebar-bg)',
        borderColor: 'var(--sidebar-border)',
      }}
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
    >
      <div className="flex flex-col gap-4 px-4 py-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-3 px-2">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-[22px] border"
            style={{
              background: 'var(--accent-soft)',
              borderColor: 'var(--border)',
              boxShadow: '0 18px 60px rgba(124,127,249,0.12)',
            }}
          >
            <LayoutDashboard size={18} className="text-accent" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                StudyFlow
              </p>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
                Premium hub
              </p>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsWorkspaceOpen((prev) => !prev)}
            className="flex w-full items-center gap-3 rounded-[26px] border px-3.5 py-3 text-left transition-all duration-200 hover:border-accent-hover"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[20px] flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${activeWorkspace.color} 0%, var(--accent-purple) 100%)`,
              }}
            >
              <activeWorkspace.icon size={16} className="text-on-dark" />
            </div>
            {!isCollapsed ? (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{activeWorkspace.name}</p>
                <p className="text-[11px] text-text-secondary truncate">Workspace</p>
              </div>
            ) : null}
            {!isCollapsed && <ChevronsUpDown size={14} className="text-text-secondary" />}
          </button>

          <AnimatePresence>
            {isWorkspaceOpen && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.98 }}
                className="absolute inset-x-0 top-full z-50 mt-3 rounded-3xl border bg-bg-surface p-2 shadow-2xl"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.32em] font-bold text-text-muted">
                  Workspace Switcher
                </div>
                <div className="space-y-1.5">
                  {workspaces.map((workspace) => {
                    const Icon = workspace.icon;
                    const isSelected = activeWorkspace.id === workspace.id;
                    return (
                      <button
                        key={workspace.id}
                        type="button"
                        onClick={() => {
                          setActiveWorkspace(workspace);
                          setIsWorkspaceOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 transition-all duration-200"
                        style={{
                          background: isSelected ? 'var(--accent-soft)' : 'transparent',
                          color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                          border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                        }}
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-2xl"
                          style={{ background: `${workspace.color}14`, color: workspace.color }}
                        >
                          <Icon size={14} />
                        </div>
                        <span className="text-sm truncate">{workspace.name}</span>
                        {isSelected && <Check size={14} className="ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-3">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.33em] text-text-muted">
                {group.label}
              </p>
            )}
            <div className="space-y-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} end={item.path === '/'} className="block">
                    {({ isActive }) => (
                      <motion.div
                        layout
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="relative"
                      >
                        {isActive && (
                          <motion.span
                            layoutId="sidebar-pill"
                            className="absolute inset-y-0 left-0 w-1.5 rounded-r-full"
                            style={{ background: 'var(--accent)' }}
                          />
                        )}
                        <button
                          type="button"
                          className={`flex w-full items-center gap-3 rounded-[24px] px-3 py-3 transition-all duration-200 text-left ${
                            isActive ? 'shadow-[0_18px_50px_rgba(124,127,249,0.12)]' : 'hover:bg-[var(--sidebar-item-hover)] hover:text-text-primary'
                          }`}
                          style={{
                            background: isActive ? 'var(--sidebar-item-active-bg)' : 'transparent',
                            color: isActive ? 'var(--sidebar-item-active-color)' : 'var(--text-secondary)',
                          }}
                        >
                          <Icon size={18} className="flex-shrink-0" />
                          {!isCollapsed && <span className="truncate text-sm font-medium">{item.name}</span>}
                        </button>
                        {isCollapsed && (
                          <div
                            className="absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-2xl border bg-bg-surface px-3 py-2 text-xs text-text-primary opacity-0 transition-all duration-200 pointer-events-none group-hover:block"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            {item.name}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t px-3 py-4" style={{ borderColor: 'var(--sidebar-border)' }}>
        {!isCollapsed && (
          <div className="rounded-[22px] border bg-bg-elevated px-4 py-4 text-sm" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-text-muted">
              Premium sidebar
            </p>
            <p className="mt-2 text-sm font-semibold text-text-primary leading-tight">
              Fast navigation, clean hierarchy, and workspace focus.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold text-text-secondary transition-all duration-200 hover:bg-bg-elevated hover:border-accent-hover"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border)',
          }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!isCollapsed ? 'Collapse sidebar' : 'Expand'}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
