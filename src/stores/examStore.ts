import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Exam } from '../types';

interface ExamStore {
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
}

export const useExamStore = create<ExamStore>()(
  persist(
    (set) => ({
      exams: [],
      addExam: (examData) =>
        set((state) => ({
          exams: [
            {
              ...examData,
              id: Math.random().toString(36).substring(2, 9),
              createdAt: new Date().toISOString(),
            },
            ...state.exams,
          ],
        })),
      updateExam: (id, updates) =>
        set((state) => ({
          exams: state.exams.map((exam) => (exam.id === id ? { ...exam, ...updates } : exam)),
        })),
      deleteExam: (id) =>
        set((state) => ({
          exams: state.exams.filter((exam) => exam.id !== id),
        })),
    }),
    {
      name: 'sf_exams',
    }
  )
);
