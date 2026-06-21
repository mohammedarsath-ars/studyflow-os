import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTimerStore } from '../stores/timerStore';
import { useTaskStore } from '../stores/taskStore';
import { useSessionStore } from '../stores/sessionStore';
import { calculateStreak } from '../utils/streak';
import { format } from 'date-fns';
import {
  Timer,
  Coffee,
  Flame,
  Sun,
  Moon,
  Plus,
  ChevronRight,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import Avatar from '../assets/avatar-placeholder.png';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface TopbarProps {
  onQuickAddClick: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/tasks': 'Tasks',
  '/focus': 'Focus Center',
  '/calendar': 'Calendar',
  '/assignments': 'Assignments',
  '/exams': 'Exam Countdown',
  '/subjects': 'Subjects',
  '/analytics': 'Analytics',
  '/goals': 'Goals',
  '/gpa': 'GPA Tracker',
  '/notes': 'Notes',
  '/habits': 'Habits',
  '/reminders': 'Reminders',
  '/profile': 'Profile',
};

const mockNotifications = [
  { id: 1, text: 'Biology assignment due in 6 hours', time: '1h ago', unread: true },
  { id: 2, text: 'Physics exam is coming up on Monday', time: '4h ago', unread: true },
  { id: 3, text: 'Weekly analytics report is ready', time: '1d ago', unread: false },
];

export const Topbar: React.FC<TopbarProps> = ({ onQuickAddClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { timeLeft, status, mode } = useTimerStore();
  const tasks = useTaskStore((state) => state.tasks);
  const sessions = useSessionStore((state) => state.sessions);
  const streak = calculateStreak(tasks, sessions);
  const formattedDate = format(new Date(), 'EEE, MMM d');
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'StudyFlow OS';

  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success('All notifications marked as read.');
  };

  const isTimerActive = status === 'running' || status === 'paused';
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <header
      className="sticky top-0 z-30 border-b border-border-subtle bg-topbar-bg/95 backdrop-blur-xl backdrop-saturate-150 px-4 py-3"
      style={{ WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}
    >
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-bg-elevated px-3 py-2 text-sm font-semibold transition-all duration-200 hover:border-accent hover:bg-[var(--bg-surface)]"
            style={{ color: 'var(--text-primary)' }}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              SF
            </span>
            <span className="hidden sm:inline">StudyFlow</span>
          </button>

          <div className="hidden sm:flex flex-col leading-tight min-w-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-text-muted">
              <span>Workspace</span>
              <ChevronRight size={12} className="text-text-muted" />
              <span className="text-text-primary">{pageTitle}</span>
            </div>
            <p className="text-xs text-text-secondary">{formattedDate}</p>
          </div>
        </div>

        <div className="hidden md:flex min-w-[360px] items-center gap-3 rounded-[26px] border border-[var(--border)] bg-bg-elevated px-4 py-3 text-sm text-text-secondary transition-all duration-200 shadow-sm hover:border-accent-hover hover:bg-bg-surface" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <Search size={18} className="text-text-secondary" />
          <div className="min-w-0">
            <label htmlFor="topbar-search" className="sr-only">Search</label>
            <input
              id="topbar-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search projects, tasks, or add quick items..."
              className="w-full min-w-0 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            />
          </div>
          <kbd className="rounded-lg border border-[var(--border)] bg-bg-primary px-2 py-1 text-[10px] font-semibold text-text-muted">
            ⌘K
          </kbd>
        </div>

        <div className="flex items-center gap-2">
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning-soft px-3 py-1 text-[11px] font-semibold text-warning"
            >
              <Flame size={12} />
              {streak}d streak
            </motion.div>
          )}

          {isTimerActive && (
            <motion.div
              layout
              className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-[11px] font-semibold text-accent"
            >
              {mode === 'work' ? <Timer size={12} /> : <Coffee size={12} />}
              {formatTime(timeLeft)}
            </motion.div>
          )}

          <motion.button
            whileHover={{ y: -1 }}
            type="button"
            onClick={onQuickAddClick}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-purple px-4 py-2 text-sm font-semibold text-on-dark shadow-lg shadow-accent/20 transition-transform"
          >
            <Plus size={14} />
            Add
          </motion.button>

          <div className="hidden sm:block h-9 w-px bg-[var(--border)]" />

          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-bg-elevated text-text-secondary transition-all duration-200 hover:border-accent hover:text-text-primary hover:bg-bg-surface"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-bg-elevated" />
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute right-0 top-full z-50 mt-3 w-80 rounded-3xl border border-[var(--border)] bg-bg-surface p-3 shadow-2xl"
                  style={{ boxShadow: '0 32px 80px rgba(0, 0, 0, 0.14)' }}
                >
                  <div className="flex items-center justify-between gap-3 pb-3">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Notifications</p>
                      <p className="text-xs text-text-muted">Recent updates for your study flow</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="rounded-full px-3 py-1 text-[11px] font-bold text-accent transition-colors hover:bg-accent-soft"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-2xl border px-3 py-3 transition-colors ${
                          notification.unread ? 'border-accent/15 bg-accent-soft' : 'border-transparent bg-bg-elevated'
                        }`}
                        style={{ borderColor: notification.unread ? 'rgba(124,127,249,0.18)' : 'transparent' }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className={`text-sm ${notification.unread ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                            {notification.text}
                          </p>
                          {notification.unread && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent" />}
                        </div>
                        <p className="mt-2 text-[11px] text-text-muted">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-bg-elevated p-1.5">
            <button
              type="button"
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all ${
                theme === 'light' ? 'bg-bg-surface text-warning border border-[var(--border-strong)]' : 'text-text-muted hover:text-text-primary'
              }`}
              aria-label="Switch to light mode"
            >
              <Sun size={14} />
            </button>
            <button
              type="button"
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all ${
                theme === 'dark' ? 'bg-bg-surface text-accent border border-[var(--border-strong)]' : 'text-text-muted hover:text-text-primary'
              }`}
              aria-label="Switch to dark mode"
            >
              <Moon size={14} />
            </button>
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-bg-elevated transition-all duration-200 hover:border-accent hover:shadow-[0_0_0_1px_var(--accent)]"
              aria-label="Open profile menu"
            >
              <img src={Avatar} alt="Mohammed" className="h-10 w-10 rounded-full object-cover" />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute right-0 top-full z-50 mt-3 w-64 rounded-3xl border border-[var(--border)] bg-bg-surface p-3 shadow-2xl"
                >
                  <div className="flex items-center gap-3 rounded-3xl border border-[var(--border)] bg-bg-elevated px-3 py-3">
                    <img src={Avatar} alt="Profile" className="h-11 w-11 rounded-2xl object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Mohammed Arsath</p>
                      <p className="text-xs text-text-secondary">mohammed@studyflow.os</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-text-secondary transition-all duration-200 hover:bg-bg-elevated hover:text-text-primary"
                    >
                      <User size={14} />
                      My Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        toast.info('Settings modal coming soon.');
                      }}
                      className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-text-secondary transition-all duration-200 hover:bg-bg-elevated hover:text-text-primary"
                    >
                      <Settings size={14} />
                      Account Settings
                    </button>
                    <div className="h-px bg-border-subtle my-1.5" />
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/login');
                        setIsUserMenuOpen(false);
                        toast.success('Successfully signed out.');
                      }}
                      className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-danger transition-all duration-200 hover:bg-danger/10"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
