import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Topbar } from './components/Topbar';
import { QuickAddModal } from './components/QuickAddModal';
import { Dashboard } from './pages/Dashboard';
import { TaskManager } from './pages/TaskManager';
import { FocusCenter } from './pages/FocusCenter';
import { CalendarPage } from './pages/CalendarPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { ExamCountdown } from './pages/ExamCountdown';
import { SubjectManagement } from './pages/SubjectManagement';
import { WeeklyAnalytics } from './pages/WeeklyAnalytics';
import { GoalsPage } from './pages/GoalsPage';
import { GpaTrackerPage } from './pages/GpaTrackerPage';
import { NotesPage } from './pages/NotesPage';
import { HabitsPage } from './pages/HabitsPage';
import { RemindersPage } from './pages/RemindersPage';
import { ProfilePage } from './pages/ProfilePage';
import { useTimerStore } from './stores/timerStore';
import { useThemeStore } from './stores/themeStore';
import { Toaster } from 'sonner';

// Auth Pages
import { Login } from './pages/auth/Login';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { OtpVerification } from './pages/auth/OtpVerification';

// Brand Screens
import { SplashScreen } from './components/SplashScreen';
import { AnimatePresence, motion } from 'framer-motion';

const pageTransition = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
};

const AppContent: React.FC<{
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  theme: string;
}> = ({ quickAddOpen, setQuickAddOpen, theme }) => {
  const location = useLocation();

  // Check if current path is a standalone authentication route
  const isAuthRoute = ['/login', '/signup', '/forgot-password', '/verify-otp'].includes(location.pathname);

  if (isAuthRoute) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<OtpVerification />} />
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans antialiased">
      {/* Desktop Sidebar Layout */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen pb-24 md:pb-0 relative main-content-layout">
        <Toaster
          theme={theme === 'dark' ? 'dark' : 'light'}
          position="bottom-right"
          toastOptions={{
            className: 'glass !bg-bg-elevated !border-border-subtle !text-text-primary',
          }}
        />

        {/* Topbar Header */}
        <Topbar onQuickAddClick={() => setQuickAddOpen(true)} />

        {/* Page Routing with Animated Page Transitions */}
        <main className="flex-1 w-full max-w-[1100px] mx-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <motion.div {...pageTransition}>
                    <Dashboard onOpenQuickAdd={() => setQuickAddOpen(true)} />
                  </motion.div>
                }
              />
              <Route
                path="/tasks"
                element={
                  <motion.div {...pageTransition}>
                    <TaskManager onOpenQuickAdd={() => setQuickAddOpen(true)} />
                  </motion.div>
                }
              />
              <Route
                path="/focus"
                element={
                  <motion.div {...pageTransition}>
                    <FocusCenter />
                  </motion.div>
                }
              />
              <Route
                path="/calendar"
                element={
                  <motion.div {...pageTransition}>
                    <CalendarPage />
                  </motion.div>
                }
              />
              <Route
                path="/assignments"
                element={
                  <motion.div {...pageTransition}>
                    <AssignmentsPage />
                  </motion.div>
                }
              />
              <Route
                path="/exams"
                element={
                  <motion.div {...pageTransition}>
                    <ExamCountdown />
                  </motion.div>
                }
              />
              <Route
                path="/subjects"
                element={
                  <motion.div {...pageTransition}>
                    <SubjectManagement />
                  </motion.div>
                }
              />
              <Route
                path="/analytics"
                element={
                  <motion.div {...pageTransition}>
                    <WeeklyAnalytics />
                  </motion.div>
                }
              />
              <Route
                path="/goals"
                element={
                  <motion.div {...pageTransition}>
                    <GoalsPage />
                  </motion.div>
                }
              />
              <Route
                path="/gpa"
                element={
                  <motion.div {...pageTransition}>
                    <GpaTrackerPage />
                  </motion.div>
                }
              />
              <Route
                path="/notes"
                element={
                  <motion.div {...pageTransition}>
                    <NotesPage />
                  </motion.div>
                }
              />
              <Route
                path="/habits"
                element={
                  <motion.div {...pageTransition}>
                    <HabitsPage />
                  </motion.div>
                }
              />
              <Route
                path="/reminders"
                element={
                  <motion.div {...pageTransition}>
                    <RemindersPage />
                  </motion.div>
                }
              />
              <Route
                path="/profile"
                element={
                  <motion.div {...pageTransition}>
                    <ProfilePage />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </main>
      </div>

      {/* Global QuickAdd Modal */}
      <QuickAddModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const tick = useTimerStore((state) => state.tick);
  const timerStatus = useTimerStore((state) => state.status);
  const theme = useThemeStore((s) => s.theme);

  // Global Keyboard Shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickAddOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Timer ticking loop
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (timerStatus === 'running') {
      intervalId = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalId) clearInterval(intervalId);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerStatus, tick]);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  return (
    <Router>
      <SplashScreen />
      <AppContent quickAddOpen={quickAddOpen} setQuickAddOpen={setQuickAddOpen} theme={theme} />
    </Router>
  );
};

export default App;
