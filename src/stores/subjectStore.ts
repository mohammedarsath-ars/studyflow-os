import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SUBJECTS } from '../constants/subjects';
import type { Subject } from '../types';
import { useTaskStore } from './taskStore';
import { useAssignmentStore } from './assignmentStore';
import { useExamStore } from './examStore';
import { useSessionStore } from './sessionStore';
import { useTimerStore } from './timerStore';

interface SubjectStore {
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Omit<Subject, 'id'>>) => void;
  deleteSubject: (id: string) => void;
}

export const useSubjectStore = create<SubjectStore>()(
  persist(
    (set) => ({
      subjects: DEFAULT_SUBJECTS,
      addSubject: (subjectData) =>
        set((state) => ({
          subjects: [
            {
              ...subjectData,
              id: Math.random().toString(36).substring(2, 9),
            },
            ...state.subjects,
          ],
        })),
      updateSubject: (id, updates) =>
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === id ? { ...subject, ...updates } : subject
          ),
        })),
      deleteSubject: (id) => {
        // Cascade delete tasks
        try {
          const tasks = useTaskStore.getState().tasks;
          useTaskStore.setState({ tasks: tasks.filter((t) => t.subject !== id) });
        } catch {
          // Ignore store errors
        }

        // Cascade delete assignments
        try {
          const assignments = useAssignmentStore.getState().assignments;
          useAssignmentStore.setState({ assignments: assignments.filter((a) => a.subjectId !== id) });
        } catch {
          // Ignore store errors
        }

        // Cascade delete exams
        try {
          const exams = useExamStore.getState().exams;
          useExamStore.setState({ exams: exams.filter((e) => e.subjectId !== id) });
        } catch {
          // Ignore store errors
        }

        // Cascade delete sessions
        try {
          const sessions = useSessionStore.getState().sessions;
          useSessionStore.setState({ sessions: sessions.filter((s) => s.subjectId !== id) });
        } catch {
          // Ignore store errors
        }

        // Clear active timer selection if matching
        try {
          if (useTimerStore.getState().selectedSubjectId === id) {
            useTimerStore.getState().selectSubject('');
          }
        } catch {
          // Ignore store errors
        }

        set((state) => ({
          subjects: state.subjects.filter((subject) => subject.id !== id),
        }));
      },
    }),
    {
      name: 'sf_subjects',
    }
  )
);
