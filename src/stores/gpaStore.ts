import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CourseGrade } from '../types';

interface GpaStore {
  courses: CourseGrade[];
  addCourse: (course: Omit<CourseGrade, 'id' | 'createdAt'>) => void;
  updateCourse: (id: string, updates: Partial<CourseGrade>) => void;
  deleteCourse: (id: string) => void;
}

export const useGpaStore = create<GpaStore>()(
  persist(
    (set) => ({
      courses: [],
      addCourse: (courseData) =>
        set((state) => ({
          courses: [
            {
              ...courseData,
              gradePoint: courseData.gradePoint,
              id: Math.random().toString(36).substring(2, 9),
              createdAt: new Date().toISOString(),
            },
            ...state.courses,
          ],
        })),
      updateCourse: (id, updates) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === id ? { ...course, ...updates } : course
          ),
        })),
      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((course) => course.id !== id),
        })),
    }),
    { name: 'sf_gpa' }
  )
);
