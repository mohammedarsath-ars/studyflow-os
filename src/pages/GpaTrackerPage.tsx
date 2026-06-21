import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useGpaStore } from '../stores/gpaStore';
import { Plus, Trash2 } from 'lucide-react';

const gradeOptions = [4.0, 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.3, 1.0, 0.7, 0.0];

export const GpaTrackerPage: React.FC = () => {
  const { courses, addCourse, deleteCourse } = useGpaStore();
  const [courseName, setCourseName] = useState('');
  const [semester, setSemester] = useState('Fall 2025');
  const [credits, setCredits] = useState(3);
  const [gradePoint, setGradePoint] = useState(4.0);

  const cgpa = useMemo(() => {
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    if (!totalCredits) return 0;
    const weightedSum = courses.reduce((sum, course) => sum + course.gradePoint * course.credits, 0);
    return parseFloat((weightedSum / totalCredits).toFixed(2));
  }, [courses]);

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;
    addCourse({ courseName: courseName.trim(), semester, credits, gradePoint });
    setCourseName('');
    setCredits(3);
    setGradePoint(4.0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-text-muted mb-2">GPA Tracker</p>
          <h1 className="text-3xl font-semibold text-text-primary">Track your GPA and course performance</h1>
        </div>
        <div className="rounded-3xl border border-border-subtle bg-bg-elevated px-4 py-3 text-sm text-text-secondary">
          Current CGPA <span className="font-semibold text-accent">{cgpa.toFixed(2)}</span>
        </div>
      </div>

      <motion.section className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg font-semibold text-text-primary">Add course grades</h2>
        <p className="mt-2 text-sm text-text-secondary">Create courses, assign credits, and track your semester average at a glance.</p>

        <form onSubmit={handleAddCourse} className="grid gap-4 mt-6 sm:grid-cols-[1.4fr_0.85fr]">
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Course name"
            className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="Semester"
              className="rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            />
            <input
              type="number"
              min={1}
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              placeholder="Credits"
              className="rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <label className="text-sm text-text-muted">Grade</label>
            <select
              value={gradePoint}
              onChange={(e) => setGradePoint(Number(e.target.value))}
              className="rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            >
              {gradeOptions.map((value, index) => (
                <option key={`${value}-${index}`} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-accent-hover"
          >
            <Plus size={14} /> Save course
          </button>
        </form>
      </motion.section>

      {courses.length === 0 ? (
        <div className="card border-dashed border-border-subtle text-center py-12 text-text-muted bg-bg-surface">
          No course grades yet. Add completed classes and watch your CGPA change in real time.
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4">
          {courses.map((course) => (
            <div key={course.id} className="card flex flex-col gap-4 border-border-subtle bg-bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{course.courseName}</h3>
                <p className="text-sm text-text-secondary">{course.semester} • {course.credits} credits</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-accent-soft px-4 py-2 text-sm font-semibold text-accent">{course.gradePoint.toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => deleteCourse(course.id)}
                  className="rounded-2xl border border-border-subtle bg-bg-elevated px-4 py-2 text-sm text-text-secondary hover:text-danger-color hover:bg-bg-surface"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
