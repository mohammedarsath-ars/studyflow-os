import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  CalendarDays, 
  Menu, 
  X,
  ClipboardList, 
  CalendarClock, 
  BookOpen, 
  Activity, 
  BarChart3, 
  BookOpenCheck,
  HeartPulse, 
  Bell, 
  User 
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const MobileNav: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Focus', path: '/focus', icon: Target },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays },
  ];

  const drawerItems = [
    { name: 'Assignments', path: '/assignments', icon: ClipboardList },
    { name: 'Exams', path: '/exams', icon: CalendarClock },
    { name: 'Subjects', path: '/subjects', icon: BookOpen },
    { name: 'Analytics', path: '/analytics', icon: Activity },
    { name: 'Goals', path: '/goals', icon: BarChart3 },
    { name: 'GPA Tracker', path: '/gpa', icon: BookOpenCheck },
    { name: 'Notes', path: '/notes', icon: BookOpen },
    { name: 'Habits', path: '/habits', icon: HeartPulse },
    { name: 'Reminders', path: '/reminders', icon: Bell },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Persistent Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-surface/90 backdrop-blur-xl border-t border-border-subtle flex items-center justify-around z-50 px-2 pb-safe select-none shadow-lg">
        {mainItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 min-w-[64px] h-full text-xs font-semibold transition-colors ${
                  isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              <Icon size={18} />
              <span className="text-[9px] tracking-wide">{item.name}</span>
            </NavLink>
          );
        })}

        {/* Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-full text-xs font-semibold transition-colors outline-none ${
            isMenuOpen ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          <span className="text-[9px] tracking-wide">Menu</span>
        </button>
      </nav>

      {/* Drawer Overlay Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex items-end">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Sliding Drawer Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-h-[80vh] bg-bg-surface/95 backdrop-blur-2xl border-t border-border-strong rounded-t-[28px] p-6 shadow-2xl overflow-y-auto pb-24 z-50"
            >
              {/* Drawer Pull Indicator Line */}
              <div className="w-12 h-1 bg-border-strong rounded-full mx-auto mb-6 opacity-60" />

              <div className="flex justify-between items-center mb-5 border-b border-border-subtle pb-3">
                <h3 className="text-sm font-bold text-text-primary tracking-wider uppercase">More Features</h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 hover:bg-bg-elevated rounded-xl text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Grid Layout of Features */}
              <div className="grid grid-cols-3 gap-4">
                {drawerItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center gap-2 ${
                          isActive
                            ? 'bg-accent-soft border-accent-glow text-accent font-bold scale-95'
                            : 'bg-bg-elevated border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-surface hover:shadow-md'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-accent text-text-primary' : 'bg-bg-surface border border-border-subtle'}`}>
                            <Icon size={18} />
                          </span>
                          <span className="text-[10px] font-medium leading-tight truncate w-full">{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
export default MobileNav;
