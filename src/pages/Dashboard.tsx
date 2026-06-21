import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTaskStore } from '../stores/taskStore';
import { useSessionStore } from '../stores/sessionStore';
import { useTimerStore } from '../stores/timerStore';
import { useSubjectStore } from '../stores/subjectStore';
import { useProfileStore } from '../stores/profileStore';
import { parseISO, isToday, format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import {
  Play,
  Pause,
  ArrowRight,
  Plus,
  Check,
  CheckSquare,
  Flame,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface DashboardProps {
  onOpenQuickAdd: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 240, damping: 24 } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export const Dashboard: React.FC<DashboardProps> = ({ onOpenQuickAdd }) => {
  const navigate = useNavigate();
  const rawTasks = useTaskStore((state) => state.tasks);
  const tasks = rawTasks.filter(Boolean) as any[];
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const completeTask = useTaskStore((state) => state.completeTask);
  const sessions = useSessionStore((state) => state.sessions);
  const subjects = useSubjectStore((state) => state.subjects);
  const profile = useProfileStore((state) => state.profile);
  const { timeLeft, status, mode, startTimer, pauseTimer } = useTimerStore();

  const userName = profile.name?.split(' ')[0] ?? 'Student';

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter((t) => t.dueDate === todayStr);
  const pendingToday = todaysTasks.filter((t) => t.status !== 'done');
  const completedToday = todaysTasks.filter((t) => t.status === 'done');
  const visiblePending = pendingToday.slice(0, 6);
  const remainingCount = Math.max(0, pendingToday.length - visiblePending.length);

  const todaySessions = sessions.filter((s) => {
    try {
      return isToday(parseISO(s.startTime));
    } catch {
      return false;
    }
  });

  const totalStudyTimeMinutes = todaySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const studyHoursStr = totalStudyTimeMinutes >= 60
    ? `${Math.floor(totalStudyTimeMinutes / 60)}h ${totalStudyTimeMinutes % 60}m`
    : `${totalStudyTimeMinutes}m`;

  const totalPendingAll = tasks.filter((t) => t.status !== 'done').length;
  const completedTodayCount = tasks.filter(
    (t) => t.status === 'done' && t.completedAt && isToday(parseISO(t.completedAt))
  ).length;
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

  const completionPercent = todaysTasks.length > 0 ? Math.round((completedToday.length / todaysTasks.length) * 100) : 0;

  const lastWeek = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const weeklyStudyData = lastWeek.map((day) => {
    const minutes = sessions.reduce((sum, session) => {
      try {
        return isSameDay(parseISO(session.startTime), day) ? sum + session.durationMinutes : sum;
      } catch {
        return sum;
      }
    }, 0);
    return {
      label: format(day, 'EEE'),
      minutes,
    };
  });

  const weeklyTotalMinutes = weeklyStudyData.reduce((sum, day) => sum + day.minutes, 0);
  const weeklyTargetMinutes = 180;
  const weeklyCompletion = Math.min(100, Math.round((weeklyTotalMinutes / weeklyTargetMinutes) * 100));

  let streakDays = 0;
  for (const day of [...lastWeek].reverse()) {
    const hasSession = sessions.some((session) => {
      try {
        return isSameDay(parseISO(session.startTime), day);
      } catch {
        return false;
      }
    });
    if (!hasSession) break;
    streakDays += 1;
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const focusSuggestion = todaysTasks.length === 0
    ? 'No tasks today? Try adding a review item or focus sprint to keep momentum.'
    : pendingToday.length === 0
      ? 'All caught up today — keep the streak alive with a quick deeper session.'
      : `You have ${pendingToday.length} pending task${pendingToday.length > 1 ? 's' : ''}. Start with the top priority.`;

  useEffect(() => {
    const fetchTasks = async () => {
      setIsDashboardLoading(true);
      setDashboardError(null);

      try {
        await loadTasks();
      } catch (error) {
        setDashboardError((error as Error)?.message ?? 'Unable to load tasks.');
      } finally {
        setIsDashboardLoading(false);
      }
    };

    fetchTasks();
  }, [loadTasks]);

  const handleStartTimer = () => {
    const ok = startTimer();
    if (ok) {
      toast.success('Focus session started! Deep work mode activated.');
    } else {
      navigate('/focus');
    }
  };

  const handlePauseTimer = () => {
    pauseTimer();
    toast.info('Timer paused.');
  };

  const handleCompleteTask = (id: string, title: string) => {
    completeTask(id);
    toast.success(`Completed: "${title}"! Keep going! 🎉`);
  };

  const statCards = [
    {
      label: 'Pending Tasks',
      value: totalPendingAll,
      accent: 'var(--warning)',
      bg: 'linear-gradient(135deg, var(--warning-soft) 0%, transparent 100%)',
      description: pendingToday.length === 0 ? 'All good' : `${pendingToday.length} pending today`,
      trend: `${pendingToday.length > 0 ? '−' : '+'}${Math.min(12, Math.max(1, Math.ceil(totalPendingAll / 5)))}%`,
      trendPositive: pendingToday.length === 0,
    },
    {
      label: 'Done Today',
      value: completedTodayCount,
      accent: 'var(--success)',
      bg: 'linear-gradient(135deg, var(--success-soft) 0%, transparent 100%)',
      description: `${completedToday.length} completed`,
      trend: '+18%',
      trendPositive: true,
    },
    {
      label: 'Focus Time',
      value: studyHoursStr || '0m',
      accent: 'var(--accent)',
      bg: 'linear-gradient(135deg, var(--accent-soft) 0%, transparent 100%)',
      description: `${todaySessions.length} sessions`,
      trend: '+12%',
      trendPositive: true,
    },
    {
      label: 'Weekly Goal',
      value: `${weeklyCompletion}%`,
      accent: 'var(--accent-purple)',
      bg: 'linear-gradient(135deg, var(--accent-soft) 0%, transparent 100%)',
      description: `${Math.max(0, weeklyTargetMinutes - weeklyTotalMinutes)}m remaining`,
      trend: weeklyCompletion >= 75 ? '+5%' : '-2%',
      trendPositive: weeklyCompletion >= 75,
    },
  ];

  const maxWeeklyMinutes = Math.max(...weeklyStudyData.map((day) => day.minutes), 60);

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-8 pb-10">
      <motion.section
        variants={fadeUp}
        className="relative overflow-hidden rounded-[32px] border border-[var(--card-border)] shadow-[var(--shadow-card)]"
        style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-soft), var(--bg-surface))' }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--accent-soft),transparent_30%),radial-gradient(circle_at_bottom_right,var(--accent-purple) 0%,transparent_32%)] opacity-90" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--accent-soft)] to-transparent opacity-90" />
        <div className="relative z-10 grid gap-6 px-6 py-6 lg:grid-cols-[1.8fr_1.2fr] lg:px-10 lg:py-8">
          <div className="space-y-5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-soft)] bg-[var(--accent-soft)]/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
                Premium Dashboard
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1 text-[11px] font-semibold text-success">
                <Flame size={12} /> {streakDays}-day streak
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-purple">{userName}</span>.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-text-secondary">
                Your flagship productivity command center for sessions, study metrics, and task momentum. Stay aligned with your highest-impact work.
              </p>
              {(isDashboardLoading || dashboardError) && (
                <div className="rounded-2xl border border-border-subtle bg-bg-elevated px-4 py-3 text-sm text-text-secondary">
                  {isDashboardLoading ? 'Loading latest tasks…' : `Task sync issue: ${dashboardError}`}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: 'Today',
                  value: pendingToday.length,
                  subtitle: 'tasks due',
                },
                {
                  title: 'Focus logged',
                  value: studyHoursStr,
                  subtitle: 'this session',
                },
                {
                  title: 'Goal pace',
                  value: `${weeklyCompletion}%`,
                  subtitle: `toward ${weeklyTargetMinutes}m`,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[26px] border border-[var(--border)] bg-bg-elevated/90 p-5 shadow-[var(--shadow-sm)]"
                  style={{ backdropFilter: 'blur(20px)' }}
                >
                  <p className="text-[11px] uppercase tracking-[0.28em] text-text-muted">{item.title}</p>
                  <p className="mt-4 text-3xl font-semibold text-text-primary">{item.value}</p>
                  <p className="mt-2 text-sm text-text-secondary">{item.subtitle}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={status === 'running' ? handlePauseTimer : handleStartTimer}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-purple px-5 py-3 text-sm font-semibold text-on-dark shadow-lg shadow-accent/20 transition-all duration-200 hover:from-accent-hover"
              >
                {status === 'running' ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
                {status === 'running' ? 'Pause session' : 'Start focus'}
              </button>
              <button
                onClick={onOpenQuickAdd}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-bg-elevated px-5 py-3 text-sm font-semibold text-text-primary transition-all duration-200 hover:bg-bg-surface"
              >
                <Plus size={16} /> Quick add task
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[32px] border border-[var(--border)] bg-card-bg p-5 shadow-[var(--shadow-card)]"
            style={{ backdropFilter: 'blur(24px)' }}
          >
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[var(--accent-soft)] to-transparent opacity-90" />
            <div className="relative space-y-5">
              <div className="rounded-[28px] bg-bg-surface/85 p-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-[11px] font-semibold text-accent">
                  <Sparkles size={14} /> {completionPercent}% completion
                </div>

                <div
                  className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center rounded-full border border-[var(--border)]"
                  style={{ background: 'var(--bg-primary)', boxShadow: '0 0 0 20px rgba(124,127,249,0.08)' }}
                >
                  <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full rotate-[-90deg] opacity-90">
                    <circle cx="60" cy="60" r="48" fill="none" stroke="var(--border)" strokeWidth="8" />
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 48 * (completionPercent / 100)} ${2 * Math.PI * 48}`}
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 0 16px var(--accent-glow))', transition: 'stroke-dasharray 0.9s ease' }}
                    />
                  </svg>
                  <div className="relative flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-text-muted">Focus session</span>
                    <span className="mt-2 text-5xl font-extrabold text-text-primary">{formatTime(timeLeft)}</span>
                    <span className="mt-2 text-sm text-text-secondary">{mode === 'work' ? 'Deep work' : mode === 'short_break' ? 'Short break' : 'Long break'}</span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-[var(--border)] bg-card-bg p-4 text-left">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted">Sessions</p>
                    <p className="mt-2 text-2xl font-semibold text-accent">{todaySessions.length}</p>
                    <p className="text-xs text-text-secondary">logged today</p>
                  </div>
                  <div className="rounded-[24px] border border-[var(--border)] bg-card-bg p-4 text-left">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted">Focus pace</p>
                    <p className="mt-2 text-2xl font-semibold text-success">{streakDays}d</p>
                    <p className="text-xs text-text-secondary">recent streak</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="flex h-full flex-col justify-between rounded-[28px] border border-[var(--border)] bg-bg-surface p-6 shadow-[var(--shadow-card)]"
            style={{ background: card.bg }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-text-muted">{card.label}</p>
                <p className="mt-4 text-3xl font-semibold" style={{ color: card.accent }}>{card.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl border border-[var(--border)] bg-card-bg text-[var(--accent)] shadow-sm">
                <Sparkles size={18} />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-sm text-text-secondary">{card.description}</p>
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${card.trendPositive ? 'text-success' : 'text-warning'}`}>
                {card.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1.2fr]">
        <div className="space-y-6">
          <motion.section
            variants={fadeUp}
            className="rounded-[32px] border border-[var(--border-subtle)] bg-bg-surface p-6 shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">Today's Tasks</p>
                <p className="mt-1 text-xs text-text-secondary">Focus on your highest-impact work first.</p>
              </div>
              <button
                onClick={onOpenQuickAdd}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-bg-elevated px-4 py-2 text-sm font-semibold text-text-primary transition-all duration-200 hover:bg-bg-surface"
              >
                <Plus size={14} /> Add task
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {todaysTasks.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-bg-elevated p-8 text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--accent-soft)]">
                    <CheckSquare size={32} className="text-accent" />
                  </div>
                  <p className="text-lg font-semibold text-text-primary">No tasks planned for today</p>
                  <p className="mt-2 text-sm text-text-secondary">Stay ahead by adding a review item, a study goal, or a quick action.</p>
                  <button
                    onClick={onOpenQuickAdd}
                    className="mt-5 rounded-2xl bg-gradient-to-r from-accent to-accent-purple px-5 py-3 text-sm font-semibold text-on-dark shadow-lg shadow-accent/20"
                  >
                    Add your first task
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-[28px] border border-[var(--border)] bg-bg-elevated p-5">
                    <p className="text-sm font-semibold text-text-primary">{focusSuggestion}</p>
                  </div>
                  {visiblePending.map((task) => {
                    const subject = subjects.find((s) => s.id === task.subject);
                    const priorityColor = task.priority === 'high' ? 'var(--danger)' : task.priority === 'medium' ? 'var(--warning)' : 'var(--text-muted)';
                    return (
                      <motion.div
                        key={task.id}
                        whileHover={{ y: -3 }}
                        className="rounded-[28px] border border-[var(--border-subtle)] bg-bg-elevated p-5 transition-all"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-text-primary truncate">{task.title}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                              {subject && (
                                <span className="rounded-full border px-2 py-1" style={{ color: subject.color, borderColor: `${subject.color}22` }}>
                                  {subject.name}
                                </span>
                              )}
                              <span className="rounded-full border px-2 py-1" style={{ color: priorityColor, borderColor: `${priorityColor}22` }}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCompleteTask(task.id, task.title)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] text-text-secondary transition-colors duration-200 hover:bg-accent-soft hover:text-accent"
                            aria-label={`Mark ${task.title} complete`}
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}

                  {remainingCount > 0 && (
                    <Link
                      to="/tasks"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
                    >
                      +{remainingCount} more tasks
                      <ArrowRight size={14} />
                    </Link>
                  )}

                  {completedToday.length > 0 && (
                    <div className="rounded-[28px] border border-[var(--border-subtle)] bg-bg-elevated p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Completed today</p>
                      <div className="mt-4 space-y-3">
                        {completedToday.map((task) => (
                          <div key={task.id} className="flex items-center gap-3 rounded-3xl border border-[var(--border)] bg-bg-surface px-4 py-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                              <Check size={16} />
                            </span>
                            <p className="text-sm text-text-secondary line-through truncate">{task.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.section>

          <motion.section
            variants={fadeUp}
            className="rounded-[32px] border border-[var(--border-subtle)] bg-bg-surface p-6 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">Weekly progress</p>
                <p className="mt-1 text-xs text-text-secondary">See your study rhythm over the last 7 days.</p>
              </div>
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-bold text-accent">
                {weeklyCompletion}% goal
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[28px] bg-bg-elevated p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-text-primary">{weeklyTotalMinutes} minutes</p>
                  <p className="text-xs uppercase tracking-[0.28em] text-text-muted">{weeklyTargetMinutes}m target</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[var(--accent-soft)]">
                  <div className="h-2 rounded-full bg-gradient-to-r from-accent to-accent-purple" style={{ width: `${weeklyCompletion}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {weeklyStudyData.map((day) => {
                  const height = Math.max(18, (day.minutes / maxWeeklyMinutes) * 100);
                  return (
                    <div key={day.label} className="flex flex-col items-center gap-2">
                      <div className="relative flex h-24 w-full items-end justify-center">
                        <span className="absolute bottom-0 inline-block h-full w-full rounded-3xl bg-[var(--accent-soft)]" />
                        <span className="inline-block w-full rounded-3xl bg-gradient-to-t from-accent to-accent-purple" style={{ height: `${height}%` }} />
                      </div>
                      <span className="text-[10px] text-text-secondary">{day.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-[var(--border)] bg-bg-elevated p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Smart insight</p>
                  <p className="mt-1 text-xs text-text-secondary">Consistent sessions build momentum.</p>
                </div>
                <span className="rounded-full bg-success-soft px-3 py-1 text-[11px] font-bold text-success">{streakDays} day streak</span>
              </div>
              <p className="mt-4 text-sm text-text-secondary">
                {streakDays > 0
                  ? 'Keep your streak steady by scheduling one more session before the end of the week.'
                  : 'Start a session now to begin building a reliable study streak.'}
              </p>
            </div>
          </motion.section>
        </div>

        <motion.section
          variants={fadeUp}
          className="rounded-[32px] border border-[var(--border-subtle)] bg-bg-surface p-6 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <BookOpen size={18} />
            <span>Active Subjects</span>
          </div>
          <p className="mt-2 text-xs text-text-secondary">A quick view of subject workloads and pending tasks.</p>
          <div className="mt-5 space-y-3">
            {subjects.slice(0, 6).map((sub) => {
              const pendingCount = tasks.filter((t) => t.subject === sub.id && t.status !== 'done').length;
              return (
                <div key={sub.id} className="flex items-center justify-between rounded-[28px] border border-[var(--border-subtle)] bg-bg-elevated px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: sub.color, boxShadow: `0 0 8px ${sub.color}50` }} />
                    <span className="text-sm font-semibold text-text-primary">{sub.name}</span>
                  </div>
                  <span className="rounded-full border px-3 py-1 text-[11px] font-semibold" style={{ borderColor: 'var(--border)' }}>
                    {pendingCount} pending
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 rounded-[28px] border border-[var(--border)] bg-bg-elevated p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Productivity tip</p>
            <p className="mt-3 text-sm text-text-secondary">
              Focus on one subject block at a time to turn daily progress into long-term mastery.
            </p>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default Dashboard;
