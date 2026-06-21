import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import supabase from '../lib/supabase';
import type { Task, TaskStatus } from '../types';

type TaskInput = Omit<Task, 'createdAt' | 'id'> & { id?: string; createdAt?: string };

type SupabaseTaskRow = {
  id: string;
  title: string;
  completed: boolean;
  created_at: string | null;
};

interface TaskStore {
  tasks: Task[];
  loadTasks: () => Promise<void>;
  addTask: (taskData: TaskInput) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
}

const mapRowToTask = (row: SupabaseTaskRow, existingTask?: Task): Task => {
  const createdAt = row.created_at ?? existingTask?.createdAt ?? new Date().toISOString();
  const completed = Boolean(row.completed);
  return {
    id: row.id,
    title: row.title,
    subject: existingTask?.subject ?? '',
    priority: existingTask?.priority ?? 'medium',
    dueDate: existingTask?.dueDate ?? new Date().toISOString().split('T')[0],
    status: completed ? 'done' : 'pending',
    createdAt,
    completedAt: completed ? row.created_at ?? existingTask?.completedAt ?? new Date().toISOString() : undefined,
  };
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      loadTasks: async () => {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, title, completed, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        if (!data) {
          return;
        }

        set((state) => ({
          tasks: data.map((row) =>
            mapRowToTask(row, state.tasks.find((task) => task.id === row.id))
          ),
        }));
      },
      addTask: async (taskData) => {
        const { data, error } = await supabase
          .from('tasks')
          .insert({ title: taskData.title, completed: taskData.status === 'done' })
          .select('id, created_at')
          .single();

        if (error || !data) {
          throw new Error(error?.message ?? 'Failed to create task');
        }

        const newTask: Task = {
          ...taskData,
          id: taskData.id ?? data.id,
          createdAt: taskData.createdAt ?? data.created_at ?? new Date().toISOString(),
        };

        set((state) => ({ tasks: [newTask, ...state.tasks] }));
      },
      updateTask: async (id, updates) => {
        const state = get();
        const existingTask = state.tasks.find((task) => task.id === id);
        if (!existingTask) {
          return;
        }

        const remoteUpdates: Partial<SupabaseTaskRow> = {};
        if (updates.title !== undefined) {
          remoteUpdates.title = updates.title;
        }
        if (updates.status !== undefined) {
          remoteUpdates.completed = updates.status === 'done';
        }

        if (Object.keys(remoteUpdates).length > 0) {
          const { error } = await supabase
            .from('tasks')
            .update(remoteUpdates)
            .eq('id', id);

          if (error) {
            throw new Error(error.message);
          }
        }

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...updates,
                  completedAt:
                    updates.status === 'done'
                      ? task.completedAt ?? new Date().toISOString()
                      : updates.status === 'pending'
                      ? undefined
                      : task.completedAt,
                }
              : task
          ),
        }));
      },
      deleteTask: async (id) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) {
          throw new Error(error.message);
        }

        set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
      },
      completeTask: async (id) => {
        const state = get();
        const task = state.tasks.find((item) => item.id === id);
        if (!task) {
          return;
        }

        const nextStatus: TaskStatus = task.status === 'done' ? 'pending' : 'done';

        const { error } = await supabase
          .from('tasks')
          .update({ completed: nextStatus === 'done' })
          .eq('id', id);

        if (error) {
          throw new Error(error.message);
        }

        set((state) => ({
          tasks: state.tasks.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: nextStatus,
                  completedAt: nextStatus === 'done' ? item.completedAt ?? new Date().toISOString() : undefined,
                }
              : item
          ),
        }));
      },
    }),
    {
      name: 'sf_tasks',
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);
