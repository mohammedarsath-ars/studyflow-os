import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StudyGoal } from '../types';

interface GoalsStore {
  goals: StudyGoal[];
  addGoal: (goal: Omit<StudyGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<StudyGoal>) => void;
  deleteGoal: (id: string) => void;
}

export const useGoalsStore = create<GoalsStore>()(
  persist(
    (set) => ({
      goals: [],
      addGoal: (goalData) =>
        set((state) => ({
          goals: [
            {
              ...goalData,
              id: Math.random().toString(36).substring(2, 9),
              createdAt: new Date().toISOString(),
            },
            ...state.goals,
          ],
        })),
      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)),
        })),
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        })),
    }),
    { name: 'sf_goals' }
  )
);
