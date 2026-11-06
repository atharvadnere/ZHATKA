import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';

export const LoginPage: React.FC = () => {
  const { login, setActivePage } = useAppState();

  const [email, setEmail] = useState('admin@srmist.edu.in');
  const [password, setPassword] = useState('zhatka2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const success = login(email.trim(), password);
    if (!success) {
      setError('Email or password is incorrect. Please verify credentials.');
    }
  };

  const fillDemoCreds = () => {
    setEmail('admin@srmist.edu.in');
    setPassword('zhatka2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-between p-4">
      {/* Top back button */}
      <div className="max-w-[400px] w-full mx-auto pt-6">
        <button
          onClick={() => setActivePage('landing')}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#737373] hover:text-[#202124] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>
      </div>

      {/* Centred 400px panel */}
      <div className="w-full max-w-[400px] mx-auto bg-white border border-[#E8E8E6] rounded-[10px] p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-9 h-9 rounded-[8px] bg-[#3478D4] text-white flex items-center justify-center mx-auto shadow-xs">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h1 className="text-[20px] font-semibold text-[#202124] tracking-tight">
            Sign in to ZHATKA
          </h1>
          <p className="text-[13px] text-[#737373]">
            Adaptive Campus Energy Response Planner
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-[#FCE4E4] border border-[#D92D20]/40 rounded-[8px] text-[12px] text-[#B42318] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#202124] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-[36px] px-3 text-[13px] border border-[#D4D4D1] rounded-[8px] bg-white text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#3478D4]"
              placeholder="admin@srmist.edu.in"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[12px] font-medium text-[#202124]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotDialogOpen(true)}
                className="text-[12px] text-[#3478D4] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-[36px] pl-3 pr-9 text-[13px] border border-[#D4D4D1] rounded-[8px] bg-white text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#3478D4]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-[#737373] hover:text-[#202124]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#3478D4] border-[#D4D4D1] focus:ring-[#3478D4]"
            />
            <label htmlFor="remember" className="ml-2 text-[12px] text-[#737373] select-none">
              Remember me on this browser
            </label>
          </div>

          <button
            type="submit"
            className="w-full h-[36px] bg-[#3478D4] hover:bg-[#2A67BC] text-white text-[13px] font-medium rounded-[8px] transition-colors shadow-xs"
          >
            Log in
          </button>
        </form>

        {/* Demo access notice & autofill helper */}
        <div className="pt-4 border-t border-[#E8E8E6] text-center space-y-2">
          <div className="text-[12px] text-[#737373]">
            Demo access — not production authentication.
          </div>
          <button
            type="button"
            onClick={fillDemoCreds}
            className="text-[12px] font-mono text-[#1F5FB0] bg-[#EAF2FC] hover:bg-[#d8e8fc] px-2.5 py-1 rounded-[6px] transition-colors"
          >
            admin@srmist.edu.in / zhatka2026
          </button>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {forgotDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] border border-[#E8E8E6] max-w-[400px] w-full p-5 space-y-3">
            <h3 className="text-[16px] font-semibold text-[#202124]">
              Demo Password Reset
            </h3>
            <p className="text-[13px] text-[#737373] leading-[18px]">
              This prototype operates in a self-contained demonstration environment. No external email server is configured. Please use the seeded credentials:
            </p>
            <div className="p-2.5 bg-[#F7F7F5] rounded-[6px] font-mono text-[12px] text-[#202124]">
              admin@srmist.edu.in / zhatka2026
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setForgotDialogOpen(false)}
                className="h-[32px] px-4 text-[13px] font-medium bg-[#3478D4] text-white rounded-[8px]"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer disclaimer */}
      <div className="py-4 text-center text-[11px] text-[#737373]">
        Simulated prototype — Team The Other Side · SRMIST
      </div>
    </div>
  );
};
