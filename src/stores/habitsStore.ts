import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Habit } from '../types';

interface HabitsStore {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void;
  toggleHabitCompletion: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;
}

export const useHabitsStore = create<HabitsStore>()(
  persist(
    (set) => ({
      habits: [],
      addHabit: (habitData) =>
        set((state) => ({
          habits: [
            {
              ...habitData,
              completedDates: [],
              id: Math.random().toString(36).substring(2, 9),
              createdAt: new Date().toISOString(),
            },
            ...state.habits,
          ],
        })),
      toggleHabitCompletion: (id, date) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;
            const hasCompleted = habit.completedDates.includes(date);
            return {
              ...habit,
              completedDates: hasCompleted
                ? habit.completedDates.filter((day) => day !== date)
                : [...habit.completedDates, date],
            };
          }),
        })),
      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        })),
    }),
    { name: 'sf_habits' }
  )
);
