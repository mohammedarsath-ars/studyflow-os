import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if splash has already been shown in this session
    const hasShown = sessionStorage.getItem('sf_splash_shown');
    if (!hasShown) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('sf_splash_shown', 'true');
      }, 2400); // Wait 2.4s total before hiding
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-bg-primary select-none pointer-events-none"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-radial from-[rgba(124,127,249,0.18)] to-transparent blur-3xl" />

          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative flex items-center justify-center w-24 h-24 rounded-[28px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/25"
          >
            {/* Animated drawing lines inside logo */}
            <motion.div
              initial={{ rotate: -15, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
            >
              <Zap size={44} className="text-on-dark fill-current animate-pulse" />
            </motion.div>
          </motion.div>

          {/* Typography */}
          <div className="mt-8 text-center space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-2xl font-extrabold text-text-primary tracking-tighter"
            >
              StudyFlow OS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-xs text-text-secondary font-semibold uppercase tracking-widest"
            >
              The Student Workspace
            </motion.p>
          </div>

          {/* Spinner Preloader */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-16 flex items-center gap-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default SplashScreen;
