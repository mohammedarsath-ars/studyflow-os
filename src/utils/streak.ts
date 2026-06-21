import { parseISO, format, subDays } from 'date-fns';
import type { Task, StudySession } from '../types';

export const calculateStreak = (tasks: Task[], sessions: StudySession[]): number => {
  const dates = new Set<string>();

  // Extract dates from completed tasks
  tasks.forEach((t) => {
    if (t.status === 'done' && t.completedAt) {
      try {
        const localDate = format(parseISO(t.completedAt), 'yyyy-MM-dd');
        dates.add(localDate);
      } catch {
        // Ignore parsing errors
      }
    }
  });

  // Extract dates from focus sessions
  sessions.forEach((s) => {
    try {
      const localDate = format(parseISO(s.startTime), 'yyyy-MM-dd');
      dates.add(localDate);
    } catch {
      // Ignore parsing errors
    }
  });

  if (dates.size === 0) return 0;

  // Sort unique dates descending
  const sortedDates = Array.from(dates).sort((a, b) => b.localeCompare(a));
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Check if user has studied today or yesterday to continue the streak
  let currentStreak = 0;
  let checkDate = new Date();

  // If the newest date is not today and not yesterday, the streak has broken (0)
  const newestDate = sortedDates[0];
  if (newestDate !== todayStr && newestDate !== yesterdayStr) {
    return 0;
  }

  // If the newest date is yesterday, start checking from yesterday. If today, start from today.
  if (newestDate === yesterdayStr) {
    checkDate = subDays(new Date(), 1);
  }

  // Count backwards to check consecutive days
  while (true) {
    const checkDateStr = format(checkDate, 'yyyy-MM-dd');
    if (dates.has(checkDateStr)) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  return currentStreak;
};
export default calculateStreak;
