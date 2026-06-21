import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useGoalsStore } from '../stores/goalsStore';
import { format, parseISO } from 'date-fns';
import { Plus, Target, Trash2 } from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useGoalsStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState(5);
  const [unit, setUnit] = useState('sessions');
  const [dueDate, setDueDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  const totalProgress = useMemo(() => {
    if (!goals.length) return 0;
    return Math.round(
      goals.reduce((sum, goal) => sum + Math.min(100, (goal.currentValue / goal.targetValue) * 100), 0) / goals.length
    );
  }, [goals]);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({ title: title.trim(), description, targetValue, currentValue: 0, unit, dueDate });
    setTitle('');
    setDescription('');
    setTargetValue(5);
    setUnit('sessions');
    setDueDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-text-muted mb-2">Study Goals</p>
          <h1 className="text-3xl font-semibold text-text-primary">Set your success milestones</h1>
        </div>
        <div className="rounded-3xl border border-border-subtle bg-bg-elevated px-4 py-3 text-sm text-text-secondary">
          Overall goal health <span className="font-semibold text-text-primary">{totalProgress}%</span>
        </div>
      </div>

      <motion.section className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">New Goal</h2>
            <p className="text-sm text-text-muted">Track your daily focus targets and progress.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-2 text-xs text-text-secondary">
            <Target size={14} /> Create goals
          </div>
        </div>

        <form onSubmit={handleAddGoal} className="grid gap-4 mt-6 sm:grid-cols-[1.4fr_0.9fr]">
          <div className="grid gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Goal title"
              className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this goal"
              rows={3}
              className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 resize-none"
            />
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-[11px] uppercase tracking-[0.25em] text-text-muted">Target value</label>
              <input
                type="number"
                min={1}
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] uppercase tracking-[0.25em] text-text-muted">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] uppercase tracking-[0.25em] text-text-muted">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-accent-hover"
            >
              <Plus size={14} /> Add Goal
            </button>
          </div>
        </form>
      </motion.section>

      <section className="grid gap-4">
        {goals.length === 0 ? (
          <div className="card border-dashed border-border-subtle text-center py-12 text-text-muted bg-bg-surface">
            No goals yet. Start by creating a study milestone and watch your progress improve.
          </div>
        ) : (
          goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            return (
              <motion.div
                key={goal.id}
                className="card border-border-subtle bg-bg-surface"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-text-primary font-semibold">
                      <span>{goal.title}</span>
                      {progress >= 100 ? (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300">Completed</span>
                      ) : null}
                    </div>
                    <p className="text-sm text-text-secondary">{goal.description}</p>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">Due {format(parseISO(goal.dueDate), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex flex-col gap-3 items-start sm:items-end">
                    <div className="w-full max-w-[240px] rounded-3xl bg-bg-elevated p-2 border border-border-subtle">
                      <div className="h-2 rounded-full bg-bg-primary overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted">
                        <span>{progress}% complete</span>
                        <span>{goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateGoal(goal.id, { currentValue: Math.min(goal.targetValue, goal.currentValue + 1) })}
                        className="rounded-2xl border border-border-subtle bg-bg-elevated px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface"
                      >
                        Add progress
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteGoal(goal.id)}
                        className="rounded-2xl border border-border-subtle bg-bg-elevated px-3 py-2 text-xs text-text-secondary hover:text-danger-color hover:bg-bg-surface"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </section>
    </div>
  );
};
