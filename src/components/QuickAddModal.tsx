import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTaskStore } from '../stores/taskStore';
import { useSubjectStore } from '../stores/subjectStore';
import type { Priority } from '../types';
import { X } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const addTask = useTaskStore((state) => state.addTask);
  const subjects = useSubjectStore((state) => state.subjects);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjects[0]?.id ?? '');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Batch state reset using useCallback to avoid cascading renders
  const resetFormState = React.useCallback(() => {
    setTitle('');
    setSubject(subjects[0]?.id ?? '');
    setPriority('medium');
    const today = new Date();
    setDueDate(today.toISOString().split('T')[0]);
  }, [subjects]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      // Use setTimeout to defer state updates and avoid cascading renders
      const timer = setTimeout(resetFormState);
      return () => clearTimeout(timer);
    }
  }, [isOpen, resetFormState]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const taskTitle = title.trim();
      await addTask({
        title: taskTitle,
        subject,
        priority,
        dueDate,
        status: 'pending',
      });
      onClose();
    } catch (error) {
      setSubmitError((error as Error)?.message ?? 'Unable to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="card relative w-full max-w-[480px] bg-bg-surface border border-border-color p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-text-primary">
                Create New Task
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-bg-elevated rounded-lg text-text-secondary hover:text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Task Title */}
              <div>
                <label htmlFor="task-title" className="sr-only">Task Title</label>
                <input
                  id="task-title"
                  ref={inputRef}
                  type="text"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-bg-elevated border border-border-subtle focus:border-accent rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Subject Selector */}
                <div>
                  <label htmlFor="task-subject" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    Subject
                  </label>
                  <select
                    id="task-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-bg-elevated border border-border-subtle focus:border-accent rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none transition-colors"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label htmlFor="task-due-date" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    Due Date
                  </label>
                  <input
                    id="task-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-bg-elevated border border-border-subtle focus:border-accent rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Priority Selector */}
              <div>
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Priority
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => {
                    const isSelected = priority === p;
                    const colors = {
                      low: isSelected
                        ? 'bg-bg-elevated border-border-strong text-text-primary'
                        : 'border-border-subtle text-text-muted hover:border-border-strong',
                      medium: isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                        : 'border-border-subtle text-text-muted hover:border-border-strong',
                      high: isSelected
                        ? 'bg-red-500/10 border-red-500/40 text-red-500'
                        : 'border-border-subtle text-text-muted hover:border-border-strong',
                    };
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-2 px-3 border rounded-lg text-xs font-medium capitalize transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none ${colors[p]}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-bg-elevated hover:bg-bg-surface border border-border-subtle hover:border-border-strong rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-medium text-text-primary bg-accent hover:bg-accent-hover rounded-lg shadow-lg hover:shadow-accent/10 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding…' : 'Add Task'}
                </button>
              </div>
              {submitError && (
                <p className="text-xs text-danger-color mt-2">{submitError}</p>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
