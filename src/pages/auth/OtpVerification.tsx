import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const OtpVerification: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auto focus first input on load
  useEffect(() => {
    inputRefs[0].current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;

    const newCode = [...code];
    newCode[index] = val.substring(val.length - 1);
    setCode(newCode);

    // Auto focus next input
    if (val && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = code.join('');
    if (finalCode.length < 4) {
      toast.error('Please enter the complete 4-digit code.');
      return;
    }

    // Simulate OTP success
    toast.success('Account verified successfully! Welcome to StudyFlow OS! 🎉');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden landing-gradient-bg">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-radial from-[rgba(124,127,249,0.18)] to-transparent blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-radial from-[rgba(191,151,255,0.14)] to-transparent blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-[440px] p-8 md:p-10 rounded-3xl border border-border-subtle/30 shadow-2xl relative z-10 text-center animate-scale-in"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.7) 0%, rgba(10, 10, 20, 0.9) 100%)',
          backdropFilter: 'blur(32px)',
        }}
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25 mb-3">
            <Zap size={20} className="text-on-dark" />
          </div>
          <h2 className="text-2xl font-extrabold text-on-dark tracking-tight">Verify email</h2>
          <p className="text-xs text-text-secondary mt-1.5 font-medium max-w-[280px] leading-relaxed mx-auto">
            We've sent a 4-digit verification code to your email. Enter it below to activate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-14 h-14 bg-bg-elevated/10 border border-border-subtle/40 hover:border-border-strong focus:border-accent rounded-2xl text-center text-xl font-extrabold text-on-dark outline-none transition-all font-mono shadow-inner"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold text-sm text-on-dark bg-accent hover:bg-accent-hover active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-accent/25 mt-2"
          >
            Verify and activate <ShieldCheck size={16} />
          </button>
        </form>

        <p className="text-xs text-text-secondary mt-6 font-medium">
          Didn't receive code?{' '}
          <button
            type="button"
            onClick={() => toast.success('New verification code sent!')}
            className="text-indigo-400 font-bold hover:underline cursor-pointer bg-transparent border-none"
          >
            Resend code
          </button>
        </p>
      </motion.div>
    </div>
  );
};
export default OtpVerification;
