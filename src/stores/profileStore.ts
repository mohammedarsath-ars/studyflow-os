import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '../types';

interface ProfileStore {
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: {
        name: 'Mohammed Arsath',
        email: 'hello@studyflow.io',
        major: 'Computer Science',
        year: 'Junior',
        bio: 'Driven student building better study habits and smarter routines.',
        studyGoal: 'Finish 5 courses with A grades this semester',
        university: '',
        department: '',
        semester: '',
        studentId: '',
        avatar: '',
      },
      updateProfile: (updates) => set((state) => ({ profile: { ...state.profile, ...updates } })),
    }),
    { name: 'sf_profile' }
  )
);
