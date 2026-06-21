import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '../types';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (taskData) =>
        set((state) => {
          const newTask: Task = {
            ...taskData,
            id: Math.random().toString(36).substring(2, 9),
            createdAt: new Date().toISOString(),
          };
          return { tasks: [newTask, ...state.tasks] };
        }),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      completeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: 'done' as const,
                  completedAt: new Date().toISOString(),
                }
              : task
          ),
        })),
    }),
    {
      name: 'sf_tasks',
    }
  )
);
