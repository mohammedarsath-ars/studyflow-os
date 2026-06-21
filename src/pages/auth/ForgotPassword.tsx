import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simulate recovery link
    toast.success('Recovery link sent to your registered email! ✉️');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden landing-gradient-bg">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-radial from-[rgba(124,127,249,0.18)] to-transparent blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-radial from-[rgba(191,151,255,0.14)] to-transparent blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-[440px] p-8 md:p-10 rounded-3xl border border-border-subtle/30 shadow-2xl relative z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.7) 0%, rgba(10, 10, 20, 0.9) 100%)',
          backdropFilter: 'blur(32px)',
        }}
      >
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25 mb-3">
            <Zap size={20} className="text-on-dark" />
          </div>
          <h2 className="text-2xl font-extrabold text-on-dark tracking-tight">Reset password</h2>
          <p className="text-xs text-text-secondary mt-1.5 font-medium">
            Enter your email and we'll send you a password reset link.
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
                className="w-full h-11 pl-11 pr-4 bg-bg-elevated/10 border border-border-subtle/40 hover:border-border-strong focus:border-accent rounded-xl text-sm text-on-dark placeholder:text-text-muted outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold text-sm text-on-dark bg-accent hover:bg-accent-hover active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-accent/25 mt-2"
          >
            Send recovery link
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <Link
            to="/login"
            className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
export default ForgotPassword;
