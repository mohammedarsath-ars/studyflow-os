import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useSessionStore } from '../stores/sessionStore';
import { useTaskStore } from '../stores/taskStore';
import { useSubjectStore } from '../stores/subjectStore';
import { format, subDays, parseISO } from 'date-fns';
import { Clock3, Sparkles, ArrowUpRight, TrendingUp, Lightbulb } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

export const WeeklyAnalytics: React.FC = () => {
  const sessions = useSessionStore((state) => state.sessions);
  const tasks = useTaskStore((state) => state.tasks);
  const subjects = useSubjectStore((state) => state.subjects);

  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const gridStroke = 'var(--border-subtle)';
  const textStroke = 'var(--text-muted)';
  const tooltipBg = isDark ? 'var(--bg-primary)' : 'var(--bg-surface)';
  const tooltipBorder = 'var(--border)';
  const tooltipTextColor = 'var(--text-primary)';

  const lastSevenDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => subDays(new Date(), 6 - index));
  }, []);

  const weeklyData = useMemo(() => {
    return lastSevenDays.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const daySessions = sessions.filter((session) => format(parseISO(session.startTime), 'yyyy-MM-dd') === dateKey);
      const dayTasksComplete = tasks.filter(
        (task) => task.status === 'done' && task.completedAt && format(parseISO(task.completedAt), 'yyyy-MM-dd') === dateKey
      ).length;
      return {
        day: format(day, 'EEE'),
        studyMinutes: daySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0),
        completedTasks: dayTasksComplete,
      };
    });
  }, [lastSevenDays, sessions, tasks]);

  const subjectDistribution = useMemo(() => {
    const distribution = new Map<string, { name: string; minutes: number; color: string }>();
    sessions.forEach((session) => {
      const subject = subjects.find((subj) => subj.id === session.subjectId);
      const name = subject?.name ?? 'Other';
      const color = subject?.color ?? 'var(--accent)';
      const existing = distribution.get(name);
      if (existing) {
        existing.minutes += session.durationMinutes;
      } else {
        distribution.set(name, { name, minutes: session.durationMinutes, color });
      }
    });
    return Array.from(distribution.values()).filter((item) => item.minutes > 0).sort((a, b) => b.minutes - a.minutes);
  }, [sessions, subjects]);

  const activeDays = weeklyData.filter((entry) => entry.studyMinutes > 0).length;
  const totalStudyMinutes = weeklyData.reduce((sum, entry) => sum + entry.studyMinutes, 0);
  const totalTasksCompleted = weeklyData.reduce((sum, entry) => sum + entry.completedTasks, 0);
  let streak = 0;
  for (let i = weeklyData.length - 1; i >= 0; i -= 1) {
    if (weeklyData[i].studyMinutes > 0) streak += 1;
    else break;
  }
  const productivityScore = Math.min(99, Math.max(52, Math.round(totalStudyMinutes / 10 + totalTasksCompleted * 4 + activeDays * 2)));
  const topSubjects = subjectDistribution.slice(0, 4);

  const insights = [
    `You studied ${activeDays} of the last 7 days with an average of ${activeDays ? Math.round(totalStudyMinutes / activeDays) : 0} minutes on active days.`,
    `${totalTasksCompleted} tasks were completed, showing consistent execution across sessions.`,
    streak >= 3 ? `You are on a ${streak}-day streak — keep your routine steady with one more focused session today.` : 'Build momentum by stacking a two-session day with a short review afterward.',
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-text-muted">Weekly analytics</p>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold text-text-primary">Focus rhythm for the week</h1>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary">A premium dashboard for study momentum, subject share, and productivity pulse.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[{
              label: 'Focus hours',
              value: `${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`,
              note: `${activeDays} active days`,
              accent: 'var(--accent)',
            }, {
              label: 'Tasks completed',
              value: totalTasksCompleted,
              note: 'This week',
              accent: 'var(--success)',
            }, {
              label: 'Productivity score',
              value: `${productivityScore}%`,
              note: 'AI confidence',
              accent: 'var(--accent-purple)',
            }, {
              label: 'Study streak',
              value: `${streak}d`,
              note: 'Consecutive focus days',
              accent: 'var(--warning)',
            }].map((card) => (
              <div key={card.label} className="rounded-[30px] border border-[var(--border)] bg-bg-elevated p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:border-accent-hover">
                <p className="text-[11px] uppercase tracking-[0.28em] text-text-muted">{card.label}</p>
                <p className="mt-4 text-3xl font-semibold" style={{ color: card.accent }}>{card.value}</p>
                <p className="mt-2 text-sm text-text-secondary">{card.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <motion.div className="card p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">AI productivity brief</p>
                <h2 className="text-xl font-semibold text-text-primary">Your focus profile this week</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-2 text-[11px] font-semibold text-accent">Premium insight</div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-text-secondary leading-7">
              <p><span className="font-semibold text-text-primary">StudyFlow</span> suggests your strongest window is late afternoon, when focus is most consistent.</p>
              <p>Top subjects like <span className="font-semibold text-text-primary">{topSubjects[0]?.name ?? 'no subject yet'}</span> are driving the highest engagement.</p>
            </div>
            <div className="mt-6 rounded-[24px] border border-border-subtle bg-bg-surface p-4">
              <div className="flex items-center justify-between text-sm text-text-secondary">
                <span>Next recommended focus window</span>
                <span className="font-semibold text-text-primary">This afternoon</span>
              </div>
            </div>
          </motion.div>

          <motion.div className="card p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 text-sm font-semibold text-text-primary">
              <Sparkles size={18} className="text-accent" />
              <span>Trend highlight</span>
            </div>
            <div className="mt-5 space-y-3 text-sm text-text-secondary">
              <p>{insights[0]}</p>
              <p>{insights[1]}</p>
              <p>{insights[2]}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.95fr]">
        <motion.section className="card p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Study & completion trends</h2>
              <p className="text-sm text-text-secondary">Premium chart styling surfaces your weekly focus.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-4 py-2 text-[11px] font-semibold text-text-secondary">
              <Clock3 size={14} /> {activeDays} active days
            </div>
          </div>

          <div className="mt-6 h-[340px] w-full overflow-hidden rounded-[30px] border border-[var(--border)] bg-bg-surface shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.75} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} vertical={false} opacity={0.45} />
                <XAxis dataKey="day" stroke={textStroke} axisLine={false} tickLine={false} />
                <YAxis stroke={textStroke} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipTextColor, borderRadius: 24 }}
                  labelStyle={{ color: tooltipTextColor }}
                  formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : value)}
                />
                <Area type="monotone" dataKey="studyMinutes" stroke="var(--accent)" fill="url(#studyGradient)" strokeWidth={3} activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="completedTasks" stroke="var(--success)" fill="var(--success-soft)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section className="card p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Subject breakdown</h2>
              <p className="text-sm text-text-secondary">Where your attention was spent.</p>
            </div>
            <div className="rounded-full bg-bg-elevated px-3 py-2 text-[11px] font-semibold text-text-secondary">Top {Math.min(4, topSubjects.length)}</div>
          </div>

          <div className="mt-6 space-y-4">
            {topSubjects.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-border-subtle bg-bg-surface p-8 text-center text-sm text-text-muted">
                No subject data yet. Start a session to see your breakdown.
              </div>
            ) : (
              topSubjects.map((subject) => (
                <div key={subject.name} className="rounded-[24px] border border-border-subtle bg-bg-elevated p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: subject.color }} />
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{subject.name}</p>
                        <p className="text-xs text-text-muted">{Math.round((subject.minutes / Math.max(1, totalStudyMinutes)) * 100)}% focus share</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">{subject.minutes} min</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.section>
      </div>

      <motion.section className="card p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Weekly insights</h2>
            <p className="text-sm text-text-secondary">AI-inspired takeaways to sharpen your routine.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-bg-elevated px-3 py-2 text-[11px] font-semibold text-text-secondary">
            <TrendingUp size={14} /> Growth signal
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {insights.map((insight, index) => (
            <div key={index} className="rounded-[24px] border border-border-subtle bg-bg-surface p-5">
              <p className="text-sm font-semibold text-text-primary">Insight {index + 1}</p>
              <p className="mt-3 text-sm text-text-secondary leading-7">{insight}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[28px] border border-[var(--border)] bg-bg-elevated p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3 text-sm font-semibold text-text-primary">
            <Lightbulb size={18} className="text-accent" />
            <span>Productivity summary</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-text-secondary">
            Your most productive window is 4–6pm. Try batching one focused session after class and review notes in the following break.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-2 text-[11px] font-semibold text-accent">
            <ArrowUpRight size={12} /> Design your next study sprint
          </div>
        </div>
      </motion.section>
    </div>
  );
};
