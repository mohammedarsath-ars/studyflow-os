import React, { useState } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { useSubjectStore } from '../stores/subjectStore';
import type { Priority, TaskStatus, Task } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CheckSquare, Search, Plus, Edit2, Trash2, Calendar, Check } from 'lucide-react';
import { parseISO, isBefore, isToday, startOfDay } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

interface TaskManagerProps {
  onOpenQuickAdd: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ onOpenQuickAdd }) => {
  const { tasks, updateTask, deleteTask, completeTask } = useTaskStore();
  const subjects = useSubjectStore((state) => state.subjects);

  // Filter States
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing States
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('pending');

  // Deletion Confirmation Dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const startOfToday = startOfDay(new Date());

  // Filter Logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSubject = selectedSubject === 'all' || task.subject === selectedSubject;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesSearch =
      searchQuery.trim() === '' ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesPriority && matchesStatus && matchesSearch;
  });

  // Task Groups: Pending, In Progress, Done
  const groups: { label: string; status: TaskStatus; items: Task[] }[] = [
    { label: 'Pending', status: 'pending', items: filteredTasks.filter((t) => t.status === 'pending') },
    { label: 'In Progress', status: 'in-progress', items: filteredTasks.filter((t) => t.status === 'in-progress') },
    { label: 'Completed', status: 'done', items: filteredTasks.filter((t) => t.status === 'done') },
  ];

  // Open inline editor
  const handleToggleExpand = (task: Task) => {
    if (expandedTaskId === task.id) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(task.id);
      setEditTitle(task.title);
      setEditSubject(task.subject);
      setEditPriority(task.priority);
      setEditDueDate(task.dueDate);
      setEditStatus(task.status);
    }
  };

  // Save inline editor changes
  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    updateTask(id, {
      title: editTitle.trim(),
      subject: editSubject,
      priority: editPriority,
      dueDate: editDueDate,
      status: editStatus,
      completedAt: editStatus === 'done' ? new Date().toISOString() : undefined,
    });
    setExpandedTaskId(null);
  };

  // Trigger delete dialog
  const handleDeleteClick = (id: string) => {
    setTaskToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  // Date styling helper
  const getDateBadgeClass = (dueDateStr: string, status: TaskStatus) => {
    if (status === 'done') return 'text-text-muted';
    try {
      const date = parseISO(dueDateStr);
      if (isBefore(date, startOfToday)) {
        return 'text-danger-color font-semibold'; // overdue
      }
      if (isToday(date)) {
        return 'text-warning-color font-semibold'; // today
      }
    } catch {
      // Ignore date parsing errors
    }
    return 'text-text-muted';
  };

  const getPriorityBadgeClass = (p: Priority) => {
    switch (p) {
      case 'high':
        return 'bg-red-500/10 border-red-500/30 text-red-500';
      case 'medium':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
      default:
        return 'bg-bg-elevated border border-border-subtle text-text-secondary';
    }
  };

  const hasAnyTasks = filteredTasks.length > 0;

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Tasks</h2>
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 px-4 h-9 bg-accent hover:bg-accent-hover text-on-dark text-xs font-semibold rounded-lg shadow-lg hover:shadow-accent/10 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
        >
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-bg-elevated/50 border border-border-subtle rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-text-muted" size={16} />
            <label htmlFor="search-tasks" className="sr-only">Search tasks</label>
            <input
              id="search-tasks"
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-primary border border-border-subtle focus:border-accent rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors"
            />
          </div>

          {/* Subject Dropdown */}
          <div>
            <label htmlFor="filter-subject" className="sr-only">Filter by Subject</label>
            <select
              id="filter-subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-bg-primary border border-border-subtle focus:border-accent rounded-lg px-3 py-2 text-sm text-text-primary outline-none transition-colors"
            >
              <option value="all">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Pills */}
          <div>
            <label htmlFor="filter-status" className="sr-only">Filter by Status</label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TaskStatus | 'all')}
              className="w-full bg-bg-primary border border-border-subtle focus:border-accent rounded-lg px-3 py-2 text-sm text-text-primary outline-none transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Completed</option>
            </select>
          </div>
        </div>

        {/* Priority Filter Row */}
        <div className="flex items-center gap-3 pt-1 border-t border-border-subtle">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Priority:
          </span>
          <div className="flex gap-2">
            {(['all', 'high', 'medium', 'low'] as const).map((p) => {
              const isSelected = selectedPriority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPriority(p)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-accent border-accent text-on-dark'
                      : 'border-border-subtle text-text-secondary hover:border-border-strong bg-bg-primary'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task List Groups */}
      {!hasAnyTasks ? (
        /* Premium Empty State */
        <div className="card text-center py-16 flex flex-col items-center justify-center border-dashed border-border-subtle">
          <div className="w-12 h-12 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center mb-4 text-text-muted animate-pulse">
            <CheckSquare size={20} className="stroke-1 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-text-primary mb-1">
            No tasks found
          </h3>
          <p className="text-xs text-text-secondary mb-6 max-w-xs leading-relaxed">
            There are no tasks matching your filters. Try clearing your filters or create a new task.
          </p>
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-4 h-9 bg-accent hover:bg-accent-hover text-on-dark text-xs font-semibold rounded-lg shadow-lg hover:shadow-accent/10 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
          >
            <Plus size={14} /> Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            if (group.items.length === 0) return null;

            return (
              <section key={group.status} className="space-y-3">
                {/* Section Header */}
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider pl-1">
                  {group.label} ({group.items.length})
                </h3>

                {/* Section Items */}
                <div className="space-y-2">
                  {group.items.map((task) => {
                    const isExpanded = expandedTaskId === task.id;
                    return (
                      <div
                        key={task.id}
                        className="bg-bg-surface border border-border-subtle hover:border-border-strong rounded-xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.01] transform"
                      >
                        {/* Task Row */}
                        <div className="flex items-center justify-between h-[52px] px-4 group">
                          <div className="flex items-center gap-3.5 flex-1 min-w-0 mr-4">
                            {/* Checkbox */}
                            <button
                              type="button"
                              onClick={() => completeTask(task.id)}
                              className="flex-shrink-0 w-5 h-5 rounded-full border border-border-strong flex items-center justify-center hover:border-accent hover:bg-accent-muted transition-colors relative outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-bg-primary"
                            >
                              {task.status === 'done' && (
                                <span className="flex items-center justify-center w-full h-full bg-accent text-on-dark rounded-full">
                                  <Check size={12} strokeWidth={3} />
                                </span>
                              )}
                              <span className="sr-only">Complete task</span>
                            </button>

                            {/* Title (Collapsible Trigger) */}
                            <button
                              type="button"
                              onClick={() => handleToggleExpand(task)}
                              className={`text-left text-sm font-semibold truncate hover:text-accent transition-colors flex-1 outline-none ${
                                task.status === 'done'
                                  ? 'text-text-muted line-through'
                                  : 'text-text-primary'
                              }`}
                            >
                              {task.title}
                            </button>
                          </div>

                          {/* Badges / Actions */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Subject badge */}
                            <span
                              style={{
                                backgroundColor: `${subjects.find((sub) => sub.id === task.subject)?.color ?? '#6366f1'}15`,
                                borderColor: `${subjects.find((sub) => sub.id === task.subject)?.color ?? '#6366f1'}35`,
                                color: subjects.find((sub) => sub.id === task.subject)?.color ?? '#6366f1',
                              }}
                              className="px-2.5 py-0.5 text-[10px] font-medium border rounded-md"
                            >
                              {subjects.find((sub) => sub.id === task.subject)?.name ?? task.subject}
                            </span>

                            {/* Priority badge (hidden on mobile) */}
                            <span
                              className={`hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-medium border rounded-md ${getPriorityBadgeClass(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>

                            {/* Due date */}
                            <span
                              className={`text-[10px] flex items-center gap-1 font-mono ${getDateBadgeClass(
                                task.dueDate,
                                task.status
                              )}`}
                            >
                              <Calendar size={11} />
                              {task.dueDate === todayStr ? 'Today' : task.dueDate}
                            </span>

                            {/* Hover Actions */}
                            <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                              <button
                                onClick={() => handleToggleExpand(task)}
                                className="p-1.5 hover:bg-bg-elevated rounded text-text-secondary hover:text-text-primary transition-colors focus-visible:ring-1 focus-visible:ring-indigo-500 outline-none"
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(task.id)}
                                className="p-1.5 hover:bg-red-500/10 rounded text-text-secondary hover:text-danger-color transition-colors focus-visible:ring-1 focus-visible:ring-red-500 outline-none"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Edit Form */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="border-t border-border-subtle bg-bg-elevated/30"
                            >
                              <div className="p-4 space-y-4">
                                {/* Title Input */}
                                <div>
                                  <label htmlFor={`edit-title-${task.id}`} className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                                    Task Name
                                  </label>
                                  <input
                                    id={`edit-title-${task.id}`}
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full bg-bg-primary border border-border-subtle focus:border-accent focus:ring-1 focus:ring-accent rounded-lg px-3 py-2 text-sm text-text-primary outline-none transition-colors"
                                  />
                                </div>

                                {/* Subject, Priority, DueDate, Status Row */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {/* Subject */}
                                  <div>
                                    <label htmlFor={`edit-subject-${task.id}`} className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                                      Subject
                                    </label>
                                    <select
                                      id={`edit-subject-${task.id}`}
                                      value={editSubject}
                                      onChange={(e) => setEditSubject(e.target.value)}
                                      className="w-full bg-bg-primary border border-border-subtle focus:border-accent focus:ring-1 focus:ring-accent rounded-lg px-2.5 py-1.8 text-xs text-text-primary outline-none transition-colors"
                                    >
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                          {s.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Priority */}
                                  <div>
                                    <label htmlFor={`edit-priority-${task.id}`} className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                                      Priority
                                    </label>
                                    <select
                                      id={`edit-priority-${task.id}`}
                                      value={editPriority}
                                      onChange={(e) => setEditPriority(e.target.value as Priority)}
                                      className="w-full bg-bg-primary border border-border-subtle focus:border-accent focus:ring-1 focus:ring-accent rounded-lg px-2.5 py-1.8 text-xs text-text-primary outline-none transition-colors"
                                    >
                                      <option value="low">Low</option>
                                      <option value="medium">Medium</option>
                                      <option value="high">High</option>
                                    </select>
                                  </div>

                                  {/* Due Date */}
                                  <div>
                                    <label htmlFor={`edit-due-date-${task.id}`} className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                                      Due Date
                                    </label>
                                    <input
                                      id={`edit-due-date-${task.id}`}
                                      type="date"
                                      value={editDueDate}
                                      onChange={(e) => setEditDueDate(e.target.value)}
                                      className="w-full bg-bg-primary border border-border-subtle focus:border-accent focus:ring-1 focus:ring-accent rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none transition-colors"
                                    />
                                  </div>

                                  {/* Status */}
                                  <div>
                                    <label htmlFor={`edit-status-${task.id}`} className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                                      Status
                                    </label>
                                    <select
                                      id={`edit-status-${task.id}`}
                                      value={editStatus}
                                      onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                                      className="w-full bg-bg-primary border border-border-subtle focus:border-accent focus:ring-1 focus:ring-accent rounded-lg px-2.5 py-1.8 text-xs text-text-primary outline-none transition-colors"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="in-progress">In Progress</option>
                                      <option value="done">Completed</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteClick(task.id)}
                                    className="text-xs font-semibold text-danger-color hover:text-red-400 flex items-center gap-1 transition-colors"
                                  >
                                    <Trash2 size={13} /> Delete task
                                  </button>

                                  <div className="flex gap-2.5">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedTaskId(null)}
                                      className="px-3.5 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-elevated hover:bg-bg-surface border border-border-subtle rounded-lg transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(task.id)}
                                      className="px-4 py-1.5 text-xs font-semibold text-on-dark bg-accent hover:bg-accent-hover rounded-lg transition-colors"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
};
