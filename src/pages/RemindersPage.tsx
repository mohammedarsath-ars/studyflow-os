import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useReminderStore } from '../stores/reminderStore';
import { Plus, Bell, Trash2 } from 'lucide-react';
import { format, isBefore, parseISO } from 'date-fns';

export const RemindersPage: React.FC = () => {
  const { reminders, addReminder, updateReminder, deleteReminder } = useReminderStore();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  const dueSoon = useMemo(
    () => reminders.filter((reminder) => isBefore(parseISO(reminder.dateTime), new Date())),
    [reminders]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateTime) return;
    addReminder({ title: title.trim(), notes, dateTime, repeat, active: true });
    setTitle('');
    setNotes('');
    setDateTime('');
    setRepeat('none');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-text-muted mb-2">Smart reminders</p>
          <h1 className="text-3xl font-semibold text-text-primary">Stay on top of deadlines and rituals</h1>
        </div>
        <div className="rounded-3xl border border-border-subtle bg-bg-elevated px-4 py-3 text-sm text-text-secondary">
          Active reminders <span className="font-semibold text-text-primary">{reminders.filter((item) => item.active).length}</span>
        </div>
      </div>

      <motion.section className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Create reminder</h2>
            <p className="mt-2 text-sm text-text-secondary">Set alerts for study sessions, assignment deadlines, or exam prep.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-2 text-xs text-text-secondary">
            <Bell size={14} /> Alerts
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 mt-6 sm:grid-cols-[1.5fr_1fr]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reminder title"
            className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Details or check list"
            className="w-full rounded-3xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 resize-none sm:col-span-2"
          />
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as 'none' | 'daily' | 'weekly' | 'monthly')}
            className="rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-accent-hover"
          >
            <Plus size={14} /> Save reminder
          </button>
        </form>
      </motion.section>

      <section className="grid gap-4">
        {reminders.length === 0 ? (
          <div className="card border-dashed border-border-subtle py-12 text-center text-text-muted bg-bg-surface">
            No reminders yet. Add a reminder to keep deadlines and revision sessions on schedule.
          </div>
        ) : (
          reminders.map((reminder) => (
            <motion.div
              key={reminder.id}
              className="card border-border-subtle bg-bg-surface p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{reminder.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{reminder.notes || 'No extra details provided.'}</p>
                </div>
                <div className="grid gap-2 text-right text-sm text-text-muted">
                  <span>{format(parseISO(reminder.dateTime), 'PPP p')}</span>
                  <span>Repeat: {reminder.repeat}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => updateReminder(reminder.id, { active: !reminder.active })}
                  className="rounded-2xl border border-border-subtle bg-bg-elevated px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface"
                >
                  {reminder.active ? 'Pause' : 'Activate'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteReminder(reminder.id)}
                  className="rounded-2xl border border-border-subtle bg-bg-elevated px-4 py-2 text-sm text-danger-color hover:text-on-dark hover:bg-bg-surface"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </section>

      {dueSoon.length > 0 ? (
        <div className="card rounded-3xl border-l-4 border-amber-500 bg-amber-500/10 p-5 text-sm text-amber-200">
          <p className="font-semibold">You have {dueSoon.length} overdue reminder{dueSoon.length > 1 ? 's' : ''}.</p>
          <p className="mt-1">Resolve them now or update the due dates to stay on track.</p>
        </div>
      ) : null}
    </div>
  );
};
