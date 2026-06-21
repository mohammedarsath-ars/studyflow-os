import type { Subject } from '../types';

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'math', name: 'Mathematics', color: '#6366f1' },
  { id: 'physics', name: 'Physics', color: '#a855f7' },
  { id: 'cs', name: 'Computer Science', color: '#22c55e' },
  { id: 'english', name: 'English', color: '#f59e0b' },
  { id: 'chem', name: 'Chemistry', color: '#3b82f6' },
  { id: 'bio', name: 'Biology', color: '#ec4899' },
  { id: 'history', name: 'History', color: '#14b8a6' },
  { id: 'art', name: 'Art', color: '#f97316' },
];

export const getSubjectColor = (subjectIdOrName: string): string => {
  const match = DEFAULT_SUBJECTS.find(
    (s) => s.id === subjectIdOrName || s.name.toLowerCase() === subjectIdOrName.toLowerCase()
  );
  return match ? match.color : '#6366f1';
};

export const getSubjectName = (subjectId: string): string => {
  const match = DEFAULT_SUBJECTS.find((s) => s.id === subjectId);
  return match ? match.name : subjectId;
};
