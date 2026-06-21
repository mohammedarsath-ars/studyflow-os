export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  subject: string; // The ID of the subject
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string; // hex color
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string; // YYYY-MM-DD
  status: TaskStatus;
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  examDate: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  durationMinutes: number;
  pomodorosCompleted: number;
}

export interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  dueDate: string;
  createdAt: string;
}

export interface CourseGrade {
  id: string;
  courseName: string;
  credits: number;
  gradePoint: number;
  semester: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  completedDates: string[];
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  notes: string;
  dateTime: string; // ISO string
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  active: boolean;
  createdAt: string;
}

export interface Profile {
  name: string;
  email: string;
  major: string;
  year: string;
  bio: string;
  studyGoal: string;
  university?: string;
  department?: string;
  semester?: string;
  studentId?: string;
  avatar?: string; // base64 data URL or image URL
}
