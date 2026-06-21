import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSubjectStore } from '../stores/subjectStore';
import { useTaskStore } from '../stores/taskStore';
import { useAssignmentStore } from '../stores/assignmentStore';
import { CirclePlus, Trash2, Palette } from 'lucide-react';

export const SubjectManagement: React.FC = () => {
  const { subjects, addSubject, deleteSubject } = useSubjectStore();
  const tasks = useTaskStore((state) => state.tasks);
  const assignments = useAssignmentStore((state) => state.assignments);

  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    addSubject({ name: name.trim(), color });
    setName('');
  };

  const getUsageCount = (subjectId: string) =>
    tasks.filter((task) => task.subject === subjectId).length +
    assignments.filter((assignment) => assignment.subjectId === subjectId).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-text-muted mb-2">Subject Management</p>
          <h1 className="text-3xl font-semibold text-text-primary">Customize your study subjects</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-4 py-3 text-xs text-text-secondary">
          <Palette size={16} /> {subjects.length} subjects
        </div>
      </div>

      <motion.section className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Add or edit subjects</h2>
            <p className="text-sm text-text-muted">Create a personalized subject list for tasks, assignments, and focus sessions.</p>
          </div>
          <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row items-stretch sm:items-end">
            <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr] w-full">
              <input
                type="text"
                placeholder="New subject name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-12 w-full rounded-2xl border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-accent-hover"
            >
              <CirclePlus size={16} /> Add Subject
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {subjects.map((subject) => (
              <motion.div
                key={subject.id}
                layout
                className="rounded-3xl border border-border-subtle bg-bg-surface p-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
                      <span className="inline-flex h-3.5 w-3.5 rounded-full" style={{ backgroundColor: subject.color }} />
                      {subject.name}
                    </div>
                    <p className="mt-2 text-xs text-text-muted">Used in {getUsageCount(subject.id)} items</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteSubject(subject.id)}
                    className="rounded-2xl border border-border-subtle bg-bg-elevated px-3 py-2 text-xs text-text-secondary hover:text-danger-color"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>
    </div>
  );
};
