import React, { useState, useEffect } from 'react';
import { useTimerStore } from '../stores/timerStore';
import type { TimerMode } from '../stores/timerStore';
import { useSessionStore } from '../stores/sessionStore';
import { useSubjectStore } from '../stores/subjectStore';
import { parseISO, isToday, format } from 'date-fns';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize2,
  Minimize2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const FocusCenter: React.FC = () => {
  const {
    mode,
    status,
    timeLeft,
    totalDuration,
    pomodorosCompleted,
    selectedSubjectId,
    workDuration,
    shortBreakDuration,
    showPulse,
    setWorkDuration,
    setShortBreakDuration,
    selectSubject,
    startTimer,
    pauseTimer,
    resetTimer,
    skipForward,
    skipBackward,
    setShowPulse,
  } = useTimerStore();

  const sessions = useSessionStore((state) => state.sessions);
  const subjects = useSubjectStore((state) => state.subjects);

  // Local UI States
  const [deepFocusOpen, setDeepFocusOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [shakeSelect, setShakeSelect] = useState(false);
  const [subjectTooltip, setSubjectTooltip] = useState(false);

  const circumference = 2 * Math.PI * 108; // radius = 108px
  const strokeDashoffset = circumference * (1 - timeLeft / totalDuration);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle shake timer start click
  const handleStartClick = () => {
    if (mode === 'work' && !selectedSubjectId) {
      setShakeSelect(true);
      setSubjectTooltip(true);
      setTimeout(() => {
        setShakeSelect(false);
      }, 400);
      return;
    }
    startTimer();
  };

  // Pulse animation reset
  useEffect(() => {
    if (showPulse) {
      const t = setTimeout(() => {
        setShowPulse(false);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [showPulse, setShowPulse]);

  // Deep Focus Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deepFocusOpen) {
        e.preventDefault();
        setShowExitConfirm(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deepFocusOpen]);

  const handleEndSessionConfirm = () => {
    resetTimer();
    setShowExitConfirm(false);
    setDeepFocusOpen(false);
  };

  // Today's Focus sessions filtered
  const todaySessions = sessions.filter((s) => {
    try {
      return isToday(parseISO(s.startTime));
    } catch {
      return false;
    }
  });

  const totalStudyMinutes = todaySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const getModeLabel = (m: TimerMode) => {
    if (m === 'work') return 'WORK';
    if (m === 'short_break') return 'SHORT BREAK';
    return 'LONG BREAK';
  };

  const getModeColor = (m: TimerMode) => {
    if (m === 'work') return 'stroke-indigo-500';
    if (m === 'short_break') return 'stroke-emerald-500';
    return 'stroke-purple-500';
  };

  const isTimerRunning = status === 'running';
  const isTimerActive = status === 'running' || status === 'paused';

  return (
    <div className="space-y-6 select-none">
      
      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Pomodoro Timer Ring & Controls (55% or 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <section className={`card flex flex-col items-center relative overflow-hidden transition-all duration-300 ${
            showPulse ? 'border-success/30 shadow-lg shadow-success/10' : ''
          }`}>
            
            {/* Subject Selector (above ring) */}
            <div className="w-full max-w-[280px] mb-8 relative">
              <label htmlFor="focus-subject-select" className="sr-only">Select a subject to start</label>
              <select
                id="focus-subject-select"
                disabled={isTimerActive && mode === 'work'}
                value={selectedSubjectId}
                onChange={(e) => {
                  selectSubject(e.target.value);
                  setSubjectTooltip(false);
                }}
                className={`w-full bg-bg-elevated border ${
                  shakeSelect ? 'border-danger/70 animate-shake' : 'border-border-subtle'
                } focus:border-accent rounded-2xl px-4 py-3 text-sm text-text-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Select a subject to start</option>
                  {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Shaking Subject Tooltip */}
              {subjectTooltip && !selectedSubjectId && (
                <div className="absolute top-11 left-0 right-0 bg-danger-color/10 border border-danger-color/30 text-danger-color text-[11px] font-semibold py-1.5 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 z-10">
                  <AlertCircle size={13} />
                  <span>Subject selection is required</span>
                </div>
              )}
            </div>

            {/* Timer Ring SVG Wrapper */}
            <div className="relative w-[260px] h-[260px] flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring Track */}
                <circle
                  cx="120"
                  cy="120"
                  r="108"
                  fill="transparent"
                  stroke="var(--border)"
                  strokeWidth="8"
                />
                {/* Active Progress Ring */}
                <motion.circle
                  cx="120"
                  cy="120"
                  r="108"
                  fill="transparent"
                  className={getModeColor(mode)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                  style={{
                    filter: mode === 'work' 
                      ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.45))'
                      : mode === 'short_break'
                      ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.45))'
                      : 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.45))'
                  }}
                />
              </svg>

              {/* Center digital readout */}
              <div className="absolute text-center">
                <span className="text-4xl font-mono font-bold tracking-tight text-text-primary block">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[10px] tracking-[0.2em] font-semibold text-text-secondary mt-1.5 block">
                  {getModeLabel(mode)}
                </span>
              </div>
            </div>

            {/* Session Dots Indicator */}
            <div className="flex gap-2.5 my-8">
              {[0, 1, 2, 3].map((idx) => {
                const isCompleted = idx < pomodorosCompleted;
                const isCurrent = idx === pomodorosCompleted && isTimerRunning && mode === 'work';
                return (
                  <div
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-accent border-accent'
                        : isCurrent
                        ? 'border border-accent bg-accent/20 animate-ping'
                        : 'bg-border-strong border border-border-subtle'
                    }`}
                  />
                );
              })}
            </div>

            {/* Timer Controls Row */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              {/* Skip Back / Reset */}
              <button
                onClick={skipBackward}
                className="w-12 h-12 flex items-center justify-center border border-border-subtle hover:border-border-strong bg-bg-elevated hover:bg-bg-surface rounded-full text-text-secondary hover:text-text-primary transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                title="Reset interval"
              >
                <RotateCcw size={16} />
              </button>

              {/* Play / Pause Toggle */}
              {isTimerRunning ? (
                <button
                  onClick={pauseTimer}
                  className="w-14 h-14 flex items-center justify-center bg-accent hover:bg-accent-hover text-on-dark rounded-full shadow-lg hover:shadow-accent/10 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                  title="Pause session"
                >
                  <Pause size={20} strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  onClick={handleStartClick}
                  className="w-14 h-14 flex items-center justify-center bg-accent hover:bg-accent-hover text-on-dark rounded-full shadow-lg hover:shadow-accent/10 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                  title="Start session"
                >
                  <Play size={20} className="ml-1" strokeWidth={2.5} />
                </button>
              )}

              {/* Skip Forward */}
              <button
                onClick={skipForward}
                className="w-12 h-12 flex items-center justify-center border border-border-subtle hover:border-border-strong bg-bg-elevated hover:bg-bg-surface rounded-full text-text-secondary hover:text-text-primary transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                title="Skip interval"
              >
                <SkipForward size={16} />
              </button>
            </div>

            {/* Deep Focus Button Trigger */}
            <button
              onClick={() => {
                if (mode === 'work' && !selectedSubjectId) {
                  setShakeSelect(true);
                  setSubjectTooltip(true);
                  setTimeout(() => setShakeSelect(false), 400);
                  return;
                }
                setDeepFocusOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold text-accent transition-all duration-200 hover:border-accent-hover hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-accent outline-none"
            >
              <Maximize2 size={14} /> Enter Deep Focus Mode
            </button>
          </section>
        </div>

        {/* Right Column: Configuration & Today's sessions list (45% or 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Config Card */}
          <section className="card space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Session Config</h3>
                <p className="text-xs text-text-muted">Customize focus and break duration with clarity.</p>
              </div>
              {isTimerActive && (
                <span className="rounded-full bg-warning-soft px-3 py-1 text-[11px] font-semibold text-warning">Locked</span>
              )}
            </div>
            
            {/* Work duration config */}
            <div className={`space-y-2 ${isTimerActive ? 'opacity-40 select-none pointer-events-none' : ''}`}>
              <div className="flex justify-between items-center text-xs text-text-secondary font-semibold">
                <span>Focus Duration</span>
                <span className="font-mono">{workDuration} min</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[25, 50].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setWorkDuration(mins)}
                    disabled={isTimerActive}
                    className={`py-2 text-xs font-semibold border rounded-lg transition-all ${
                      workDuration === mins
                        ? 'bg-accent border-accent text-on-dark'
                        : 'border-border-subtle text-text-secondary hover:border-border-strong bg-bg-primary'
                    }`}
                  >
                    {mins} Minutes
                  </button>
                ))}
              </div>
            </div>

            {/* Short break config */}
            <div className={`space-y-2 ${isTimerActive ? 'opacity-40 select-none pointer-events-none' : ''}`}>
              <div className="flex justify-between items-center text-xs text-text-secondary font-semibold">
                <span>Short Break Duration</span>
                <span className="font-mono">{shortBreakDuration} min</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[5, 10].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setShortBreakDuration(mins)}
                    disabled={isTimerActive}
                    className={`py-2 text-xs font-semibold border rounded-lg transition-all ${
                      shortBreakDuration === mins
                        ? 'bg-accent border-accent text-on-dark'
                        : 'border-border-subtle text-text-secondary hover:border-border-strong bg-bg-primary'
                    }`}
                  >
                    {mins} Minutes
                  </button>
                ))}
              </div>
            </div>

            {/* Disabled config note tooltip helper */}
            {isTimerActive && (
              <p className="text-[10px] text-text-muted flex items-center justify-center gap-1 bg-bg-elevated py-1.5 rounded-md border border-border-subtle">
                <AlertCircle size={11} className="text-warning-color" />
                Configuration locked during active sessions.
              </p>
            )}
          </section>

          {/* Today's History logs */}
          <section className="card flex flex-col min-h-[240px]">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Today's Sessions</h3>
                <p className="text-xs text-text-muted">Tracked focus history for the current day.</p>
              </div>
              <span className="text-xs font-mono font-bold text-accent">
                {totalStudyMinutes >= 60 
                  ? `${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`
                  : `${totalStudyMinutes}m total`
                }
              </span>
            </div>

            {todaySessions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center mb-3 text-text-muted">
                  <Calendar size={18} className="stroke-1 text-indigo-400" />
                </div>
                <span className="text-xs font-bold text-text-primary block mb-0.5">
                  No sessions logged today
                </span>
                <span className="text-[10px] text-text-secondary max-w-[200px] leading-relaxed">
                  Start the focus timer on the left to track and record your sessions.
                </span>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between py-2 px-3 bg-bg-elevated/40 border border-border-subtle rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        style={{ backgroundColor: subjects.find((subj) => subj.id === session.subjectId)?.color ?? '#6366f1' }}
                        className="w-2 h-2 rounded-full"
                      />
                      <div>
                        <span className="text-xs font-semibold text-text-primary block">
                          {subjects.find((subj) => subj.id === session.subjectId)?.name ?? session.subjectId}
                        </span>
                        <span className="text-[9px] text-text-muted">
                          {format(parseISO(session.startTime), 'p')}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-text-secondary bg-bg-surface px-2 py-0.5 rounded border border-border-subtle">
                      {session.durationMinutes} min
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

      </div>

      {/* Deep Focus Fullscreen Overlay */}
      <AnimatePresence>
        {deepFocusOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-bg-primary flex flex-col items-center justify-center p-6 overflow-hidden select-none"
          >
            {/* Soft Radial Gradients Drifting Slow Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
              <motion.div
                animate={{
                  x: [0, 40, -40, 0],
                  y: [0, -30, 30, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute -left-10 -top-10 w-[400px] h-[400px] rounded-full bg-gradient-radial from-indigo-500 to-transparent blur-3xl"
              />
              <motion.div
                animate={{
                  x: [0, -50, 50, 0],
                  y: [0, 40, -40, 0],
                }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute -right-20 -bottom-20 w-[500px] h-[500px] rounded-full bg-gradient-radial from-purple-500 to-transparent blur-3xl"
              />
            </div>

            {/* Main Center content */}
            <div className="relative text-center flex flex-col items-center max-w-lg z-10">
              
              {/* Subject details label */}
              {mode === 'work' && selectedSubjectId && (
                <span
                  style={{ color: subjects.find((subj) => subj.id === selectedSubjectId)?.color ?? '#6366f1' }}
                  className="text-sm font-semibold tracking-widest uppercase mb-10 block filter drop-shadow-[0_0_8px_rgba(99,102,241,0.2)]"
                >
                  {subjects.find((subj) => subj.id === selectedSubjectId)?.name ?? selectedSubjectId}
                </span>
              )}

              {/* Enhanced SVG Timer Ring (300px x 300px) */}
              <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-10">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="150"
                    cy="150"
                    r="138"
                    fill="transparent"
                    stroke="var(--border)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="150"
                    cy="150"
                    r="138"
                    fill="transparent"
                    className={getModeColor(mode)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 138}
                    animate={{ strokeDashoffset: 2 * Math.PI * 138 * (1 - timeLeft / totalDuration) }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                    style={{
                      filter: mode === 'work'
                        ? 'drop-shadow(0 0 12px rgba(99,102,241,0.85))'
                        : mode === 'short_break'
                        ? 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.85))'
                        : 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.85))'
                    }}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-6xl font-mono font-bold tracking-tight text-text-primary block">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-xs tracking-[0.25em] font-semibold text-text-muted mt-2 block">
                    {getModeLabel(mode)}
                  </span>
                </div>
              </div>

              {/* Simple Controls (Play/Pause) */}
              <div className="flex gap-4 items-center">
                {isTimerRunning ? (
                  <button
                    onClick={pauseTimer}
                    className="w-14 h-14 flex items-center justify-center border border-border-subtle hover:border-border-strong bg-bg-elevated hover:bg-bg-surface text-text-primary rounded-full transition-all outline-none"
                    title="Pause"
                  >
                    <Pause size={18} strokeWidth={2.5} />
                  </button>
                ) : (
                  <button
                    onClick={handleStartClick}
                    className="w-14 h-14 flex items-center justify-center bg-accent hover:bg-accent-hover text-on-dark rounded-full shadow-lg hover:shadow-accent/10 transition-all outline-none"
                    title="Start"
                  >
                    <Play size={18} className="ml-1" strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>

            {/* End session overlay button */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center z-10">
              <button
                onClick={() => setShowExitConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary bg-bg-elevated/40 border border-border-subtle hover:border-border-strong hover:bg-bg-surface px-4 py-2 rounded-lg transition-all focus-visible:ring-1 focus-visible:ring-indigo-500 outline-none"
              >
                <Minimize2 size={13} /> Exit Fullscreen (Esc)
              </button>
            </div>

            {/* Custom Escape warning popup */}
            <AnimatePresence>
              {showExitConfirm && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowExitConfirm(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card relative w-full max-w-[280px] bg-bg-surface border border-border-color p-5 text-center shadow-2xl"
                  >
                    <h4 className="text-sm font-semibold text-text-primary mb-1">
                      End this focus session?
                    </h4>
                    <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                      Your progress for this interval will not be logged.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowExitConfirm(false)}
                        className="py-2 text-xs font-semibold text-text-secondary bg-bg-elevated border border-border-subtle hover:bg-bg-surface hover:border-border-strong rounded-lg transition-colors"
                      >
                        Keep Going
                      </button>
                      <button
                        onClick={handleEndSessionConfirm}
                        className="py-2 text-xs font-semibold text-on-dark bg-danger-color hover:bg-red-600 rounded-lg transition-colors"
                      >
                        End Session
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
};
