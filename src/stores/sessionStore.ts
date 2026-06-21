import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StudySession } from '../types';

interface SessionStore {
  sessions: StudySession[];
  addSession: (session: Omit<StudySession, 'id'>) => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      sessions: [],
      addSession: (sessionData) =>
        set((state) => {
          const newSession: StudySession = {
            ...sessionData,
            id: Math.random().toString(36).substring(2, 9),
          };
          return { sessions: [newSession, ...state.sessions] };
        }),
    }),
    {
      name: 'sf_sessions',
    }
  )
);
