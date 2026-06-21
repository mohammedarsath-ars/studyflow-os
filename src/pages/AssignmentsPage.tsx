import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAssignmentStore } from '../stores/assignmentStore';
import { useSubjectStore } from '../stores/subjectStore';
import { format, isBefore, parseISO, startOfToday } from 'date-fns';
import { Plus, CheckCircle2, Trash2, ClipboardList } from 'lucide-react';
import type { TaskStatus } from '../types';

export const AssignmentsPage: React.FC = () => {
  const { assignments, addAssignment, updateAssignment, deleteAssignment } = useAssignmentStore();
  const subjects = useSubjectStore((state) => state.subjects);

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [dueDate, setDueDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  const filteredAssignments = useMemo(
    () => assignments.filter((assignment) => statusFilter === 'all' || assignment.status === statusFilter),
    [assignments, statusFilter]
  );

  const upcomingAssignments = filteredAssignments.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const addNewAssignment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !subjectId) return;
    addAssignment({ title: title.trim(), subjectId, dueDate, status: 'pending' });
    setTitle('');
    setDueDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-text-muted mb-2">Assignment Tracker</p>
          <h1 className="text-3xl font-semibold text-text-primary">Manage deadlines with ease</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <ClipboardList size={20} />
          <span>{assignments.length} tracked assignments</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_0.7fr] gap-6">
        <motion.section className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Add new assignment</h2>
              <p className="text-xs text-text-muted">Keep every deadline organized in one place.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-2 text-xs text-text-secondary">
              <Plus size={14} /> Create assignment
            </div>
          </div>

          <form onSubmit={addNewAssignment} className="grid gap-4">
            <input
              type="text"
              placeholder="Assignment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-bg-primary border border-border-subtle rounded-2xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-bg-primary border border-border-subtle rounded-2xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-bg-primary border border-border-subtle rounded-2xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-accent-hover"
            >
              Add Assignment
              <Plus size={14} />
            </button>
          </form>
        </motion.section>

        <motion.section className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Quick filters</h2>
          <div className="space-y-3 text-sm text-text-secondary">
            {(['all', 'pending', 'in-progress', 'done'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`w-full text-left rounded-2xl px-4 py-3 transition ${statusFilter === status ? 'bg-accent-soft text-accent font-semibold border border-accent-glow' : 'bg-bg-primary border border-border-subtle hover:border-border-strong text-text-secondary'}`}
              >
                {status === 'all' ? 'All statuses' : status.replace('-', ' ')}
              </button>
            ))}
          </div>
        </motion.section>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-text-primary">Assignment list</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-text-muted">{filteredAssignments.length} shown</span>
        </div>

        <div className="grid gap-4">
          <AnimatePresence>
            {upcomingAssignments.map((assignment) => {
              const subject = subjects.find((subject) => subject.id === assignment.subjectId) ?? { id: assignment.subjectId, name: assignment.subjectId, color: '#6366f1' };
              const isOverdue = isBefore(parseISO(assignment.dueDate), startOfToday());
              return (
                <motion.div
                  layout
                  key={assignment.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="card flex flex-col gap-4 border-border-subtle bg-bg-surface"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
                        <h3 className="text-base font-semibold text-text-primary">{assignment.title}</h3>
                      </div>
                      <p className="text-sm text-text-secondary">Due {format(parseISO(assignment.dueDate), 'EEE, MMM d')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-border-subtle bg-bg-elevated px-3 py-1 text-xs text-text-secondary">{subject.name}</span>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${assignment.status === 'done' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/15' : assignment.status === 'in-progress' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-bg-elevated text-text-secondary border border-border-subtle'}`}>{assignment.status.replace('-', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                    {isOverdue && <span className="text-danger-color font-semibold">Overdue</span>}
                    <button
                      type="button"
                      onClick={() => updateAssignment(assignment.id, { status: assignment.status === 'done' ? 'pending' : 'done' })}
                      className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-2 text-xs text-text-secondary hover:text-text-primary"
                    >
                      <CheckCircle2 size={14} /> {assignment.status === 'done' ? 'Reopen' : 'Complete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAssignment(assignment.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-2 text-xs text-text-secondary hover:text-danger-color"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {upcomingAssignments.length === 0 && (
            <div className="card border-dashed border-border-subtle text-center py-12 text-text-muted bg-bg-surface">
              No assignments yet. Add a deadline to track your study flow.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
