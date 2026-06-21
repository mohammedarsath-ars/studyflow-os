import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Reminder } from '../types';

interface ReminderStore {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
}

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set) => ({
      reminders: [],
      addReminder: (reminderData) =>
        set((state) => ({
          reminders: [
            {
              ...reminderData,
              active: reminderData.active ?? true,
              id: Math.random().toString(36).substring(2, 9),
              createdAt: new Date().toISOString(),
            },
            ...state.reminders,
          ],
        })),
      updateReminder: (id, updates) =>
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, ...updates } : reminder
          ),
        })),
      deleteReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.id !== id),
        })),
    }),
    { name: 'sf_reminders' }
  )
);
