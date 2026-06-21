import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useHabitsStore } from '../stores/habitsStore';
import { format, parseISO, subDays } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

const getWeekDates = () => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => format(subDays(today, 6 - index), 'yyyy-MM-dd'));
};

export const HabitsPage: React.FC = () => {
  const { habits, addHabit, toggleHabitCompletion, deleteHabit } = useHabitsStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('Daily review');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const weekDates = getWeekDates();

  const totalHabitProgress = useMemo(() => {
    if (!habits.length) return 0;
    const total = habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
    const max = habits.length * 7;
    return Math.round((total / max) * 100);
  }, [habits]);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addHabit({ title: title.trim(), description, frequency });
    setTitle('');
    setDescription('Daily review');
    setFrequency('daily');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-text-muted mb-2">Habit tracker</p>
          <h1 className="text-3xl font-semibold text-text-primary">Build consistent study habits</h1>
        </div>
        <div className="rounded-3xl border border-border-subtle bg-bg-elevated px-4 py-3 text-sm text-text-secondary">
          Weekly consistency <span className="font-semibold text-text-primary">{totalHabitProgress}%</span>
        </div>
      </div>

      <motion.section className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg font-semibold text-text-primary">Add a new habit</h2>
        <p className="mt-2 text-sm text-text-secondary">Track routines like review sessions, focus blocks, or note summaries.</p>

        <form onSubmit={handleAddHabit} className="grid gap-4 mt-6 sm:grid-cols-[1.7fr_1fr]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Habit name"
            className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <div className="grid gap-2">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this habit matters"
              className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            />
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-accent-hover"
            >
              <Plus size={14} /> Add habit
            </button>
          </div>
        </form>
      </motion.section>

      <section className="grid gap-4">
        {habits.length === 0 ? (
          <div className="card border-dashed border-border-subtle py-12 text-center text-text-muted bg-bg-surface">
            No habits yet. Create a routine to start tracking your weekly consistency.
          </div>
        ) : (
          habits.map((habit) => (
            <motion.div
              key={habit.id}
              className="card border-border-subtle bg-bg-surface p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{habit.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{habit.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteHabit(habit.id)}
                  className="rounded-2xl border border-border-subtle bg-bg-elevated px-4 py-2 text-sm text-danger-color hover:text-on-dark hover:bg-bg-surface"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
              <div className="mt-4 overflow-x-auto">
                <div className="grid min-w-[480px] grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.22em] text-text-muted">
                  {weekDates.map((date) => (
                    <span key={date}>{format(parseISO(date), 'EEE')}</span>
                  ))}
                </div>
                <div className="mt-2 grid min-w-[480px] grid-cols-7 gap-2">
                  {weekDates.map((date) => {
                    const completed = habit.completedDates.includes(date);
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => toggleHabitCompletion(habit.id, date)}
                        className={`rounded-3xl border px-3 py-4 text-sm transition ${
                          completed
                            ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                            : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-accent'
                        }`}
                      >
                        {format(parseISO(date), 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </section>
    </div>
  );
};
