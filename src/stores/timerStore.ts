import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSessionStore } from './sessionStore';

export type TimerMode = 'work' | 'short_break' | 'long_break';
export type TimerStatus = 'idle' | 'running' | 'paused';

interface TimerStore {
  mode: TimerMode;
  status: TimerStatus;
  timeLeft: number; // in seconds
  totalDuration: number; // in seconds for current mode
  pomodorosCompleted: number; // 0 to 4
  selectedSubjectId: string;
  workDuration: number; // in minutes (default 25)
  shortBreakDuration: number; // in minutes (default 5)
  longBreakDuration: number; // in minutes (default 15)
  sessionStartTime: string | null; // ISO string
  showPulse: boolean;

  // Actions
  setWorkDuration: (mins: number) => void;
  setShortBreakDuration: (mins: number) => void;
  selectSubject: (subjectId: string) => void;
  startTimer: () => boolean; // returns false if subject not selected, true otherwise
  pauseTimer: () => void;
  resetTimer: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  tick: () => void;
  setShowPulse: (val: boolean) => void;
}

const getDurationForMode = (mode: TimerMode, state: { workDuration: number; shortBreakDuration: number; longBreakDuration: number }) => {
  if (mode === 'work') return state.workDuration * 60;
  if (mode === 'short_break') return state.shortBreakDuration * 60;
  return state.longBreakDuration * 60;
};

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      mode: 'work',
      status: 'idle',
      timeLeft: 25 * 60,
      totalDuration: 25 * 60,
      pomodorosCompleted: 0,
      selectedSubjectId: '',
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionStartTime: null,
      showPulse: false,

      setWorkDuration: (mins) =>
        set((state) => {
          if (state.status !== 'idle') return {};
          const newDur = mins * 60;
          return {
            workDuration: mins,
            timeLeft: state.mode === 'work' ? newDur : state.timeLeft,
            totalDuration: state.mode === 'work' ? newDur : state.totalDuration,
          };
        }),

      setShortBreakDuration: (mins) =>
        set((state) => {
          if (state.status !== 'idle') return {};
          const newDur = mins * 60;
          return {
            shortBreakDuration: mins,
            timeLeft: state.mode === 'short_break' ? newDur : state.timeLeft,
            totalDuration: state.mode === 'short_break' ? newDur : state.totalDuration,
          };
        }),

      selectSubject: (subjectId) => set({ selectedSubjectId: subjectId }),

      startTimer: () => {
        const state = get();
        if (state.mode === 'work' && !state.selectedSubjectId) {
          return false;
        }
        set({
          status: 'running',
          sessionStartTime: state.sessionStartTime || new Date().toISOString(),
        });
        return true;
      },

      pauseTimer: () => set({ status: 'paused' }),

      resetTimer: () =>
        set((state) => {
          const duration = getDurationForMode(state.mode, state);
          return {
            status: 'idle',
            timeLeft: duration,
            totalDuration: duration,
            sessionStartTime: null,
          };
        }),

      setShowPulse: (val) => set({ showPulse: val }),

      skipForward: () => {
        const state = get();
        // eslint-disable-next-line no-useless-assignment
        let nextMode: TimerMode = 'work';
        let nextPomodoroCount = state.pomodorosCompleted;

        if (state.mode === 'work') {
          nextPomodoroCount = state.pomodorosCompleted + 1;
          if (nextPomodoroCount >= 4) {
            nextMode = 'long_break';
            nextPomodoroCount = 0;
          } else {
            nextMode = 'short_break';
          }
        } else {
          nextMode = 'work';
        }

        const duration = getDurationForMode(nextMode, state);
        set({
          mode: nextMode,
          status: 'idle',
          pomodorosCompleted: nextPomodoroCount,
          timeLeft: duration,
          totalDuration: duration,
          sessionStartTime: null,
        });
      },

      skipBackward: () => {
        // Reset current session
        const state = get();
        const duration = getDurationForMode(state.mode, state);
        set({
          status: 'idle',
          timeLeft: duration,
          totalDuration: duration,
          sessionStartTime: null,
        });
      },

      tick: () => {
        const state = get();
        if (state.status !== 'running') return;

        if (state.timeLeft <= 1) {
          // Timer finished!
          const modeEnded = state.mode;
          // eslint-disable-next-line no-useless-assignment
          let nextMode: TimerMode = 'work';
          let nextPomodoroCount = state.pomodorosCompleted;

          if (modeEnded === 'work') {
            nextPomodoroCount = state.pomodorosCompleted + 1;
            
            // Log study session
            const startTime = state.sessionStartTime || new Date(Date.now() - state.workDuration * 60000).toISOString();
            const endTime = new Date().toISOString();
            
            useSessionStore.getState().addSession({
              subjectId: state.selectedSubjectId,
              startTime,
              endTime,
              durationMinutes: state.workDuration,
              pomodorosCompleted: 1,
            });

            if (nextPomodoroCount >= 4) {
              nextMode = 'long_break';
              nextPomodoroCount = 0;
            } else {
              nextMode = 'short_break';
            }
          } else {
            nextMode = 'work';
          }

          const duration = getDurationForMode(nextMode, state);
          set({
            mode: nextMode,
            status: 'idle',
            pomodorosCompleted: nextPomodoroCount,
            timeLeft: duration,
            totalDuration: duration,
            sessionStartTime: null,
            showPulse: true,
          });
        } else {
          set({ timeLeft: state.timeLeft - 1 });
        }
      },
    }),
    {
      name: 'sf_timer',
      partialize: (state) => ({
        mode: state.mode,
        status: state.status,
        timeLeft: state.timeLeft,
        totalDuration: state.totalDuration,
        pomodorosCompleted: state.pomodorosCompleted,
        selectedSubjectId: state.selectedSubjectId,
        workDuration: state.workDuration,
        shortBreakDuration: state.shortBreakDuration,
        longBreakDuration: state.longBreakDuration,
        sessionStartTime: state.sessionStartTime,
      }),
    }
  )
);
