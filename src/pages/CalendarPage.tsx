import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAssignmentStore } from '../stores/assignmentStore';
import { useExamStore } from '../stores/examStore';
import { useSubjectStore } from '../stores/subjectStore';
import { format, addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays, BookOpen, CalendarCheck } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const assignments = useAssignmentStore((state) => state.assignments);
  const exams = useExamStore((state) => state.exams);
  const subjects = useSubjectStore((state) => state.subjects);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    [calendarStart, calendarEnd]
  );

  const cellEntries = useMemo(
    () =>
      days.map((day) => {
        const dueAssignments = assignments.filter((assignment) => assignment.dueDate === format(day, 'yyyy-MM-dd'));
        const dueExams = exams.filter((exam) => exam.examDate === format(day, 'yyyy-MM-dd'));
        return { day, dueAssignments, dueExams };
      }),
    [days, assignments, exams]
  );

  const upcomingItems = useMemo(
    () =>
      [...assignments.map((assignment) => ({
        type: 'assignment' as const,
        date: assignment.dueDate,
        title: assignment.title,
        subjectId: assignment.subjectId,
        status: assignment.status,
      })),
      ...exams.map((exam) => ({
        type: 'exam' as const,
        date: exam.examDate,
        title: exam.title,
        subjectId: exam.subjectId,
        status: 'scheduled' as const,
      }))]
        .filter((item) => item.date >= format(new Date(), 'yyyy-MM-dd'))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 6),
    [assignments, exams]
  );

  const getSubject = (id: string) => subjects.find((subj) => subj.id === id) ?? { id: id, name: id, color: '#6366f1' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text-muted uppercase tracking-[0.28em] mb-2">
            Calendar
          </p>
          <h1 className="text-3xl font-semibold text-text-primary">Monthly Planner</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-sm text-text-muted">{format(currentMonth, 'MMMM yyyy')}</p>
            <p className="text-base font-semibold text-text-primary">{format(currentMonth, 'EEEE')}</p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="hidden sm:grid grid-cols-7 gap-3 text-[11px] uppercase text-text-muted tracking-[0.3em] mb-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-center font-semibold">{day}</div>
        ))}
      </div>

      <div className="hidden sm:grid grid-cols-7 gap-3">
        {cellEntries.map(({ day, dueAssignments, dueExams }) => {
          const inCurrentMonth = isSameMonth(day, monthStart);
          const isToday = (formattedDate: string) => formattedDate === format(new Date(), 'yyyy-MM-dd');
          const todayBadge = isToday(format(day, 'yyyy-MM-dd'));
          return (
            <motion.div
              key={day.toISOString()}
              className={`min-h-[120px] p-4 rounded-[28px] border ${inCurrentMonth ? 'border-border-subtle' : 'border-border-subtle/50'} bg-bg-surface ${todayBadge ? 'ring-1 ring-accent/40 bg-accent-soft/10' : ''} transition-all hover:border-accent-hover hover:bg-bg-elevated`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`text-sm font-semibold ${inCurrentMonth ? 'text-text-primary' : 'text-text-muted'}`}>
                  {format(day, 'd')}
                </span>
                {dueExams.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-500/10 text-purple-300">
                    <CalendarCheck size={12} />{dueExams.length}
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-2">
                {dueAssignments.slice(0, 2).map((assignment) => {
                  const subject = getSubject(assignment.subjectId);
                  return (
                    <div key={assignment.id} className="rounded-[22px] px-2.5 py-2 bg-bg-elevated border border-border-subtle text-[11px] text-text-secondary transition-all hover:border-accent-hover hover:bg-bg-surface">
                      <span className="block truncate font-semibold text-text-primary">{assignment.title}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                        {subject.name}
                      </span>
                    </div>
                  );
                })}
                {dueExams.slice(0, 1).map((exam) => {
                  const subject = getSubject(exam.subjectId);
                  return (
                    <div key={exam.id} className="rounded-2xl px-2 py-1 bg-purple-950/50 border border-purple-900 text-[10px] text-purple-200">
                      <span className="block truncate font-medium">{exam.title}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-purple-300">
                        <BookOpen size={12} /> {subject.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile-only Agenda Schedule List */}
      <div className="sm:hidden space-y-4">
        {cellEntries.filter(({ dueAssignments, dueExams }) => dueAssignments.length > 0 || dueExams.length > 0).length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-border-subtle bg-bg-surface p-8 text-center text-xs text-text-muted">
            No deadlines or exams scheduled for this month.
          </div>
        ) : (
          cellEntries
            .filter(({ dueAssignments, dueExams }) => dueAssignments.length > 0 || dueExams.length > 0)
            .map(({ day, dueAssignments, dueExams }) => {
              const isTodayDate = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div key={day.toISOString()} className={`p-4 rounded-[22px] border ${isTodayDate ? 'border-accent/30 bg-accent-soft/20' : 'border-border-subtle bg-bg-surface'} space-y-3`}>
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <span className="text-xs font-semibold text-text-primary">
                      {format(day, 'EEEE, MMM d, yyyy')}
                    </span>
                    {isTodayDate && (
                      <span className="text-[9px] font-bold text-accent bg-accent-soft px-2.5 py-0.5 rounded-full uppercase tracking-[0.2em]">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {dueAssignments.map((assignment) => {
                      const subject = getSubject(assignment.subjectId);
                      return (
                        <div key={assignment.id} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
                            <span className="font-semibold text-text-primary truncate">{assignment.title}</span>
                          </div>
                          <span className="text-[9px] text-text-secondary bg-bg-elevated border border-border-subtle px-2 py-0.5 rounded flex-shrink-0 ml-2">
                            Assignment
                          </span>
                        </div>
                      );
                    })}
                    {dueExams.map((exam) => {
                      const subject = getSubject(exam.subjectId);
                      return (
                        <div key={exam.id} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <BookOpen size={12} className="text-purple-400 flex-shrink-0" />
                            <span className="font-semibold text-text-primary truncate">{exam.title}</span>
                          </div>
                          <span className="text-[9px] text-purple-300 bg-purple-500/10 border border-purple-900/30 px-2 py-0.5 rounded flex-shrink-0 ml-2">
                            Exam • {subject.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
        )}
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          style={{ minHeight: '360px' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Upcoming deadlines</h2>
              <p className="text-xs text-text-muted">Stay ahead with assignments and exams due soon.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-2 text-xs text-text-secondary">
              <CalendarDays size={14} /> {upcomingItems.length} items
            </div>
          </div>
          <div className="space-y-3">
            {upcomingItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border-subtle p-8 text-center text-sm text-text-muted">
                No upcoming assignments or exams. Add a new item and keep your calendar full.
              </div>
            ) : (
              upcomingItems.map((item) => {
                const subject = getSubject(item.subjectId);
                return (
                  <div key={`${item.type}-${item.date}-${item.title}`} className="flex flex-col gap-2 rounded-3xl border border-border-subtle bg-bg-surface p-4">
                    <div className="flex items-center justify-between gap-3 font-medium">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                        <p className="text-[11px] text-text-muted">{item.type === 'exam' ? 'Exam' : 'Assignment'} • {format(parseISO(item.date), 'EEE, MMM d')}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-bg-elevated border border-border-subtle px-3 py-1 text-text-secondary">
                        {item.type === 'exam' ? 'Exam' : 'Due'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[11px] text-text-secondary">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
                        {subject.name}
                      </span>
                      <span className="uppercase tracking-[0.2em] text-[10px] text-text-muted">{item.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        <motion.div
          className="card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <CalendarDays size={18} className="text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Monthly summary</h3>
              <p className="text-[11px] text-text-muted">Overview of calendar activity.</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-text-secondary">
            <div className="flex items-center justify-between gap-2">
              <span>Assignments due</span>
              <strong className="text-text-primary">{assignments.filter((assignment) => assignment.dueDate.startsWith(format(monthStart, 'yyyy-MM'))).length}</strong>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Exams scheduled</span>
              <strong className="text-text-primary">{exams.filter((exam) => exam.examDate.startsWith(format(monthStart, 'yyyy-MM'))).length}</strong>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Distinct subjects</span>
              <strong className="text-text-primary">{new Set([...assignments, ...exams].map((item) => item.subjectId)).size}</strong>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
