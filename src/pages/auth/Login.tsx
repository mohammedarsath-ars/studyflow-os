import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // Simulate login success
    toast.success('Welcome back to StudyFlow OS! 🎉');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden landing-gradient-bg">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-radial from-[rgba(124,127,249,0.18)] to-transparent blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-radial from-[rgba(191,151,255,0.14)] to-transparent blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-[440px] p-8 md:p-10 rounded-3xl border border-border-subtle bg-bg-surface shadow-2xl relative z-10"
        style={{
          backdropFilter: 'blur(32px)',
        }}
      >
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25 mb-3">
            <Zap size={20} className="text-on-dark" />
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">Welcome back</h2>
          <p className="text-xs text-text-secondary mt-1.5 font-medium">
            Enter your credentials to access your student workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-text-muted">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full h-11 pl-11 pr-4 bg-bg-elevated border border-border-subtle hover:border-border-strong focus:border-accent rounded-xl text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:ring-1 focus:ring-accent/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Password</label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-text-muted">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 pl-11 pr-4 bg-bg-elevated border border-border-subtle hover:border-border-strong focus:border-accent rounded-xl text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:ring-1 focus:ring-accent/20"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold text-sm text-on-dark bg-accent hover:bg-accent-hover active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-accent/25 mt-2"
          >
            Sign In <ArrowRight size={15} />
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle" />
          </div>
          <span className="relative px-3 text-[10px] font-bold text-text-muted uppercase bg-bg-surface rounded-md">
            or continue with
          </span>
        </div>

        <button
          onClick={() => {
            toast.success('Successfully connected GitHub account!');
            navigate('/');
          }}
          className="w-full h-11 rounded-xl font-semibold text-sm text-text-secondary hover:text-text-primary bg-bg-elevated hover:bg-bg-surface border border-border-subtle hover:border-border-strong transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> GitHub
        </button>

        <p className="text-center text-xs text-text-secondary mt-8 font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 font-bold hover:underline">
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
export default Login;
