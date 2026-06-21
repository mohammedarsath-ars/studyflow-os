import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useExamStore } from '../stores/examStore';
import { useSubjectStore } from '../stores/subjectStore';
import { parseISO, format, differenceInDays, differenceInHours, differenceInMinutes, isAfter, isToday } from 'date-fns';
import { AlertCircle, CalendarClock, Clock3, Trash2, Plus } from 'lucide-react';

export const ExamCountdown: React.FC = () => {
  const exams = useExamStore((state) => state.exams);
  const subjects = useSubjectStore((state) => state.subjects);
  const deleteExam = useExamStore((state) => state.deleteExam);
  const addExam = useExamStore((state) => state.addExam);

  // Form States
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [examDate, setExamDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  const upcomingExams = useMemo(
    () => exams.filter((exam) => isAfter(parseISO(exam.examDate), new Date()) || isToday(parseISO(exam.examDate))).sort((a, b) => a.examDate.localeCompare(b.examDate)),
    [exams]
  );

  const nextExam = upcomingExams[0] ?? null;

  const countdown = useMemo(() => {
    if (!nextExam) return null;
    const target = parseISO(nextExam.examDate + 'T09:00:00');
    const days = differenceInDays(target, new Date());
    const hours = differenceInHours(target, new Date()) % 24;
    const minutes = differenceInMinutes(target, new Date()) % 60;
    return { days, hours, minutes };
  }, [nextExam]);

  const getSubject = (id: string) => subjects.find((subject) => subject.id === id) ?? { id, name: id, color: '#6366f1' };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId || !examDate) return;
    addExam({
      title: title.trim(),
      subjectId,
      examDate,
      notes: notes.trim() || undefined,
    });
    setTitle('');
    setNotes('');
    setExamDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-text-muted mb-2">Exam Countdown</p>
          <h1 className="text-3xl font-semibold text-text-primary">Stay ahead of exam day</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-4 py-3 text-xs text-text-secondary">
          <CalendarClock size={16} /> {upcomingExams.length} upcoming exams
        </div>
      </div>

      {/* Main Grid: Next Exam Details (Left) + Add Exam Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Next Exam Block */}
        <div className="lg:col-span-7 space-y-6">
          <motion.section 
            className="card relative overflow-hidden border-accent/10 p-6"
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Ambient Background Light */}
            <div className="absolute top-0 right-0 w-[200px] h-[100px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

            <div className="rounded-[24px] border border-accent/15 bg-accent/10 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-indigo-400 uppercase tracking-[0.25em] font-semibold">Next Exam</p>
                  <h2 className="text-xl font-bold text-text-primary mt-1">{nextExam ? nextExam.title : 'No exams scheduled'}</h2>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-indigo-400">
                  <AlertCircle size={20} />
                </div>
              </div>

              {nextExam ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-bg-surface border border-border-subtle p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold">Subject</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{getSubject(nextExam.subjectId).name}</p>
                  </div>
                  <div className="rounded-2xl bg-bg-surface border border-border-subtle p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold">Date</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{format(parseISO(nextExam.examDate), 'EEEE, MMM d')}</p>
                  </div>
                </div>
              ) : null}
            </div>

            {nextExam ? (
              <div className="mt-6 rounded-[24px] border border-border-subtle bg-bg-surface/50 p-5 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-text-muted font-bold">Time Remaining</p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  {['Days', 'Hours', 'Minutes'].map((label) => {
                    const value = label === 'Days' ? countdown?.days : label === 'Hours' ? countdown?.hours : countdown?.minutes;
                    return (
                      <div key={label} className="min-w-[90px] rounded-2xl bg-bg-elevated border border-border-subtle p-4">
                        <p className="text-2xl font-mono font-bold text-text-primary">{value ?? '--'}</p>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-text-muted mt-1 font-bold">{label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-border-subtle bg-bg-surface/50 p-6 text-center text-text-muted text-sm leading-relaxed">
                Add an exam using the scheduler form to start the timer countdown.
              </div>
            )}
          </motion.section>
        </div>

        {/* Add Exam Form Block */}
        <div className="lg:col-span-5">
          <motion.section 
            className="card p-6"
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <form onSubmit={handleAddExam} className="space-y-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-text-primary">Add new exam</h2>
                <p className="text-xs text-text-secondary mt-1">Keep track of test dates, revisions, and room allocations.</p>
              </div>

              <div>
                <label htmlFor="exam-title-input" className="sr-only">Exam Title</label>
                <input
                  id="exam-title-input"
                  type="text"
                  placeholder="Exam title (e.g., Midterm)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-bg-primary border border-border-subtle rounded-2xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="exam-subject-select" className="sr-only">Subject</label>
                  <select
                    id="exam-subject-select"
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full bg-bg-primary border border-border-subtle rounded-2xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                    required
                  >
                    <option value="" disabled>Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="exam-date-input" className="sr-only">Exam Date</label>
                  <input
                    id="exam-date-input"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-bg-primary border border-border-subtle rounded-2xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="exam-notes-input" className="sr-only">Optional Notes</label>
                <input
                  id="exam-notes-input"
                  type="text"
                  placeholder="Optional notes (e.g., Room 304, Chapters 1-5)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-bg-primary border border-border-subtle rounded-2xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-accent-hover outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-md"
              >
                Schedule Exam
                <Plus size={15} />
              </button>
            </form>
          </motion.section>
        </div>

      </div>

      {/* Upcoming Roadmap Section */}
      <motion.section 
        className="card"
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-text-muted font-bold">Upcoming exam list</p>
            <h2 className="text-lg font-semibold text-text-primary mt-1">Exam roadmap</h2>
          </div>
          <span className="text-xs bg-bg-elevated border border-border-subtle px-3 py-1 rounded-full text-text-secondary">{upcomingExams.length} entries</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingExams.length === 0 ? (
            <div className="md:col-span-2 rounded-[24px] border border-dashed border-border-subtle bg-bg-surface p-8 text-center text-text-muted text-sm">
              No upcoming exams found. Fill out the scheduler form above to populate your roadmap.
            </div>
          ) : (
            upcomingExams.map((exam) => {
              const subject = getSubject(exam.subjectId);
              const daysToGo = differenceInDays(parseISO(exam.examDate), new Date());
              return (
                <motion.div
                  key={exam.id}
                  className="rounded-3xl border border-border-subtle bg-bg-surface p-5 flex flex-col justify-between hover:border-border-strong transition-colors"
                  layout
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-text-primary">{exam.title}</p>
                      <p className="text-[11px] text-text-muted font-medium">{format(parseISO(exam.examDate), 'EEEE, MMM d, yyyy')}</p>
                      {exam.notes && <p className="text-xs text-text-secondary italic mt-1.5">{exam.notes}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteExam(exam.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-bg-elevated px-3 py-1.5 text-xs text-text-secondary hover:text-danger-color transition-colors"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-4 text-xs text-text-secondary border-t border-border-subtle pt-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
                      {subject.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated border border-border-subtle px-3 py-1 font-medium">
                      <Clock3 size={12} /> 
                      {daysToGo === 0 ? 'Today!' : daysToGo < 0 ? 'Passed' : `${daysToGo} ${daysToGo === 1 ? 'day' : 'days'} to go`}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.section>
    </div>
  );
};
