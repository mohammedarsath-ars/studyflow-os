import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Assignment } from '../types';

interface AssignmentStore {
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
}

export const useAssignmentStore = create<AssignmentStore>()(
  persist(
    (set) => ({
      assignments: [],
      addAssignment: (assignmentData) =>
        set((state) => ({
          assignments: [
            {
              ...assignmentData,
              id: Math.random().toString(36).substring(2, 9),
              createdAt: new Date().toISOString(),
            },
            ...state.assignments,
          ],
        })),
      updateAssignment: (id, updates) =>
        set((state) => ({
          assignments: state.assignments.map((assignment) =>
            assignment.id === id ? { ...assignment, ...updates } : assignment
          ),
        })),
      deleteAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((assignment) => assignment.id !== id),
        })),
    }),
    {
      name: 'sf_assignments',
    }
  )
);
